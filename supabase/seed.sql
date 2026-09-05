-- ===========================================================================
-- The Matcha Kyoto Ops — Seed data OPSIONAL untuk demo.
--
-- Jalankan lewat Supabase SQL Editor (peran postgres) atau `supabase db reset`.
-- Aman dijalankan berkali-kali: memakai ON CONFLICT DO NOTHING.
--
-- Seed ini TIDAK membuat user. Buat user lewat Supabase Auth, lalu tetapkan
-- role owner sesuai instruksi di README.
-- ===========================================================================

do $$
declare
  v_org uuid;
begin
  select id into v_org from public.organizations where slug = 'the-matcha-kyoto';

  if v_org is null then
    raise exception 'Organisasi the-matcha-kyoto belum ada. Jalankan migration terlebih dahulu.';
  end if;

  insert into public.inventory_items
    (organization_id, nama, kategori, satuan, stok_saat_ini, stok_minimum, harga_beli, supplier, tanggal_kedaluwarsa, catatan)
  values
    (v_org, 'Matcha Ceremonial Grade Uji', 'matcha_powder',   'gram',   1200, 500,   1450, 'Uji Tea Trading',        current_date + 180, 'Dipakai untuk menu signature.'),
    (v_org, 'Matcha Culinary Grade',       'matcha_powder',   'gram',   3000, 1000,   620, 'Uji Tea Trading',        current_date + 240, 'Untuk latte dan campuran es.'),
    (v_org, 'Hojicha Powder',              'matcha_powder',   'gram',    400, 500,    780, 'Kyoto Leaf Supply',      current_date + 200, 'Stok menipis, segera restock.'),
    (v_org, 'Susu UHT Full Cream 1L',      'susu',            'liter',    48,  24,  17500, 'Distributor Sejahtera',  current_date + 45,  null),
    (v_org, 'Susu Oat Barista 1L',         'susu',            'liter',     6,  12,  38000, 'Plant Based Nusantara',  current_date + 90,  'Permintaan naik untuk menu vegan.'),
    (v_org, 'Susu Kental Manis',           'susu',            'kaleng',   10,   6,  11500, 'Distributor Sejahtera',  current_date + 300, null),
    (v_org, 'Gula Aren Cair',              'gula_sirup',      'liter',    14,   6,  42000, 'Aren Nusantara',         current_date + 120, 'Best seller untuk matcha aren.'),
    (v_org, 'Simple Syrup',                'gula_sirup',      'liter',     0,   4,  22000, 'Produksi Internal',      current_date + 30,  'Habis, perlu produksi ulang.'),
    (v_org, 'Sirup Vanila',                'gula_sirup',      'botol',     3,   3,  68000, 'Bakers Depot',           current_date + 210, null),
    (v_org, 'Boba Tapioka',                'topping',         'kg',        8,   5,  46000, 'Boba Prima',             current_date + 60,  null),
    (v_org, 'Grass Jelly',                 'topping',         'kg',        2,   4,  38000, 'Boba Prima',             current_date + 40,  'Menipis.'),
    (v_org, 'Whipping Cream Bubuk',        'topping',         'gram',   2500, 1000,   210, 'Bakers Depot',           current_date + 150, null),
    (v_org, 'Cup Plastik 16 oz',           'cup_kemasan',     'pcs',    1400, 500,    850, 'Kemasan Jaya',           null,               null),
    (v_org, 'Cup Plastik 22 oz',           'cup_kemasan',     'pcs',     320, 500,    980, 'Kemasan Jaya',           null,               'Perlu restock sebelum akhir pekan.'),
    (v_org, 'Tutup Cup Dome',              'cup_kemasan',     'pcs',    1600, 600,    320, 'Kemasan Jaya',           null,               null),
    (v_org, 'Paper Bag Takeaway',          'cup_kemasan',     'pcs',       0, 200,    1250, 'Kemasan Jaya',          null,               'Habis total.'),
    (v_org, 'Sedotan Boba Kertas',         'sedotan',         'pcs',     900, 400,    290, 'Eco Straw ID',           null,               null),
    (v_org, 'Sedotan Reguler',             'sedotan',         'pcs',     250, 400,    180, 'Eco Straw ID',           null,               'Menipis.'),
    (v_org, 'Es Batu Kristal',             'bahan_pendukung', 'kg',       40,  20,   4500, 'Ice Fresh',              null,               'Restock harian.'),
    (v_org, 'Air Mineral Galon',           'bahan_pendukung', 'galon',     6,   4,  22000, 'Tirta Segar',            null,               null),
    (v_org, 'Tisu Meja',                   'bahan_pendukung', 'pack',     18,   8,  14500, 'Grosir Harian',          null,               null)
  on conflict do nothing;
end
$$;
