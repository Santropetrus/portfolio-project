import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import TataLetak from './components/TataLetak'
import Beranda from './pages/public/Beranda'
import Katalog from './pages/public/Katalog'
import DetailUmkm from './pages/public/DetailUmkm'
import ProfilBumdes from './pages/public/ProfilBumdes'
import TidakDitemukan from './pages/public/TidakDitemukan'

/* Panel admin dimuat terpisah (lazy). Pengunjung katalog — yang kebanyakan
   membuka lewat HP dengan kuota terbatas — tidak ikut mengunduh kode admin
   beserta pustaka kompresi gambarnya. */
const RuteAdmin = lazy(() => import('./components/admin/RuteAdmin'))
const TataLetakAdmin = lazy(() => import('./components/admin/TataLetakAdmin'))
const Login = lazy(() => import('./pages/admin/Login'))
const Dashboard = lazy(() => import('./pages/admin/Dashboard'))
const KelolaUmkm = lazy(() => import('./pages/admin/KelolaUmkm'))
const EditUmkm = lazy(() => import('./pages/admin/EditUmkm'))
const KelolaProfilBumdes = lazy(() => import('./pages/admin/KelolaProfilBumdes'))

function Menunggu() {
  return (
    <div className="flex min-h-screen items-center justify-center px-5">
      <p className="font-body text-[0.9rem] text-wood-dark/60">Memuat panel admin&hellip;</p>
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      {/* Halaman publik (tanpa login) */}
      <Route element={<TataLetak />}>
        <Route path="/" element={<Beranda />} />
        <Route path="/katalog" element={<Katalog />} />
        <Route path="/umkm/:slug" element={<DetailUmkm />} />
        <Route path="/profil-bumdes" element={<ProfilBumdes />} />
        <Route path="*" element={<TidakDitemukan />} />
      </Route>

      {/* Panel admin (wajib login saat Supabase tersambung) */}
      <Route
        path="/admin/login"
        element={
          <Suspense fallback={<Menunggu />}>
            <Login />
          </Suspense>
        }
      />
      <Route
        path="/admin"
        element={
          <Suspense fallback={<Menunggu />}>
            <RuteAdmin>
              <TataLetakAdmin />
            </RuteAdmin>
          </Suspense>
        }
      >
        <Route
          index
          element={
            <Suspense fallback={<Menunggu />}>
              <Dashboard />
            </Suspense>
          }
        />
        <Route
          path="umkm"
          element={
            <Suspense fallback={<Menunggu />}>
              <KelolaUmkm />
            </Suspense>
          }
        />
        <Route
          path="umkm/:id"
          element={
            <Suspense fallback={<Menunggu />}>
              <EditUmkm />
            </Suspense>
          }
        />
        <Route
          path="profil-bumdes"
          element={
            <Suspense fallback={<Menunggu />}>
              <KelolaProfilBumdes />
            </Suspense>
          }
        />
      </Route>
    </Routes>
  )
}
