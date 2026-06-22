import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Plus, Trash2, Calculator } from "lucide-react";

function formatRupiah(n: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(n);
}

function getTodayStr() {
  return new Date().toISOString().split("T")[0];
}

export default function LainLainPage() {
  const [tanggal, setTanggal] = useState(getTodayStr());
  const [keterangan, setKeterangan] = useState("");
  const [saldoMasukCash, setSaldoMasukCash] = useState("");
  const [saldoKeluarCash, setSaldoKeluarCash] = useState("");
  const [saldoMasukNonTunai, setSaldoMasukNonTunai] = useState("");
  const [saldoKeluarNonTunai, setSaldoKeluarNonTunai] = useState("");
  const [catatan, setCatatan] = useState("");

  const utils = trpc.useUtils();
  const { data: hariIni } = trpc.hariKerja.byTanggal.useQuery({ tanggal });
  const { data: lainList } = trpc.lainLain.byHariKerja.useQuery(
    { hariKerjaId: hariIni?.id ?? 0 },
    { enabled: !!hariIni }
  );

  const createHari = trpc.hariKerja.create.useMutation({
    onSuccess: () => utils.hariKerja.byTanggal.invalidate({ tanggal }),
  });

  const addLl = trpc.lainLain.create.useMutation({
    onSuccess: () => {
      utils.lainLain.byHariKerja.invalidate({ hariKerjaId: hariIni!.id });
      utils.hariKerja.byTanggal.invalidate({ tanggal });
      setKeterangan("");
      setSaldoMasukCash("");
      setSaldoKeluarCash("");
      setSaldoMasukNonTunai("");
      setSaldoKeluarNonTunai("");
      setCatatan("");
    },
  });

  const deleteLl = trpc.lainLain.delete.useMutation({
    onSuccess: () => {
      utils.lainLain.byHariKerja.invalidate({ hariKerjaId: hariIni!.id });
      utils.hariKerja.byTanggal.invalidate({ tanggal });
    },
  });

  const rekap = trpc.hariKerja.rekap.useMutation({
    onSuccess: () => {
      utils.hariKerja.byTanggal.invalidate({ tanggal });
      toast.success("Rekap diperbarui");
    },
  });

  const pastikanHariKerja = async () => {
    if (!hariIni) {
      const modalAwal = window.prompt("Sisa modal hari sebelumnya:", "0");
      if (modalAwal === null) return false;
      await createHari.mutateAsync({ tanggal, sisaModal: modalAwal });
      return true;
    }
    return true;
  };

  const handleTambah = async () => {
    const ok = await pastikanHariKerja();
    if (!ok) return;
    if (!keterangan) { toast.error("Masukkan keterangan"); return; }
    await addLl.mutateAsync({
      hariKerjaId: hariIni!.id,
      noUrut: (lainList?.length ?? 0) + 1,
      keterangan,
      saldoMasukCash: saldoMasukCash || undefined,
      saldoKeluarCash: saldoKeluarCash || undefined,
      saldoMasukNonTunai: saldoMasukNonTunai || undefined,
      saldoKeluarNonTunai: saldoKeluarNonTunai || undefined,
      catatan: catatan || undefined,
    });
    toast.success("Data ditambahkan");
  };

  const totalMasukCash = lainList?.reduce((s, l) => s + Number(l.saldoMasukCash), 0) ?? 0;
  const totalKeluarCash = lainList?.reduce((s, l) => s + Number(l.saldoKeluarCash), 0) ?? 0;
  const totalMasukNonTunai = lainList?.reduce((s, l) => s + Number(l.saldoMasukNonTunai), 0) ?? 0;
  const totalKeluarNonTunai = lainList?.reduce((s, l) => s + Number(l.saldoKeluarNonTunai), 0) ?? 0;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Lain-Lain</h1>
          <p className="text-sm text-gray-500">Saldo masuk &amp; keluar non-penjualan</p>
        </div>
        <div className="flex items-center gap-2">
          <Label className="text-sm">Tanggal:</Label>
          <Input type="date" value={tanggal} onChange={(e) => setTanggal(e.target.value)} className="w-[150px]" />
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Tambah Data</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1">
            <Label>Keterangan</Label>
            <Input placeholder="Contoh: fee pasang adm bulan april" value={keterangan} onChange={(e) => setKeterangan(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="space-y-1">
              <Label className="text-green-600 text-xs">Saldo Masuk (Cash)</Label>
              <Input type="number" placeholder="0" value={saldoMasukCash} onChange={(e) => setSaldoMasukCash(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label className="text-red-600 text-xs">Saldo Keluar (Cash)</Label>
              <Input type="number" placeholder="0" value={saldoKeluarCash} onChange={(e) => setSaldoKeluarCash(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label className="text-purple-600 text-xs">Saldo Masuk (Non-Tunai)</Label>
              <Input type="number" placeholder="0" value={saldoMasukNonTunai} onChange={(e) => setSaldoMasukNonTunai(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label className="text-red-600 text-xs">Saldo Keluar (Non-Tunai)</Label>
              <Input type="number" placeholder="0" value={saldoKeluarNonTunai} onChange={(e) => setSaldoKeluarNonTunai(e.target.value)} />
            </div>
          </div>
          <div className="space-y-1">
            <Label>Catatan</Label>
            <Input placeholder="Contoh: sdh msk app" value={catatan} onChange={(e) => setCatatan(e.target.value)} />
          </div>
          <Button onClick={handleTambah} disabled={addLl.isPending}>
            <Plus className="h-4 w-4 mr-1" /> Tambah
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Daftar Lain-Lain</CardTitle>
          <Button variant="outline" size="sm" onClick={() => hariIni && rekap.mutate({ id: hariIni.id })} disabled={!hariIni || rekap.isPending}>
            <Calculator className="h-4 w-4 mr-1" /> Hitung Rekap
          </Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-gray-500">
                  <th className="pb-2 pr-2">No</th>
                  <th className="pb-2 pr-2">Keterangan</th>
                  <th className="pb-2 pr-2 text-right text-green-600">Masuk C</th>
                  <th className="pb-2 pr-2 text-right text-red-600">Keluar C</th>
                  <th className="pb-2 pr-2 text-right text-purple-600">Masuk NT</th>
                  <th className="pb-2 pr-2 text-right text-red-600">Keluar NT</th>
                  <th className="pb-2"></th>
                </tr>
              </thead>
              <tbody>
                {lainList?.map((ll) => (
                  <tr key={ll.id} className="border-b border-gray-50">
                    <td className="py-1.5 pr-2">{ll.noUrut}</td>
                    <td className="py-1.5 pr-2 font-medium">{ll.keterangan}</td>
                    <td className="py-1.5 pr-2 text-right text-green-600">
                      {Number(ll.saldoMasukCash) > 0 ? formatRupiah(Number(ll.saldoMasukCash)) : "-"}
                    </td>
                    <td className="py-1.5 pr-2 text-right text-red-600">
                      {Number(ll.saldoKeluarCash) > 0 ? formatRupiah(Number(ll.saldoKeluarCash)) : "-"}
                    </td>
                    <td className="py-1.5 pr-2 text-right text-purple-600">
                      {Number(ll.saldoMasukNonTunai) > 0 ? formatRupiah(Number(ll.saldoMasukNonTunai)) : "-"}
                    </td>
                    <td className="py-1.5 pr-2 text-right text-red-600">
                      {Number(ll.saldoKeluarNonTunai) > 0 ? formatRupiah(Number(ll.saldoKeluarNonTunai)) : "-"}
                    </td>
                    <td className="py-1.5">
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => deleteLl.mutate({ id: ll.id })}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </td>
                  </tr>
                ))}
                {(!lainList || lainList.length === 0) && (
                  <tr><td colSpan={7} className="py-8 text-center text-gray-400">Belum ada data</td></tr>
                )}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-gray-200 font-semibold">
                  <td colSpan={2} className="py-2 text-right">Total:</td>
                  <td className="py-2 pr-2 text-right text-green-600">{formatRupiah(totalMasukCash)}</td>
                  <td className="py-2 pr-2 text-right text-red-600">{formatRupiah(totalKeluarCash)}</td>
                  <td className="py-2 pr-2 text-right text-purple-600">{formatRupiah(totalMasukNonTunai)}</td>
                  <td className="py-2 pr-2 text-right text-red-600">{formatRupiah(totalKeluarNonTunai)}</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
