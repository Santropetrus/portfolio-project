-- ===========================================================================
-- The Matcha Kyoto Ops — Tahap 1
-- Migration 02: fungsi helper otorisasi, audit log otomatis, riwayat stok
--               otomatis, dan RPC stok opname yang atomik.
-- ===========================================================================

-- ---------------------------------------------------------------------------
-- Helper otorisasi.
--
-- SECURITY DEFINER dipakai supaya policy RLS pada `profiles` tidak memanggil
-- dirinya sendiri (infinite recursion). Fungsi dimiliki oleh pemilik tabel,
-- sehingga pembacaan di dalamnya tidak melewati policy `profiles`.
--
-- `search_path = ''` wajib: mencegah serangan search_path hijacking pada
-- fungsi SECURITY DEFINER. Karena itu semua nama objek ditulis lengkap.
-- ---------------------------------------------------------------------------
create or replace function public.current_profile_org()
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select p.organization_id
  from public.profiles p
  where p.id = (select auth.uid())
    and p.is_active
$$;

create or replace function public.current_profile_role()
returns public.user_role
language sql
stable
security definer
set search_path = ''
as $$
  select p.role
  from public.profiles p
  where p.id = (select auth.uid())
    and p.is_active
$$;

create or replace function public.is_manager()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(public.current_profile_role() in ('owner', 'admin'), false)
$$;

create or replace function public.is_owner()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(public.current_profile_role() = 'owner', false)
$$;

create or replace function public.default_organization_id()
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select o.id from public.organizations o where o.slug = 'the-matcha-kyoto'
$$;

-- ---------------------------------------------------------------------------
-- Penulis audit log. Tidak boleh dipanggil langsung oleh klien: hanya dipakai
-- oleh trigger SECURITY DEFINER di bawah, sehingga isi audit log tidak bisa
-- dipalsukan dari browser.
-- ---------------------------------------------------------------------------
create or replace function public.write_audit_log(
  p_organization_id uuid,
  p_action          text,
  p_entity_type     text,
  p_entity_id       uuid,
  p_metadata        jsonb default '{}'::jsonb
)
returns void
language sql
security definer
set search_path = ''
as $$
  insert into public.audit_logs (organization_id, user_id, action, entity_type, entity_id, metadata)
  values (
    p_organization_id,
    (select auth.uid()),
    p_action,
    p_entity_type,
    p_entity_id,
    coalesce(p_metadata, '{}'::jsonb)
  )
$$;

-- ---------------------------------------------------------------------------
-- Pembuatan profil otomatis untuk user baru.
--
-- CATATAN KEAMANAN: role SELALU dipaksa 'staff'. Role tidak pernah dibaca
-- dari user metadata, karena metadata bisa dikendalikan saat sign-up dan
-- akan menjadi celah privilege escalation. Owner pertama ditetapkan manual
-- lewat SQL editor (lihat README).
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_org  uuid;
  v_nama text;
begin
  begin
    v_org := nullif(btrim(coalesce(new.raw_user_meta_data ->> 'organization_id', '')), '')::uuid;
  exception when others then
    v_org := null;
  end;

  if v_org is null or not exists (select 1 from public.organizations o where o.id = v_org) then
    v_org := public.default_organization_id();
  end if;

  if v_org is null then
    raise exception 'Tidak ada organisasi terdaftar. Jalankan migration awal terlebih dahulu.';
  end if;

  v_nama := coalesce(
    nullif(btrim(coalesce(new.raw_user_meta_data ->> 'nama', '')), ''),
    nullif(btrim(coalesce(new.raw_user_meta_data ->> 'full_name', '')), ''),
    split_part(coalesce(new.email, 'pengguna'), '@', 1)
  );

  -- Buang karakter kontrol, batasi panjang, pastikan minimal 2 karakter.
  v_nama := left(regexp_replace(v_nama, '[[:cntrl:]]', '', 'g'), 120);
  if char_length(btrim(v_nama)) < 2 then
    v_nama := 'Pengguna Baru';
  end if;

  insert into public.profiles (id, organization_id, nama, role)
  values (new.id, v_org, v_nama, 'staff')
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Penjaga perubahan profil.
--
-- Mencegah privilege escalation: kolom sensitif (role, organization_id,
-- is_active) hanya boleh diubah oleh owner pada organisasi yang sama.
-- Berlaku walaupun policy RLS mengizinkan user memperbarui barisnya sendiri.
-- ---------------------------------------------------------------------------
create or replace function public.guard_profile_changes()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor       uuid := (select auth.uid());
  v_actor_role  public.user_role;
  v_owner_count integer;
  v_sensitif    boolean;
