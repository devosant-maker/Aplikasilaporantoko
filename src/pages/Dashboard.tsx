import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  TrendingUp,
  Wallet,
  CreditCard,
  Receipt,
  Calendar,
} from "lucide-react";
import { Link } from "react-router";

function formatRupiah(n: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(n);
}

export default function Dashboard() {
  const now = new Date();
  const [bulan, setBulan] = useState(
    `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
  );

  const { data: stats, isLoading } = trpc.hariKerja.dashboard.useQuery({ bulan });
  const { data: daftarHari } = trpc.hariKerja.list.useQuery({ bulan });

  const bulanOptions = Array.from({ length: 12 }, (_, i) => {
    const m = String(i + 1).padStart(2, "0");
    return { value: `${now.getFullYear()}-${m}`, label: `${m}/${now.getFullYear()}` };
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">
            Ringkasan laporan bulanan
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-gray-400" />
          <Select value={bulan} onValueChange={setBulan}>
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {bulanOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Omzet"
          value={stats?.totalOmzet ?? 0}
          icon={TrendingUp}
          loading={isLoading}
          color="blue"
        />
        <StatCard
          title="Total Cash"
          value={stats?.totalCash ?? 0}
          icon={Wallet}
          loading={isLoading}
          color="green"
        />
        <StatCard
          title="Total Non-Tunai"
          value={stats?.totalNonTunai ?? 0}
          icon={CreditCard}
          loading={isLoading}
          color="purple"
        />
        <StatCard
          title="Operasional"
          value={stats?.totalOperasional ?? 0}
          icon={Receipt}
          loading={isLoading}
          color="orange"
        />
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Link to="/transaksi">
          <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2">
            <ShoppingCart className="h-5 w-5 text-blue-600" />
            <span className="text-sm">Input Penjualan</span>
          </Button>
        </Link>
        <Link to="/operasional">
          <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2">
            <Receipt className="h-5 w-5 text-orange-600" />
            <span className="text-sm">Input Operasional</span>
          </Button>
        </Link>
        <Link to="/barang-masuk">
          <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2">
            <Package className="h-5 w-5 text-green-600" />
            <span className="text-sm">Barang Masuk</span>
          </Button>
        </Link>
        <Link to="/laporan">
          <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2">
            <BarChart className="h-5 w-5 text-purple-600" />
            <span className="text-sm">Lihat Laporan</span>
          </Button>
        </Link>
      </div>

      {/* Recent days */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Data Harian Bulan Ini</CardTitle>
        </CardHeader>
        <CardContent>
          {daftarHari && daftarHari.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-gray-500">
                    <th className="pb-2 pr-4">Tanggal</th>
                    <th className="pb-2 pr-4 text-right">Omzet</th>
                    <th className="pb-2 pr-4 text-right">Cash</th>
                    <th className="pb-2 pr-4 text-right">Non-Tunai</th>
                    <th className="pb-2 text-right">Modal Akhir</th>
                  </tr>
                </thead>
                <tbody>
                  {daftarHari.slice(0, 10).map((h) => (
                    <tr key={h.id} className="border-b border-gray-50">
                      <td className="py-2 pr-4">{h.tanggal}</td>
                      <td className="py-2 pr-4 text-right font-medium">
                        {formatRupiah(Number(h.omzetTotal))}
                      </td>
                      <td className="py-2 pr-4 text-right text-green-600">
                        {formatRupiah(Number(h.totalBarangKeluarCash))}
                      </td>
                      <td className="py-2 pr-4 text-right text-purple-600">
                        {formatRupiah(Number(h.totalBarangKeluarNonTunai))}
                      </td>
                      <td className="py-2 text-right">
                        {formatRupiah(Number(h.saldoAkhirTotal))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">
              Belum ada data untuk bulan ini.{" "}
              <Link to="/transaksi" className="text-blue-600 hover:underline">
                Mulai input transaksi
              </Link>
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
  loading,
  color,
}: {
  title: string;
  value: number;
  icon: React.ElementType;
  loading: boolean;
  color: string;
}) {
  const colorClasses: Record<string, string> = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    purple: "bg-purple-50 text-purple-600",
    orange: "bg-orange-50 text-orange-600",
  };

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm text-gray-500">{title}</p>
            {loading ? (
              <Skeleton className="h-7 w-32" />
            ) : (
              <p className="text-xl font-bold">{formatRupiah(value)}</p>
            )}
          </div>
          <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Icons needed for quick actions
function ShoppingCart(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="8" cy="21" r="1" />
      <circle cx="19" cy="21" r="1" />
      <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
    </svg>
  );
}

function Package(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="m7.5 4.27 9 5.15" />
      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
      <path d="m3.3 7 8.7 5 8.7-5" />
      <path d="M12 22V12" />
    </svg>
  );
}

function BarChart(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M12 16v5" />
      <path d="M16 14v7" />
      <path d="M20 10v11" />
      <path d="M22 3 2 19" />
    </svg>
  );
}
