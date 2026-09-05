import 'server-only';

import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

import { env } from '@/lib/env';
import { supabaseCookieOptions } from './cookies';

/**
 * Supabase client untuk Server Component, Server Action, dan Route Handler.
 *
 * Selalu memakai anon key, jadi seluruh query tetap tunduk pada Row Level
 * Security. Service role key tidak pernah dipakai di Tahap 1.
 *
 * Client baru dibuat per request — jangan pernah membagikannya antar request.
 */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    cookieOptions: supabaseCookieOptions,
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Server Component tidak boleh menulis cookie. Perpanjangan sesi
          // sudah ditangani oleh src/proxy.ts, jadi kondisi ini aman diabaikan.
        }
      },
    },
  });
}
