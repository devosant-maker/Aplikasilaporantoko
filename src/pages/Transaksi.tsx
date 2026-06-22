import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  Plus,
  Trash2,
  Search,
  X,
  Calculator,
} from "lucide-react";

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

export default function Transaksi() {
  const [tanggal, setTanggal] = useState(getTodayStr());
  const [selectedProduk, setSelectedProduk] = useState("");
  const [customNama, setCustomNama] = useState("");
  const [jumlah, setJumlah] = useState("1");
  const [hargaSatuan, setHargaSatuan] = useState("");
  const [hargaCash, setHargaCash] = useState("");
  const [metodeBayar, setMetodeBayar] = useState("CASH");
  const [selectedMember, setSelectedMember] = useState("");
  const [searchProduk, setSearchProduk] = useState("");

  const utils = trpc.useUtils();

  const { data: hariIni } = trpc.hariKerja.byTanggal.useQuery({ tanggal });
  const { data: daftarProduk } = trpc.produk.aktif.useQuery();
  const { data: daftarMember } = trpc.member.aktif.useQuery();
  const { data: daftarMetode } = trpc.metodePembayaran.list.useQuery();
  const { data: barangKeluarList } = trpc.barangKeluar.byHariKerja.useQuery(
    { hariKerjaId: hariIni?.id ?? 0 },
    { enabled: !!hariIni }
  );

  const createHari = trpc.hariKerja.create.useMutation({
    onSuccess: () => {
      utils.hariKerja.byTanggal.invalidate({ tanggal });
    },
  });

  const addBarang = trpc.barangKeluar.create.useMutation({
    onSuccess: () => {
      utils.barangKeluar.byHariKerja.invalidate({ hariKerjaId: hariIni!.id });
      utils.hariKerja.byTanggal.invalidate({ tanggal });
      resetForm();
    },
  });

  const rekap = trpc.hariKerja.rekap.useMutation({
    onSuccess: () => {
      utils.hariKerja.byTanggal.invalidate({ tanggal });
      toast.success("Rekap diperbarui");
    },
  });

  const deleteBarang = trpc.barangKeluar.delete.useMutation({
    onSuccess: () => {
      utils.barangKeluar.byHariKerja.invalidate({ hariKerjaId: hariIni!.id });
      utils.hariKerja.byTanggal.invalidate({ tanggal });
    },
  });

  const pastikanHariKerja = async () => {
    if (!hariIni) {
      const modalAwal = window.prompt(
        "Sisa modal hari sebelumnya:",
        "0"
      );
      if (modalAwal === null) return false;
      await createHari.mutateAsync({
        tanggal,
        sisaModal: modalAwal,
      });
      return true;
    }
    return true;
  };

  const handleTambah = async () => {
    const ok = await pastikanHariKerja();
    if (!ok) return;

    const nama = selectedProduk === "custom" ? customNama : selectedProduk;
    if (!nama) {
      toast.error("Pilih atau masukkan nama barang");
      return;
    }

    const qty = parseInt(jumlah) || 1;
    const isNonTunai = metodeBayar !== "CASH" && metodeBayar !== "DSKN" && metodeBayar !== "MEMBER";
    
    let hargaSatuanNum = parseInt(hargaSatuan) || 0;
    let hargaCashNum = parseInt(hargaCash) || 0;
    let totalNonTunai = "0";
    let totalCash = "0";

    // Apply member discount
    if (selectedMember && metodeBayar === "MEMBER") {
      const member = daftarMember?.find((m) => m.id.toString() === selectedMember);
      if (member) {
        const basePrice = hargaSatuanNum || hargaCashNum;
        let discounted = basePrice;
        if (member.diskonPersen && member.diskonPersen > 0) {
          discounted = Math.round(basePrice * (1 - member.diskonPersen / 100));
        }
        if (member.diskonRupiah && member.diskonRupiah > 0) {
          discounted = Math.max(0, basePrice - member.diskonRupiah);
        }
        hargaCashNum = discounted;
        hargaSatuanNum = 0;
      }
    }

    if (isNonTunai && hargaSatuanNum > 0) {
      totalNonTunai = (hargaSatuanNum * qty).toString();
    }
    if (!isNonTunai && hargaCashNum > 0) {
      totalCash = (hargaCashNum * qty).toString();
    }
    // If non-tunai but hargaCash filled, treat as cash
    if (isNonTunai && hargaCashNum > 0 && hargaSatuanNum === 0) {
      totalCash = (hargaCashNum * qty).toString();
    }

    await addBarang.mutateAsync({
      hariKerjaId: hariIni!.id,
      noUrut: (barangKeluarList?.length ?? 0) + 1,
      namaBarang: nama,
      jumlah: qty,
      hargaSatuan: hargaSatuanNum > 0 ? hargaSatuanNum.toString() : undefined,
      totalNonTunai,
      hargaCash: hargaCashNum > 0 ? hargaCashNum.toString() : undefined,
      totalCash,
      metodePembayaran: metodeBayar,
      memberId: selectedMember ? parseInt(selectedMember) : undefined,
    });

    toast.success("Barang ditambahkan");
  };

  const handleRekap = () => {
    if (!hariIni) return;
    rekap.mutate({ id: hariIni.id });
  };

  const resetForm = () => {
    setSelectedProduk("");
    setCustomNama("");
    setJumlah("1");
    setHargaSatuan("");
    setHargaCash("");
    setMetodeBayar("CASH");
    setSelectedMember("");
  };

  const filteredProduk = daftarProduk?.filter((p) =>
    p.nama.toLowerCase().includes(searchProduk.toLowerCase())
  );

  const totalNonTunai =
    barangKeluarList?.reduce((s, b) => s + Number(b.totalNonTunai), 0) ?? 0;
  const totalCash =
    barangKeluarList?.reduce((s, b) => s + Number(b.totalCash), 0) ?? 0;
  const grandTotal = totalNonTunai + totalCash;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Barang Keluar</h1>
          <p className="text-sm text-gray-500">Input penjualan harian</p>
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

      {/* Info hari kerja */}
      {hariIni && (
        <div className="flex flex-wrap gap-4 text-sm bg-blue-50 p-3 rounded-lg">
          <span>
            <strong>Modal:</strong> {formatRupiah(Number(hariIni.sisaModal))}
          </span>
          <span>
            <strong>Omzet:</strong> {formatRupiah(Number(hariIni.omzetTotal))}
          </span>
        </div>
      )}

      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Tambah Penjualan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Nama Barang */}
          <div className="space-y-2">
            <Label>Nama Barang</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Cari produk..."
                  value={searchProduk}
                  onChange={(e) => setSearchProduk(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Select
                value={selectedProduk}
                onValueChange={(val) => {
                  setSelectedProduk(val);
                  if (val !== "custom") {
                    const p = daftarProduk?.find((pr) => pr.nama === val);
                    if (p?.hargaDefault) {
                      setHargaCash(p.hargaDefault.toString());
                    }
                    setCustomNama("");
                  }
                }}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Pilih produk" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="custom">-- Nama Lain --</SelectItem>
                  {filteredProduk?.map((p) => (
                    <SelectItem key={p.id} value={p.nama}>
                      {p.nama}
                      {p.kategori ? ` (${p.kategori})` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {selectedProduk === "custom" && (
              <Input
                placeholder="Masukkan nama barang"
                value={customNama}
                onChange={(e) => setCustomNama(e.target.value)}
              />
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="space-y-1">
              <Label>Jumlah</Label>
              <Input
                type="number"
                value={jumlah}
                onChange={(e) => setJumlah(e.target.value)}
                min={1}
              />
            </div>
            <div className="space-y-1">
              <Label>Harga Satuan (Non-Tunai)</Label>
              <Input
                type="number"
                placeholder="0"
                value={hargaSatuan}
                onChange={(e) => setHargaSatuan(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label>Harga Cash</Label>
              <Input
                type="number"
                placeholder="0"
                value={hargaCash}
                onChange={(e) => setHargaCash(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label>Metode Bayar</Label>
              <Select value={metodeBayar} onValueChange={setMetodeBayar}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {daftarMetode?.map((m) => (
                    <SelectItem key={m.id} value={m.nama}>
                      {m.nama}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {metodeBayar === "MEMBER" && (
            <div className="space-y-1">
              <Label>Pilih Member</Label>
              <Select
                value={selectedMember}
                onValueChange={setSelectedMember}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih member..." />
                </SelectTrigger>
                <SelectContent>
                  {daftarMember?.map((m) => (
                    <SelectItem key={m.id} value={m.id.toString()}>
                      {m.nama}
                      {m.diskonPersen
                        ? ` (Diskon ${m.diskonPersen}%)`
                        : m.diskonRupiah
                        ? ` (Diskon Rp${m.diskonRupiah})`
                        : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex gap-2">
            <Button onClick={handleTambah} disabled={addBarang.isPending}>
              <Plus className="h-4 w-4 mr-1" />
              Tambah
            </Button>
            <Button variant="outline" onClick={resetForm}>
              <X className="h-4 w-4 mr-1" />
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabel Barang Keluar */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">
            Daftar Penjualan ({barangKeluarList?.length ?? 0} item)
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRekap}
            disabled={!hariIni || rekap.isPending}
          >
            <Calculator className="h-4 w-4 mr-1" />
            Hitung Rekap
          </Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-gray-500">
                  <th className="pb-2 pr-2">No</th>
                  <th className="pb-2 pr-2">Nama Barang</th>
                  <th className="pb-2 pr-2 text-right">Qty</th>
                  <th className="pb-2 pr-2 text-right">Harga</th>
                  <th className="pb-2 pr-2 text-right">Non-Tunai</th>
                  <th className="pb-2 pr-2 text-right">Cash</th>
                  <th className="pb-2 pr-2">Bayar</th>
                  <th className="pb-2"></th>
                </tr>
              </thead>
              <tbody>
                {barangKeluarList?.map((bk) => (
                  <tr key={bk.id} className="border-b border-gray-50">
                    <td className="py-1.5 pr-2">{bk.noUrut}</td>
                    <td className="py-1.5 pr-2 font-medium">{bk.namaBarang}</td>
                    <td className="py-1.5 pr-2 text-right">{bk.jumlah}</td>
                    <td className="py-1.5 pr-2 text-right">
                      {bk.hargaSatuan
                        ? formatRupiah(Number(bk.hargaSatuan))
                        : bk.hargaCash
                        ? formatRupiah(Number(bk.hargaCash))
                        : "-"}
                    </td>
                    <td className="py-1.5 pr-2 text-right text-purple-600">
                      {Number(bk.totalNonTunai) > 0
                        ? formatRupiah(Number(bk.totalNonTunai))
                        : "-"}
                    </td>
                    <td className="py-1.5 pr-2 text-right text-green-600">
                      {Number(bk.totalCash) > 0
                        ? formatRupiah(Number(bk.totalCash))
                        : "-"}
                    </td>
                    <td className="py-1.5 pr-2">
                      <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">
                        {bk.metodePembayaran || "CASH"}
                      </span>
                    </td>
                    <td className="py-1.5">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-red-500"
                        onClick={() => deleteBarang.mutate({ id: bk.id })}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </td>
                  </tr>
                ))}
                {(!barangKeluarList || barangKeluarList.length === 0) && (
                  <tr>
                    <td
                      colSpan={8}
                      className="py-8 text-center text-gray-400"
                    >
                      Belum ada data penjualan
                    </td>
                  </tr>
                )}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-gray-200 font-semibold">
                  <td colSpan={4} className="py-2 pr-2 text-right">
                    Total:
                  </td>
                  <td className="py-2 pr-2 text-right text-purple-600">
                    {formatRupiah(totalNonTunai)}
                  </td>
                  <td className="py-2 pr-2 text-right text-green-600">
                    {formatRupiah(totalCash)}
                  </td>
                  <td colSpan={2} className="py-2">
                    {formatRupiah(grandTotal)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
