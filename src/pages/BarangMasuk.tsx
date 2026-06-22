import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";

function getTodayStr() {
  return new Date().toISOString().split("T")[0];
}

export default function BarangMasukPage() {
  const [tanggal, setTanggal] = useState(getTodayStr());
  const [namaBarang, setNamaBarang] = useState("");
  const [jumlah, setJumlah] = useState("");
  const [harga, setHarga] = useState("");
  const [keterangan, setKeterangan] = useState("");

  const utils = trpc.useUtils();
  const { data: hariIni } = trpc.hariKerja.byTanggal.useQuery({ tanggal });
  const { data: barangMasukList } = trpc.barangMasuk.byHariKerja.useQuery(
    { hariKerjaId: hariIni?.id ?? 0 },
    { enabled: !!hariIni }
  );

  const createHari = trpc.hariKerja.create.useMutation({
    onSuccess: () => utils.hariKerja.byTanggal.invalidate({ tanggal }),
  });

  const addBm = trpc.barangMasuk.create.useMutation({
    onSuccess: () => {
      utils.barangMasuk.byHariKerja.invalidate({ hariKerjaId: hariIni!.id });
      setNamaBarang("");
      setJumlah("");
      setHarga("");
      setKeterangan("");
    },
  });

  const deleteBm = trpc.barangMasuk.delete.useMutation({
    onSuccess: () => {
      utils.barangMasuk.byHariKerja.invalidate({ hariKerjaId: hariIni!.id });
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
    if (!namaBarang) { toast.error("Masukkan nama barang"); return; }
    await addBm.mutateAsync({
      hariKerjaId: hariIni!.id,
      noUrut: (barangMasukList?.length ?? 0) + 1,
      namaBarang,
      jumlah: jumlah ? parseInt(jumlah) : undefined,
      harga: harga || undefined,
      keterangan: keterangan || undefined,
    });
    toast.success("Barang masuk ditambahkan");
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Barang Masuk</h1>
          <p className="text-sm text-gray-500">Pencatatan barang masuk &amp; kondisi</p>
        </div>
        <div className="flex items-center gap-2">
          <Label className="text-sm">Tanggal:</Label>
          <Input type="date" value={tanggal} onChange={(e) => setTanggal(e.target.value)} className="w-[150px]" />
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Tambah Barang Masuk</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1 sm:col-span-2">
              <Label>Nama Barang</Label>
              <Input placeholder="Nama barang" value={namaBarang} onChange={(e) => setNamaBarang(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Jumlah</Label>
              <Input type="number" placeholder="0" value={jumlah} onChange={(e) => setJumlah(e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Harga (opsional)</Label>
              <Input type="number" placeholder="0" value={harga} onChange={(e) => setHarga(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Keterangan</Label>
              <Textarea placeholder="Contoh: sdh msk app, barang rusak, dll" value={keterangan} onChange={(e) => setKeterangan(e.target.value)} rows={2} />
            </div>
          </div>
          <Button onClick={handleTambah} disabled={addBm.isPending}>
            <Plus className="h-4 w-4 mr-1" /> Tambah
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Daftar Barang Masuk</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-gray-500">
                  <th className="pb-2 pr-2">No</th>
                  <th className="pb-2 pr-2">Nama Barang</th>
                  <th className="pb-2 pr-2 text-right">Jumlah</th>
                  <th className="pb-2 pr-2">Keterangan</th>
                  <th className="pb-2"></th>
                </tr>
              </thead>
              <tbody>
                {barangMasukList?.map((bm) => (
                  <tr key={bm.id} className="border-b border-gray-50">
                    <td className="py-1.5 pr-2">{bm.noUrut}</td>
                    <td className="py-1.5 pr-2 font-medium">{bm.namaBarang}</td>
                    <td className="py-1.5 pr-2 text-right">{bm.jumlah ?? 0}</td>
                    <td className="py-1.5 pr-2 text-gray-500">{bm.keterangan || "-"}</td>
                    <td className="py-1.5">
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => deleteBm.mutate({ id: bm.id })}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </td>
                  </tr>
                ))}
                {(!barangMasukList || barangMasukList.length === 0) && (
                  <tr><td colSpan={5} className="py-8 text-center text-gray-400">Belum ada data</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