begin
  new.updated_at := now();

  v_sensitif :=
    new.role is distinct from old.role
    or new.organization_id is distinct from old.organization_id
    or new.is_active is distinct from old.is_active
    or new.id is distinct from old.id;

  -- v_actor NULL berarti eksekusi dari service_role / SQL editor / migration.
  -- Jalur itu memang dipakai untuk bootstrap owner pertama.
  if v_actor is null then
    if v_sensitif then
      perform public.write_audit_log(
        new.organization_id, 'profile.update_sensitive', 'profile', new.id,
        jsonb_build_object(
          'role_lama', old.role, 'role_baru', new.role,
          'aktif_lama', old.is_active, 'aktif_baru', new.is_active,
          'via', 'service_role'
        )
      );
    end if;
    return new;
  end if;

  if v_sensitif then
    select p.role into v_actor_role
    from public.profiles p
    where p.id = v_actor and p.is_active;

    if coalesce(v_actor_role, 'staff'::public.user_role) <> 'owner' then
      raise exception 'Hanya owner yang boleh mengubah role, organisasi, atau status akun.'
        using errcode = '42501';
    end if;

    if old.organization_id is distinct from (
      select p.organization_id from public.profiles p where p.id = v_actor
    ) then
      raise exception 'Tidak boleh mengubah profil di luar organisasi Anda.'
        using errcode = '42501';
    end if;

    if new.id is distinct from old.id then
      raise exception 'ID profil tidak boleh diubah.' using errcode = '42501';
    end if;

    if new.id = v_actor and new.role is distinct from old.role then
      raise exception 'Owner tidak dapat mengubah role akunnya sendiri.'
        using errcode = '42501';
    end if;

    -- Jangan sampai organisasi kehilangan owner terakhirnya.
    if old.role = 'owner' and new.role is distinct from 'owner' then
      select count(*) into v_owner_count
      from public.profiles p
      where p.organization_id = old.organization_id and p.role = 'owner' and p.is_active;

      if v_owner_count <= 1 then
        raise exception 'Organisasi harus memiliki minimal satu owner aktif.'
          using errcode = '42501';
      end if;
    end if;

    perform public.write_audit_log(
      new.organization_id, 'profile.update_sensitive', 'profile', new.id,
      jsonb_build_object(
        'role_lama', old.role, 'role_baru', new.role,
        'aktif_lama', old.is_active, 'aktif_baru', new.is_active
      )
    );
  end if;

  return new;
end;
$$;

drop trigger if exists profiles_guard_changes on public.profiles;
create trigger profiles_guard_changes
  before update on public.profiles
  for each row execute function public.guard_profile_changes();

-- ---------------------------------------------------------------------------
-- Riwayat stok + audit log otomatis untuk inventory_items.
--
-- Trigger ini adalah SATU-SATUNYA penulis stock_transactions, sehingga setiap
-- perubahan stok pasti punya jejak dan klien tidak bisa membuat riwayat palsu.
--
-- `app.stock_tipe` dan `app.stock_note` adalah setting transaction-local
-- (set_config(..., true)) yang diisi oleh RPC stok opname agar riwayatnya
-- tercatat sebagai 'penyesuaian' dengan catatan yang benar.
-- ---------------------------------------------------------------------------
create or replace function public.log_inventory_item_changes()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_tipe_override text := nullif(btrim(coalesce(current_setting('app.stock_tipe', true), '')), '');
  v_note_override text := nullif(btrim(coalesce(current_setting('app.stock_note', true), '')), '');
  v_tipe          public.stock_transaction_type;
