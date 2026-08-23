import { Routes, Route } from 'react-router-dom'
import TataLetak from './components/TataLetak'
import Beranda from './pages/public/Beranda'
import Katalog from './pages/public/Katalog'
import DetailUmkm from './pages/public/DetailUmkm'
import ProfilBumdes from './pages/public/ProfilBumdes'
import TidakDitemukan from './pages/public/TidakDitemukan'

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

      {/* Rute /admin/* menyusul di tahap berikutnya */}
    </Routes>
  )
}
