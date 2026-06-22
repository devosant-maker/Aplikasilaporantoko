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

export default function Operasional() {
  const [tanggal, setTanggal] = useState(getTodayStr());
  const [keterangan, setKeterangan] = useState("");
  const [nominal, setNominal] = useState("");

  const utils = trpc.useUtils();
  const { data: hariIni } = trpc.hariKerja.byTanggal.useQuery({ tanggal });
  const { data: operasionalList } = trpc.operasional.byHariKerja.useQuery(
    { hariKerjaId: hariIni?.id ?? 0 },
    { enabled: !!hariIni }
  );

  const createHari = trpc.hariKerja.create.useMutation({
    onSuccess: () => utils.hariKerja.byTanggal.invalidate({ tanggal }),
  });

  const addOp = trpc.operasional.create.useMutation({
    onSuccess: () => {
      utils.operasional.byHariKerja.invalidate({ hariKerjaId: hariIni!.id });
      utils.hariKerja.byTanggal.invalidate({ tanggal });
      setKeterangan("");
      setNominal("");
    },
  });

  const deleteOp = trpc.operasional.delete.useMutation({
    onSuccess: () => {
      utils.operasional.byHariKerja.invalidate({ hariKerjaId: hariIni!.id });
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
    if (!keterangan || !nominal) {
      toast.error("Lengkapi keterangan dan nominal");
      return;
    }
    await addOp.mutateAsync({
      hariKerjaId: hariIni!.id,
      noUrut: (operasionalList?.length ?? 0) + 1,
      keterangan,
      nominal,
    });
    toast.success("Operasional ditambahkan");
  };

  const total = operasionalList?.reduce((s, o) => s + Number(o.nominal), 0) ?? 0;

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Operasional</h1>
          <p className="text-sm text-gray-500">Pengeluaran operasional harian</p>
        </div>
        <div className="flex items-center gap-2">
          <Label className="text-sm">Tanggal:</Label>
          <Input
            type="date"
            value={tanggal}
            onChange={(e) => setTanggal(e.target.value)}
            className="w-[150px]"
          />
        </div>
      </div>

      {hariIni && (
        <div className="flex gap-4 text-sm bg-orange-50 p-3 rounded-lg">
          <span><strong>Modal:</strong> {formatRupiah(Number(hariIni.sisaModal))}</span>
        </div>
      )}

      <Card>
        <CardHeader><CardTitle className="text-base">Tambah Operasional</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Keterangan</Label>
              <Input placeholder="Contoh: sampah, listrik, dll" value={keterangan} onChange={(e) => setKeterangan(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Nominal</Label>
              <Input type="number" placeholder="0" value={nominal} onChange={(e) => setNominal(e.target.value)} />
            </div>
          </div>
          <Button onClick={handleTambah} disabled={addOp.isPending}>
            <Plus className="h-4 w-4 mr-1" /> Tambah
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Daftar Operasional</CardTitle>
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
                  <th className="pb-2 text-right">Nominal</th>
                  <th className="pb-2"></th>
                </tr>
              </thead>
              <tbody>
                {operasionalList?.map((op) => (
                  <tr key={op.id} className="border-b border-gray-50">
                    <td className="py-1.5 pr-2">{op.noUrut}</td>
                    <td className="py-1.5 pr-2">{op.keterangan}</td>
                    <td className="py-1.5 text-right">{formatRupiah(Number(op.nominal))}</td>
                    <td className="py-1.5">
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => deleteOp.mutate({ id: op.id })}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </td>
                  </tr>
                ))}
                {(!operasionalList || operasionalList.length === 0) && (
                  <tr><td colSpan={4} className="py-8 text-center text-gray-400">Belum ada data</td></tr>
                )}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-gray-200 font-semibold">
                  <td colSpan={2} className="py-2 text-right">Total:</td>
                  <td className="py-2 text-right">{formatRupiah(total)}</td>
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
