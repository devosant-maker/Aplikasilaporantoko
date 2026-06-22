import { Routes, Route } from "react-router";
import { Toaster } from "@/components/ui/sonner";
import AppLayout from "@/components/AppLayout";
import Dashboard from "@/pages/Dashboard";
import Transaksi from "@/pages/Transaksi";
import Operasional from "@/pages/Operasional";
import BarangMasukPage from "@/pages/BarangMasuk";
import LainLainPage from "@/pages/LainLainPage";
import Laporan from "@/pages/Laporan";
import ProdukPage from "@/pages/ProdukPage";
import MemberPage from "@/pages/MemberPage";
import Login from "@/pages/Login";
import NotFound from "@/pages/NotFound";

export default function App() {
  return (
    <>
      <Toaster position="top-right" richColors />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="*"
          element={
            <AppLayout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/transaksi" element={<Transaksi />} />
                <Route path="/operasional" element={<Operasional />} />
                <Route path="/barang-masuk" element={<BarangMasukPage />} />
                <Route path="/lain-lain" element={<LainLainPage />} />
                <Route path="/laporan" element={<Laporan />} />
                <Route path="/produk" element={<ProdukPage />} />
                <Route path="/member" element={<MemberPage />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </AppLayout>
          }
        />
      </Routes>
    </>
  );
}
