-- ===========================================================================
-- The Matcha Kyoto Ops — Tahap 2
-- Migration 04: alur persetujuan stok opname, pencatatan stok masuk/keluar,
--               dan dukungan pengelolaan anggota tim.
--
-- Tiga hal yang berubah dibanding Tahap 1:
--
--  1. Stok opname punya status. Staff kini boleh MENGAJUKAN hasil hitungan
--     sebagai draft; stok baru berubah setelah owner/admin menyetujui.
--     Ini melunasi asumsi Tahap 1 yang menutup opname sepenuhnya dari staff.
--
--  2. Perubahan stok punya jalurnya sendiri. Sebelumnya stok hanya bisa
--     diubah lewat form edit inventori, yang mencampur "memperbaiki data"
--     dengan "mencatat kejadian". Sekarang ada RPC khusus untuk penerimaan
--     barang dan pemakaian.
--
--  3. Perubahan role dan status akun tetap dijaga trigger yang sama, tetapi
--     kini punya antarmuka. Tidak ada policy baru yang dibutuhkan.
-- ===========================================================================

-- ---------------------------------------------------------------------------
-- 1. Status stok opname
-- ---------------------------------------------------------------------------
do $$
begin
  if not exists (
    select 1 from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where t.typname = 'opname_status' and n.nspname = 'public'
  ) then
    create type public.opname_status as enum ('draft', 'disetujui', 'ditolak');
  end if;
end
$$;

-- Baris lama berasal dari alur Tahap 1 yang langsung menyesuaikan stok,
-- jadi default 'disetujui' membuat riwayat yang sudah ada tetap benar.
alter table public.stock_opnames
  add column if not exists status public.opname_status not null default 'disetujui',
  add column if not exists ditinjau_oleh uuid references auth.users (id) on delete set null,
  add column if not exists ditinjau_pada timestamptz,
  add column if not exists catatan_peninjau text check (char_length(catatan_peninjau) <= 1000);

create index if not exists stock_opnames_org_status_idx
  on public.stock_opnames (organization_id, status, created_at desc);

-- ---------------------------------------------------------------------------
-- 2. Policy baru untuk stok opname
-- ---------------------------------------------------------------------------

-- Staff boleh mengajukan, tetapi HANYA sebagai draft dan hanya atas namanya
-- sendiri. Baris draft tidak menyentuh stok sama sekali.
drop policy if exists "stock_opnames_insert_manager" on public.stock_opnames;
drop policy if exists "stock_opnames_insert_anggota" on public.stock_opnames;
create policy "stock_opnames_insert_anggota"
  on public.stock_opnames
  for insert
  to authenticated
  with check (
    organization_id = public.current_profile_org()
    and created_by = (select auth.uid())
    and (
      -- Owner/admin boleh mencatat langsung sebagai disetujui.
      public.is_manager()
      -- Staff hanya boleh draft.
      or status = 'draft'
    )
  );

-- Hanya owner/admin yang boleh meninjau, dan hanya baris yang masih draft.
-- Hasil tinjauan bersifat final: baris disetujui/ditolak tidak bisa diubah lagi.
drop policy if exists "stock_opnames_update_manager" on public.stock_opnames;
create policy "stock_opnames_update_manager"
  on public.stock_opnames
  for update
  to authenticated
  using (
    organization_id = public.current_profile_org()
    and public.is_manager()
    and status = 'draft'
  )
  with check (
    organization_id = public.current_profile_org()
    and public.is_manager()
  );

grant update on public.stock_opnames to authenticated;

-- ---------------------------------------------------------------------------
-- 3. Mengajukan stok opname
--
-- Staff  -> tersimpan sebagai draft, stok tidak berubah.
-- Manajer -> langsung disetujui dan stok disesuaikan saat itu juga.
-- ---------------------------------------------------------------------------
drop function if exists public.catat_stok_opname(uuid, numeric, text);