begin
  if tg_op = 'INSERT' then
    perform public.write_audit_log(
      new.organization_id, 'inventory_item.create', 'inventory_item', new.id,
      jsonb_build_object(
        'nama', new.nama, 'kategori', new.kategori, 'satuan', new.satuan,
        'stok_saat_ini', new.stok_saat_ini, 'stok_minimum', new.stok_minimum
      )
    );

    if new.stok_saat_ini > 0 then
      insert into public.stock_transactions (
        organization_id, inventory_item_id, tipe, jumlah,
        stok_sebelum, stok_sesudah, catatan, created_by
      )
      values (
        new.organization_id, new.id, 'masuk', new.stok_saat_ini,
        0, new.stok_saat_ini,
        coalesce(v_note_override, 'Stok awal saat bahan didaftarkan'),
        (select auth.uid())
      );
    end if;

    return new;
  end if;

  if tg_op = 'UPDATE' then
    if new.stok_saat_ini is distinct from old.stok_saat_ini then
      v_tipe := coalesce(
        v_tipe_override,
        case when new.stok_saat_ini > old.stok_saat_ini then 'masuk' else 'keluar' end
      )::public.stock_transaction_type;

      insert into public.stock_transactions (
        organization_id, inventory_item_id, tipe, jumlah,
        stok_sebelum, stok_sesudah, catatan, created_by
      )
      values (
        new.organization_id, new.id, v_tipe,
        abs(new.stok_saat_ini - old.stok_saat_ini),
        old.stok_saat_ini, new.stok_saat_ini,
        coalesce(v_note_override, 'Perubahan stok melalui form inventori'),
        (select auth.uid())
      );
    end if;

    perform public.write_audit_log(
      new.organization_id, 'inventory_item.update', 'inventory_item', new.id,
      jsonb_build_object(
        'nama', new.nama,
        'stok_lama', old.stok_saat_ini,
        'stok_baru', new.stok_saat_ini,
        'stok_minimum_lama', old.stok_minimum,
        'stok_minimum_baru', new.stok_minimum,
        'harga_beli_lama', old.harga_beli,
        'harga_beli_baru', new.harga_beli
      )
    );

    return new;
  end if;

  if tg_op = 'DELETE' then
    perform public.write_audit_log(
      old.organization_id, 'inventory_item.delete', 'inventory_item', old.id,
      jsonb_build_object(
        'nama', old.nama, 'kategori', old.kategori,
        'stok_terakhir', old.stok_saat_ini, 'satuan', old.satuan
      )
    );
    return old;
  end if;

  return null;
end;
$$;

drop trigger if exists inventory_items_audit_ins on public.inventory_items;
create trigger inventory_items_audit_ins
  after insert on public.inventory_items
  for each row execute function public.log_inventory_item_changes();

drop trigger if exists inventory_items_audit_upd on public.inventory_items;
create trigger inventory_items_audit_upd
  after update on public.inventory_items
  for each row execute function public.log_inventory_item_changes();

drop trigger if exists inventory_items_audit_del on public.inventory_items;
create trigger inventory_items_audit_del
  after delete on public.inventory_items
  for each row execute function public.log_inventory_item_changes();

-- ---------------------------------------------------------------------------
-- Audit log untuk stok opname.
-- ---------------------------------------------------------------------------
create or replace function public.log_stock_opname()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform public.write_audit_log(
    new.organization_id, 'stock_opname.create', 'stock_opname', new.id,
    jsonb_build_object(
      'inventory_item_id', new.inventory_item_id,
      'stok_sistem', new.stok_sistem,
      'stok_fisik', new.stok_fisik,
      'selisih', new.selisih
    )
  );
  return new;
end;
$$;

drop trigger if exists stock_opnames_audit_ins on public.stock_opnames;
create trigger stock_opnames_audit_ins
  after insert on public.stock_opnames
  for each row execute function public.log_stock_opname();

-- ---------------------------------------------------------------------------
-- RPC stok opname — atomik.
--
-- Satu transaksi database melakukan: kunci baris bahan, catat stock_opnames,
-- perbarui stok, dan (lewat trigger) menulis stock_transactions + audit_logs.
-- Bila salah satu gagal, semuanya dibatalkan.
--
-- SECURITY INVOKER disengaja: RLS tetap berlaku sebagai lapisan otorisasi
-- terakhir, jadi fungsi ini tidak bisa dipakai untuk menembus policy.
-- ---------------------------------------------------------------------------
create or replace function public.catat_stok_opname(
  p_inventory_item_id uuid,
  p_stok_fisik        numeric,
  p_catatan           text default null
)
returns setof public.stock_opnames
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_item    public.inventory_items;
  v_opname  public.stock_opnames;
  v_catatan text := nullif(btrim(coalesce(p_catatan, '')), '');
  v_org     uuid;
