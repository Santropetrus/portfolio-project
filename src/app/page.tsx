import { redirect } from 'next/navigation';

import { ambilSesi } from '@/lib/auth/session';

export default async function Beranda() {
  const sesi = await ambilSesi();
  redirect(sesi ? '/dashboard' : '/masuk');
}
