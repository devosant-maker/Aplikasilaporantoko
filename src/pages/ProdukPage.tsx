import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Plus, Trash2, Search } from "lucide-react";

export default function ProdukPage() {
  const [search, setSearch] = useState("");
  const [nama, setNama] = useState("");
  const [kategori, setKategori] = useState("");
  const [hargaDefault, setHargaDefault] = useState("");
  const [showForm, setShowForm] = useState(false);

  const utils = trpc.useUtils();
  const { data: produkList } = trpc.produk.list.useQuery({ search: search || undefined });

  const createProduk = trpc.produk.create.useMutation({
    onSuccess: () => {
      utils.produk.list.invalidate();
      setNama("");
      setKategori("");
      setHargaDefault("");
      setShowForm(false);
      toast.success("Produk ditambahkan");
    },
  });

  const deleteProduk = trpc.produk.delete.useMutation({
    onSuccess: () => {
      utils.produk.list.invalidate();
      toast.success("Produk dinonaktifkan");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama) { toast.error("Nama produk wajib diisi"); return; }
    createProduk.mutate({
      nama,
      kategori: kategori || undefined,
      hargaDefault: hargaDefault ? parseInt(hargaDefault) : undefined,
    });
  };

  const kategoriList = Array.from(new Set(produkList?.map((p) => p.kategori).filter(Boolean)));

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Master Produk</h1>
          <p className="text-sm text-gray-500">Kelola daftar produk</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4 mr-1" />
          {showForm ? "Tutup" : "Tambah Produk"}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader><CardTitle className="text-base">Tambah Produk Baru</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label>Nama Produk *</Label>
                  <Input value={nama} onChange={(e) => setNama(e.target.value)} placeholder="Nama produk" />
                </div>
                <div className="space-y-1">
                  <Label>Kategori</Label>
                  <Input value={kategori} onChange={(e) => setKategori(e.target.value)} placeholder="Contoh: Wallpaper" list="kategori-list" />
                  <datalist id="kategori-list">
                    {kategoriList.map((k) => <option key={k} value={k!} />)}
                  </datalist>
                </div>
                <div className="space-y-1">
                  <Label>Harga Default</Label>
                  <Input type="number" value={hargaDefault} onChange={(e) => setHargaDefault(e.target.value)} placeholder="0" />
                </div>
              </div>
              <Button type="submit" disabled={createProduk.isPending}>
                <Plus className="h-4 w-4 mr-1" /> Simpan
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
        <Input placeholder="Cari produk..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8" />
      </div>

      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-gray-50 text-left text-gray-500">
              <th className="px-4 py-3">Nama</th>
              <th className="px-4 py-3">Kategori</th>
              <th className="px-4 py-3 text-right">Harga Default</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {produkList?.map((p) => (
              <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="px-4 py-2.5 font-medium">{p.nama}</td>
                <td className="px-4 py-2.5">
                  <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">{p.kategori || "-"}</span>
                </td>
                <td className="px-4 py-2.5 text-right">
                  {p.hargaDefault ? new Intl.NumberFormat("id-ID").format(p.hargaDefault) : "-"}
                </td>
                <td className="px-4 py-2.5 text-right">
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => deleteProduk.mutate({ id: p.id })}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </td>
              </tr>
            ))}
            {(!produkList || produkList.length === 0) && (
              <tr><td colSpan={4} className="py-8 text-center text-gray-400">Belum ada produk</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
