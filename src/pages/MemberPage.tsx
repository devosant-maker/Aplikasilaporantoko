import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Plus, Trash2, Search } from "lucide-react";

export default function MemberPage() {
  const [search, setSearch] = useState("");
  const [nama, setNama] = useState("");
  const [noHp, setNoHp] = useState("");
  const [diskonPersen, setDiskonPersen] = useState("");
  const [diskonRupiah, setDiskonRupiah] = useState("");
  const [keterangan, setKeterangan] = useState("");
  const [showForm, setShowForm] = useState(false);

  const utils = trpc.useUtils();
  const { data: memberList } = trpc.member.list.useQuery({ search: search || undefined });

  const createMember = trpc.member.create.useMutation({
    onSuccess: () => {
      utils.member.list.invalidate();
      setNama("");
      setNoHp("");
      setDiskonPersen("");
      setDiskonRupiah("");
      setKeterangan("");
      setShowForm(false);
      toast.success("Member ditambahkan");
    },
  });

  const deleteMember = trpc.member.delete.useMutation({
    onSuccess: () => {
      utils.member.list.invalidate();
      toast.success("Member dinonaktifkan");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama) { toast.error("Nama member wajib diisi"); return; }
    createMember.mutate({
      nama,
      noHp: noHp || undefined,
      diskonPersen: diskonPersen ? parseInt(diskonPersen) : undefined,
      diskonRupiah: diskonRupiah ? parseInt(diskonRupiah) : undefined,
      keterangan: keterangan || undefined,
    });
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Master Member</h1>
          <p className="text-sm text-gray-500">Kelola member &amp; diskon</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4 mr-1" />
          {showForm ? "Tutup" : "Tambah Member"}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader><CardTitle className="text-base">Tambah Member Baru</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>Nama Member *</Label>
                  <Input value={nama} onChange={(e) => setNama(e.target.value)} placeholder="Nama member" />
                </div>
                <div className="space-y-1">
                  <Label>No HP</Label>
                  <Input value={noHp} onChange={(e) => setNoHp(e.target.value)} placeholder="0812..." />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>Diskon (%)</Label>
                  <Input type="number" min={0} max={100} value={diskonPersen} onChange={(e) => setDiskonPersen(e.target.value)} placeholder="0" />
                </div>
                <div className="space-y-1">
                  <Label>Diskon (Rp)</Label>
                  <Input type="number" min={0} value={diskonRupiah} onChange={(e) => setDiskonRupiah(e.target.value)} placeholder="0" />
                </div>
              </div>
              <div className="space-y-1">
                <Label>Keterangan</Label>
                <Textarea value={keterangan} onChange={(e) => setKeterangan(e.target.value)} placeholder="Catatan tentang member" rows={2} />
              </div>
              <Button type="submit" disabled={createMember.isPending}>
                <Plus className="h-4 w-4 mr-1" /> Simpan
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
        <Input placeholder="Cari member..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8" />
      </div>

      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-gray-50 text-left text-gray-500">
              <th className="px-4 py-3">Nama</th>
              <th className="px-4 py-3">No HP</th>
              <th className="px-4 py-3">Diskon</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {memberList?.map((m) => (
              <tr key={m.id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="px-4 py-2.5 font-medium">{m.nama}</td>
                <td className="px-4 py-2.5 text-gray-500">{m.noHp || "-"}</td>
                <td className="px-4 py-2.5">
                  {m.diskonPersen ? (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">{m.diskonPersen}%</span>
                  ) : m.diskonRupiah ? (
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">Rp{m.diskonRupiah}</span>
                  ) : (
                    <span className="text-xs text-gray-400">-</span>
                  )}
                </td>
                <td className="px-4 py-2.5 text-right">
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => deleteMember.mutate({ id: m.id })}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </td>
              </tr>
            ))}
            {(!memberList || memberList.length === 0) && (
              <tr><td colSpan={4} className="py-8 text-center text-gray-400">Belum ada member</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
