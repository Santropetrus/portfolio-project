import type { CookieOptionsWithName } from '@supabase/ssr';

/**
 * Opsi cookie sesi.
 *
 * `httpOnly: true` disengaja. Aplikasi ini TIDAK pernah memakai Supabase
 * client di browser: semua query berjalan di server (Server Component dan
 * Server Action). Dengan begitu access token tidak pernah bisa dibaca oleh
 * JavaScript, sehingga satu bug XSS tidak otomatis berarti pencurian sesi.
 */
export const supabaseCookieOptions: CookieOptionsWithName = {
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  path: '/',
};