begin
  if (select auth.uid()) is null then
    raise exception 'Sesi tidak valid.' using errcode = '42501';
  end if;

  if not public.is_manager() then
    raise exception 'Anda tidak memiliki izin untuk melakukan stok opname.'
      using errcode = '42501';
  end if;

  if p_stok_fisik is null or p_stok_fisik < 0 or p_stok_fisik > 9999999999 then
    raise exception 'Stok fisik harus berupa angka antara 0 dan 9.999.999.999.'
      using errcode = '22023';
  end if;

  if char_length(coalesce(v_catatan, '')) > 1000 then
    raise exception 'Catatan maksimal 1000 karakter.' using errcode = '22023';
  end if;

  v_org := public.current_profile_org();
  if v_org is null then
    raise exception 'Profil pengguna tidak aktif.' using errcode = '42501';
  end if;

  -- FOR UPDATE mengunci baris sampai transaksi selesai sehingga dua opname
  -- bersamaan pada bahan yang sama tidak saling menimpa.
  select * into v_item
  from public.inventory_items i
  where i.id = p_inventory_item_id
    and i.organization_id = v_org
  for update;

  if not found then
    raise exception 'Bahan baku tidak ditemukan.' using errcode = 'P0002';
  end if;

  perform set_config('app.stock_tipe', 'penyesuaian', true);
  perform set_config(
    'app.stock_note',
    case
      when v_catatan is null then 'Penyesuaian dari stok opname'
      else left('Stok opname: ' || v_catatan, 1000)
    end,
    true
  );

  insert into public.stock_opnames (
    organization_id, inventory_item_id, stok_sistem, stok_fisik, catatan, created_by
  )
  values (
    v_item.organization_id, v_item.id, v_item.stok_saat_ini, p_stok_fisik,
    v_catatan, (select auth.uid())
  )
  returning * into v_opname;

  update public.inventory_items
  set stok_saat_ini = p_stok_fisik
  where id = v_item.id;

  perform set_config('app.stock_tipe', '', true);
  perform set_config('app.stock_note', '', true);

  -- `setof` (walau hanya satu baris) membuat PostgREST mengembalikan array,
  -- sehingga `.single()` di sisi aplikasi berperilaku konsisten.
  return next v_opname;
  return;
end;
$$;

-- ---------------------------------------------------------------------------
-- Ringkasan dashboard dalam satu panggilan.
-- ---------------------------------------------------------------------------
create or replace function public.ringkasan_inventori()
returns table (
  total_bahan     bigint,
  stok_aman       bigint,
  stok_menipis    bigint,
  stok_habis      bigint,
  nilai_persediaan numeric
)
language sql
stable
security invoker
set search_path = ''
as $$
  select
    count(*)::bigint,
    count(*) filter (where i.status_stok = 'aman')::bigint,
    count(*) filter (where i.status_stok = 'menipis')::bigint,
    count(*) filter (where i.status_stok = 'habis')::bigint,
    coalesce(sum(i.stok_saat_ini * i.harga_beli), 0)::numeric
  from public.inventory_items i
$$;

-- ---------------------------------------------------------------------------
-- Hak eksekusi fungsi.
-- Default PostgreSQL memberi EXECUTE ke PUBLIC; kita cabut lalu berikan
-- hanya pada peran yang membutuhkan.
-- ---------------------------------------------------------------------------
revoke all on function public.current_profile_org() from public;
revoke all on function public.current_profile_role() from public;
revoke all on function public.is_manager() from public;
revoke all on function public.is_owner() from public;
revoke all on function public.default_organization_id() from public;
revoke all on function public.write_audit_log(uuid, text, text, uuid, jsonb) from public;
revoke all on function public.catat_stok_opname(uuid, numeric, text) from public;
revoke all on function public.ringkasan_inventori() from public;
revoke all on function public.set_updated_at() from public;
revoke all on function public.handle_new_user() from public;
revoke all on function public.guard_profile_changes() from public;
revoke all on function public.log_inventory_item_changes() from public;
revoke all on function public.log_stock_opname() from public;

grant execute on function public.current_profile_org() to authenticated;
grant execute on function public.current_profile_role() to authenticated;
grant execute on function public.is_manager() to authenticated;
grant execute on function public.is_owner() to authenticated;
grant execute on function public.catat_stok_opname(uuid, numeric, text) to authenticated;
grant execute on function public.ringkasan_inventori() to authenticated;

-- write_audit_log sengaja TIDAK diberikan ke authenticated/anon: hanya
-- trigger SECURITY DEFINER (dijalankan sebagai pemilik) yang memakainya.