create or replace function public.ajukan_stok_opname(
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
  v_manajer boolean;
begin
  if (select auth.uid()) is null then
    raise exception 'Sesi tidak valid.' using errcode = '42501';
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

  v_manajer := public.is_manager();

  -- Manajer mengunci barisnya karena stok akan langsung berubah. Staff cukup
  -- membaca stok sistem sebagai angka pembanding pada draft.
  if v_manajer then
    select * into v_item
    from public.inventory_items i
    where i.id = p_inventory_item_id and i.organization_id = v_org
    for update;
  else
    select * into v_item
    from public.inventory_items i
    where i.id = p_inventory_item_id and i.organization_id = v_org;
  end if;

  if not found then
    raise exception 'Bahan baku tidak ditemukan.' using errcode = 'P0002';
  end if;

  insert into public.stock_opnames (
    organization_id, inventory_item_id, stok_sistem, stok_fisik,
    catatan, created_by, status, ditinjau_oleh, ditinjau_pada
  )
  values (
    v_item.organization_id, v_item.id, v_item.stok_saat_ini, p_stok_fisik,
    v_catatan, (select auth.uid()),
    case when v_manajer then 'disetujui'::public.opname_status
         else 'draft'::public.opname_status end,
    case when v_manajer then (select auth.uid()) else null end,
    case when v_manajer then now() else null end
  )
  returning * into v_opname;

  if v_manajer then
    perform set_config('app.stock_tipe', 'penyesuaian', true);
    perform set_config(
      'app.stock_note',
      case when v_catatan is null then 'Penyesuaian dari stok opname'
           else left('Stok opname: ' || v_catatan, 1000) end,
      true
    );

    update public.inventory_items
    set stok_saat_ini = p_stok_fisik
    where id = v_item.id;

    perform set_config('app.stock_tipe', '', true);
    perform set_config('app.stock_note', '', true);
  end if;

  return next v_opname;
  return;
end;
$$;

-- ---------------------------------------------------------------------------
-- 4. Meninjau draft stok opname
--
-- Saat disetujui, stok "sebelum" dibaca ULANG dari kondisi terkini, bukan dari
-- angka yang tercatat waktu draft dibuat. Stok bisa saja berubah di antara
-- pengajuan dan persetujuan; riwayat harus mencerminkan perubahan yang benar
-- terjadi. Kolom stok_sistem sengaja dibiarkan apa adanya sebagai catatan
-- historis: itulah angka yang dilihat penghitung saat mencatat.
-- ---------------------------------------------------------------------------
create or replace function public.tinjau_stok_opname(
  p_opname_id        uuid,
  p_setujui          boolean,
  p_catatan_peninjau text default null
)
returns setof public.stock_opnames
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_opname  public.stock_opnames;
  v_cek     public.stock_opnames;
  v_item    public.inventory_items;
  v_catatan text := nullif(btrim(coalesce(p_catatan_peninjau, '')), '');
  v_org     uuid;
begin
  if (select auth.uid()) is null then
    raise exception 'Sesi tidak valid.' using errcode = '42501';
  end if;

  if not public.is_manager() then
    raise exception 'Hanya owner atau admin yang dapat meninjau stok opname.'
      using errcode = '42501';
  end if;

  if p_setujui is null then
    raise exception 'Keputusan tinjauan wajib diisi.' using errcode = '22023';
  end if;

  v_org := public.current_profile_org();

  -- Dua pembacaan yang disengaja.
  --
  -- Pertama tanpa kunci, hanya lewat policy SELECT, supaya pesan errornya
  -- tepat. Policy UPDATE membatasi baris ke status 'draft', jadi SELECT FOR
  -- UPDATE pada baris yang sudah ditinjau mengembalikan nol baris — pesannya
  -- akan berbunyi "tidak ditemukan", padahal datanya ada.
  select * into v_cek
  from public.stock_opnames o
  where o.id = p_opname_id and o.organization_id = v_org;

  if not found then
    raise exception 'Data stok opname tidak ditemukan.' using errcode = 'P0002';
  end if;

  if v_cek.status <> 'draft' then
    raise exception 'Stok opname ini sudah ditinjau sebelumnya.' using errcode = '22023';
  end if;

  -- Kedua dengan kunci. Ini yang menutup balapan: bila dua manajer menekan
  -- setujui bersamaan, hanya satu yang mendapat barisnya. Tanpa kunci ini
  -- keduanya lolos pemeriksaan di atas dan penyesuaian stok diterapkan dua
  -- kali.
  select * into v_opname
  from public.stock_opnames o
  where o.id = p_opname_id and o.organization_id = v_org and o.status = 'draft'
  for update;

  if not found then
    raise exception 'Stok opname ini baru saja ditinjau oleh orang lain.'
      using errcode = '22023';
  end if;

  if p_setujui then
    select * into v_item
    from public.inventory_items i
    where i.id = v_opname.inventory_item_id
    for update;

    if not found then
      raise exception 'Bahan baku sudah dihapus.' using errcode = 'P0002';
    end if;

    perform set_config('app.stock_tipe', 'penyesuaian', true);
    perform set_config(
      'app.stock_note',
      left('Stok opname disetujui' || coalesce(': ' || v_opname.catatan, ''), 1000),
      true
    );

    update public.inventory_items
    set stok_saat_ini = v_opname.stok_fisik
    where id = v_item.id;

    perform set_config('app.stock_tipe', '', true);
    perform set_config('app.stock_note', '', true);
  end if;

  update public.stock_opnames
  set status = case when p_setujui then 'disetujui'::public.opname_status
                    else 'ditolak'::public.opname_status end,
      ditinjau_oleh = (select auth.uid()),
      ditinjau_pada = now(),
      catatan_peninjau = v_catatan
  where id = v_opname.id
  returning * into v_opname;

  return next v_opname;
  return;
end;
$$;

-- ---------------------------------------------------------------------------
-- 5. Pencatatan stok masuk dan keluar
--
-- Sebelumnya satu-satunya cara mengubah stok adalah form edit inventori.
-- Itu mencampur dua hal yang berbeda: memperbaiki data yang salah ketik, dan
-- mencatat kejadian nyata (barang datang, bahan terpakai). Dua fungsi ini
-- memisahkannya, dan keduanya mengunci baris sehingga dua pencatatan
-- bersamaan tidak saling menimpa.
-- ---------------------------------------------------------------------------
create or replace function public.catat_pergerakan_stok(
  p_inventory_item_id uuid,
  p_tipe              text,
  p_jumlah            numeric,
  p_catatan           text default null,
  p_harga_beli        numeric default null
)
returns setof public.stock_transactions
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_item     public.inventory_items;
  v_transaksi public.stock_transactions;
  v_catatan  text := nullif(btrim(coalesce(p_catatan, '')), '');
  v_org      uuid;
  v_stok_baru numeric;
begin
  if (select auth.uid()) is null then
    raise exception 'Sesi tidak valid.' using errcode = '42501';
  end if;

  if not public.is_manager() then
    raise exception 'Anda tidak memiliki izin untuk mengubah stok.'
      using errcode = '42501';
  end if;

  if p_tipe not in ('masuk', 'keluar') then
    raise exception 'Tipe pergerakan harus "masuk" atau "keluar".' using errcode = '22023';
  end if;

  if p_jumlah is null or p_jumlah <= 0 or p_jumlah > 9999999999 then
    raise exception 'Jumlah harus lebih besar dari 0.' using errcode = '22023';
  end if;

  if char_length(coalesce(v_catatan, '')) > 1000 then
    raise exception 'Catatan maksimal 1000 karakter.' using errcode = '22023';
  end if;

  if p_harga_beli is not null and (p_harga_beli < 0 or p_harga_beli > 999999999999) then
    raise exception 'Harga beli tidak valid.' using errcode = '22023';
  end if;

  v_org := public.current_profile_org();

  select * into v_item
  from public.inventory_items i
  where i.id = p_inventory_item_id and i.organization_id = v_org
  for update;

  if not found then
    raise exception 'Bahan baku tidak ditemukan.' using errcode = 'P0002';
  end if;

  v_stok_baru := case when p_tipe = 'masuk'
                      then v_item.stok_saat_ini + p_jumlah
                      else v_item.stok_saat_ini - p_jumlah end;

  if v_stok_baru < 0 then
    raise exception 'Stok tidak mencukupi. Tersisa % , diminta %.',
      v_item.stok_saat_ini, p_jumlah using errcode = '22023';
  end if;

  perform set_config('app.stock_tipe', p_tipe, true);
  perform set_config(
    'app.stock_note',
    coalesce(v_catatan, case when p_tipe = 'masuk' then 'Penerimaan barang'
                             else 'Pemakaian bahan' end),
    true
  );

  update public.inventory_items
  set stok_saat_ini = v_stok_baru,
      -- Harga beli terbaru hanya diperbarui pada penerimaan barang, dan hanya
      -- bila memang diisi. Pemakaian tidak pernah mengubah harga.
      harga_beli = case when p_tipe = 'masuk' and p_harga_beli is not null
                        then p_harga_beli else harga_beli end
  where id = v_item.id;

  perform set_config('app.stock_tipe', '', true);
  perform set_config('app.stock_note', '', true);

  select * into v_transaksi
  from public.stock_transactions t
  where t.inventory_item_id = v_item.id
  order by t.created_at desc
  limit 1;

  return next v_transaksi;
  return;
end;
$$;

-- ---------------------------------------------------------------------------
-- 6. Ringkasan untuk dashboard Tahap 2
--
-- Kolom balikannya bertambah (opname_menunggu), dan PostgreSQL tidak
-- mengizinkan CREATE OR REPLACE mengubah bentuk balikan fungsi, jadi versi
-- lamanya harus dibuang lebih dulu.
-- ---------------------------------------------------------------------------
drop function if exists public.ringkasan_inventori();

create or replace function public.ringkasan_inventori()
returns table (
  total_bahan      bigint,
  stok_aman        bigint,
  stok_menipis     bigint,
  stok_habis       bigint,
  nilai_persediaan numeric,
  opname_menunggu  bigint
)
language sql
stable
security invoker
set search_path = ''
as $$
  select
    (select count(*) from public.inventory_items)::bigint,
    (select count(*) from public.inventory_items where status_stok = 'aman')::bigint,
    (select count(*) from public.inventory_items where status_stok = 'menipis')::bigint,
    (select count(*) from public.inventory_items where status_stok = 'habis')::bigint,
    (select coalesce(sum(stok_saat_ini * harga_beli), 0) from public.inventory_items)::numeric,
    (select count(*) from public.stock_opnames where status = 'draft')::bigint
$$;

-- ---------------------------------------------------------------------------
-- 7. Audit log untuk tinjauan opname
-- ---------------------------------------------------------------------------
create or replace function public.log_tinjauan_opname()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.status is distinct from old.status then
    perform public.write_audit_log(
      new.organization_id,
      case when new.status = 'disetujui' then 'stock_opname.approve'
           else 'stock_opname.reject' end,
      'stock_opname',
      new.id,
      jsonb_build_object(
        'inventory_item_id', new.inventory_item_id,
        'stok_sistem', new.stok_sistem,
        'stok_fisik', new.stok_fisik,
        'selisih', new.selisih,
        'catatan_peninjau', new.catatan_peninjau
      )
    );
  end if;
  return new;
end;
$$;

drop trigger if exists stock_opnames_audit_upd on public.stock_opnames;
create trigger stock_opnames_audit_upd
  after update on public.stock_opnames
  for each row execute function public.log_tinjauan_opname();

-- ---------------------------------------------------------------------------
-- 8. Hak eksekusi
-- ---------------------------------------------------------------------------
revoke all on function public.ajukan_stok_opname(uuid, numeric, text) from public;
revoke all on function public.tinjau_stok_opname(uuid, boolean, text) from public;
revoke all on function public.catat_pergerakan_stok(uuid, text, numeric, text, numeric) from public;
revoke all on function public.ringkasan_inventori() from public;
revoke all on function public.log_tinjauan_opname() from public;

grant execute on function public.ajukan_stok_opname(uuid, numeric, text) to authenticated;
grant execute on function public.tinjau_stok_opname(uuid, boolean, text) to authenticated;
grant execute on function public.catat_pergerakan_stok(uuid, text, numeric, text, numeric) to authenticated;
grant execute on function public.ringkasan_inventori() to authenticated;
