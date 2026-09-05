import { createServerClient } from '@supabase/ssr';
import type { NextRequest, NextResponse } from 'next/server';

import { env } from '@/lib/env';
import { supabaseCookieOptions } from './cookies';

/**
 * Supabase client khusus proxy (middleware). Menulis cookie hasil refresh
 * token ke response sekaligus meneruskannya ke request agar Server Component
 * di request yang sama sudah melihat sesi terbaru.
 */
export function createSupabaseProxyClient(request: NextRequest, response: NextResponse) {
  return createServerClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    cookieOptions: supabaseCookieOptions,
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        for (const { name, value, options } of cookiesToSet) {
          request.cookies.set(name, value);
          response.cookies.set(name, value, options);
        }
        // Response yang menulis cookie sesi tidak boleh di-cache CDN.
        for (const [key, value] of Object.entries(headers ?? {})) {
          response.headers.set(key, value);
        }
      },
    },
  });
}
