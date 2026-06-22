import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function formatRupiah(n: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(n);
}

export default function Laporan() {
  const now = new Date();
  const [bulan, setBulan] = useState(
    `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
  );
  const [tanggalDetail, setTanggalDetail] = useState("");

  const { data: daftarHari } = trpc.hariKerja.list.useQuery({ bulan });
  const { data: detailHari } = trpc.hariKerja.byTanggal.useQuery(
    { tanggal: tanggalDetail },
    { enabled: !!tanggalDetail }
  );

  const bulanOptions = Array.from({ length: 12 }, (_, i) => {
    const m = String(i + 1).padStart(2, "0");
    return { value: `${now.getFullYear()}-${m}`, label: `${m}/${now.getFullYear()}` };
  });

  const totalOmzet = daftarHari?.reduce((s, h) => s + Number(h.omzetTotal), 0) ?? 0;
  const totalCash = daftarHari?.reduce((s, h) => s + Number(h.totalBarangKeluarCash), 0) ?? 0;
  const totalNonTunai = daftarHari?.reduce((s, h) => s + Number(h.totalBarangKeluarNonTunai), 0) ?? 0;
  const totalOp = daftarHari?.reduce((s, h) => s + Number(h.totalOperasional), 0) ?? 0;
  const totalSetor = daftarHari?.reduce((s, h) => s + Number(h.setorTunai), 0) ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Laporan</h1>
          <p className="text-sm text-gray-500">Rekapitulasi laporan harian</p>
        </div>
        <div className="flex items-center gap-2">
          <Label className="text-sm">Bulan:</Label>
          <Select value={bulan} onValueChange={setBulan}>
            <SelectTrigger className="w-[140px]">
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

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <SummaryBox label="Total Omzet" value={totalOmzet} />
        <SummaryBox label="Total Cash" value={totalCash} color="text-green-600" />
        <SummaryBox label="Non-Tunai" value={totalNonTunai} color="text-purple-600" />
        <SummaryBox label="Operasional" value={totalOp} color="text-orange-600" />
        <SummaryBox label="Setor Tunai" value={totalSetor} color="text-blue-600" />
      </div>

      {/* Daily table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Laporan Harian - {bulan}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-gray-500 text-xs">
                  <th className="pb-2 pr-2">Tanggal</th>
                  <th className="pb-2 pr-2 text-right">Modal</th>
                  <th className="pb-2 pr-2 text-right">Keluar NT</th>
                  <th className="pb-2 pr-2 text-right">Keluar C</th>
                  <th className="pb-2 pr-2 text-right">Omzet</th>
                  <th className="pb-2 pr-2 text-right">Ops</th>
                  <th className="pb-2 pr-2 text-right">Saldo Akhir</th>
                  <th className="pb-2">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {daftarHari?.map((h) => (
                  <tr key={h.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-2 pr-2 font-medium">{h.tanggal}</td>
                    <td className="py-2 pr-2 text-right">{formatRupiah(Number(h.sisaModal))}</td>
                    <td className="py-2 pr-2 text-right text-purple-600">
                      {formatRupiah(Number(h.totalBarangKeluarNonTunai))}
                    </td>
                    <td className="py-2 pr-2 text-right text-green-600">
                      {formatRupiah(Number(h.totalBarangKeluarCash))}
                    </td>
                    <td className="py-2 pr-2 text-right font-semibold">
                      {formatRupiah(Number(h.omzetTotal))}
                    </td>
                    <td className="py-2 pr-2 text-right">{formatRupiah(Number(h.totalOperasional))}</td>
                    <td className="py-2 pr-2 text-right">{formatRupiah(Number(h.saldoAkhirTotal))}</td>
                    <td className="py-2">
                      <Button variant="ghost" size="sm" onClick={() => setTanggalDetail(h.tanggal)}>
                        Detail
                      </Button>
                    </td>
                  </tr>
                ))}
                {(!daftarHari || daftarHari.length === 0) && (
                  <tr><td colSpan={8} className="py-8 text-center text-gray-400">Belum ada data</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Detail Hari */}
      {detailHari && (
        <Card className="border-blue-200">
          <CardHeader>
            <CardTitle className="text-lg">Detail: {detailHari.tanggal}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
              <div className="bg-gray-50 p-3 rounded">
                <p className="text-gray-500">Sisa Modal</p>
                <p className="font-bold">{formatRupiah(Number(detailHari.sisaModal))}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <p className="text-gray-500">Total Omzet</p>
                <p className="font-bold">{formatRupiah(Number(detailHari.omzetTotal))}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <p className="text-gray-500">Operasional</p>
                <p className="font-bold">{formatRupiah(Number(detailHari.totalOperasional))}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <p className="text-gray-500">Saldo Akhir</p>
                <p className="font-bold">{formatRupiah(Number(detailHari.saldoAkhirTotal))}</p>
              </div>
            </div>

            {detailHari.barangKeluar.length > 0 && (
              <div>
                <h4 className="font-semibold text-sm mb-2">Barang Keluar:</h4>
                <table className="w-full text-sm">
                  <thead><tr className="border-b text-gray-500"><th className="text-left pr-2">No</th><th className="text-left pr-2">Barang</th><th className="text-right pr-2">Qty</th><th className="text-right pr-2">Non-Tunai</th><th className="text-right">Cash</th></tr></thead>
                  <tbody>
                    {detailHari.barangKeluar.map((bk) => (
                      <tr key={bk.id} className="border-b border-gray-50">
                        <td className="py-1 pr-2">{bk.noUrut}</td>
                        <td className="py-1 pr-2">{bk.namaBarang}</td>
                        <td className="py-1 pr-2 text-right">{bk.jumlah}</td>
                        <td className="py-1 pr-2 text-right">{Number(bk.totalNonTunai) > 0 ? formatRupiah(Number(bk.totalNonTunai)) : "-"}</td>
                        <td className="py-1 text-right">{Number(bk.totalCash) > 0 ? formatRupiah(Number(bk.totalCash)) : "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {detailHari.operasional.length > 0 && (
              <div>
                <h4 className="font-semibold text-sm mb-2">Operasional:</h4>
                <table className="w-full text-sm">
                  <thead><tr className="border-b text-gray-500"><th className="text-left pr-2">No</th><th className="text-left pr-2">Keterangan</th><th className="text-right">Nominal</th></tr></thead>
                  <tbody>
                    {detailHari.operasional.map((op) => (
                      <tr key={op.id} className="border-b border-gray-50">
                        <td className="py-1 pr-2">{op.noUrut}</td>
                        <td className="py-1 pr-2">{op.keterangan}</td>
                        <td className="py-1 text-right">{formatRupiah(Number(op.nominal))}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function SummaryBox({ label, value, color = "" }: { label: string; value: number; color?: string }) {
  return (
    <div className="bg-white border rounded-lg p-3">
      <p className="text-xs text-gray-500">{label}</p>
      <p className={`text-sm font-bold ${color}`}>{formatRupiah(value)}</p>
    </div>
  );
}
