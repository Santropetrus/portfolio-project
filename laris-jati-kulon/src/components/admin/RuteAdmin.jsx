import { Navigate, useLocation } from 'react-router-dom'
import { useSesi } from '../../lib/auth'

/** Menjaga seluruh /admin: tanpa sesi login, dilempar ke halaman masuk */
export default function RuteAdmin({ children }) {
  const { masuk, memuat } = useSesi()
  const lokasi = useLocation()

  if (memuat) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="font-body text-[0.9rem] text-wood-dark/60">Memeriksa sesi&hellip;</p>
      </div>
    )
  }

  if (!masuk) {
    return <Navigate to="/admin/login" replace state={{ dari: lokasi.pathname }} />
  }

  return children
}
