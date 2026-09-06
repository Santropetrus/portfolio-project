import 'server-only';

import { cache } from 'react';
import { redirect } from 'next/navigation';
import type { SupabaseClient } from '@supabase/supabase-js';

import { isSupabaseConfigured } from '@/lib/env';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { Profile, UserRole } from '@/types/database';

export const RUTE_LOGIN = '/masuk';

export interface KonteksSesi {
  userId: string;
  email: string | null;
  profile: Profile;
  supabase: SupabaseClient;
}

/**
 * Mengambil sesi aktif beserta profilnya.
 *
 * `supabase.auth.getUser()` sengaja dipakai (bukan `getSession()`) karena
 * getUser memverifikasi token ke server Supabase, sedangkan getSession hanya
 * membaca cookie yang bisa saja dipalsukan.
 *
 * Dibungkus `cache()` agar satu render tidak memanggil berkali-kali.
 */
export const ambilSesi = cache(async (): Promise<KonteksSesi | null> => {
  // Jaring pengaman untuk Server Action yang dipanggil tanpa melewati penjaga
  // di halaman: tanpa konfigurasi, anggap saja tidak ada sesi.
  if (!isSupabaseConfigured) return null;

  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) return null;

  const { data: profile, error: errorProfil } = await supabase
    .from('profiles')
    .select('id, organization_id, nama, role, is_active, created_at, updated_at')
    .eq('id', user.id)
    .maybeSingle<Profile>();

  if (errorProfil || !profile || !profile.is_active) return null;

  return { userId: user.id, email: user.email ?? null, profile, supabase };
});

/**
 * Penjaga untuk halaman dan Server Action.
 *
 * Pemeriksaan ini WAJIB ada walaupun proxy (middleware) sudah melakukan
 * pengalihan. Middleware bisa dilewati pada beberapa kelas serangan, jadi
 * otorisasi sebenarnya harus berada sedekat mungkin dengan data.
 */
export async function wajibSesi(): Promise<KonteksSesi> {
  const sesi = await ambilSesi();
  if (!sesi) redirect(RUTE_LOGIN);
  return sesi;
}

export function apakahManajer(role: UserRole): boolean {
  return role === 'owner' || role === 'admin';
}

export function apakahOwner(role: UserRole): boolean {
  return role === 'owner';
}

/** Penjaga untuk aksi yang hanya boleh dilakukan owner/admin. */
export async function wajibManajer(): Promise<KonteksSesi> {
  const sesi = await wajibSesi();
  if (!apakahManajer(sesi.profile.role)) {
    throw new GagalOtorisasi('Anda tidak memiliki izin untuk melakukan aksi ini.');
  }
  return sesi;
}

export class GagalOtorisasi extends Error {
  constructor(message = 'Akses ditolak.') {
    super(message);
    this.name = 'GagalOtorisasi';
  }
}
