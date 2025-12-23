// app/admin/page.tsx
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, Plus } from "lucide-react";
import Link from "next/link"; // Perbaikan Import

export default async function AdminDashboard() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") redirect("/login");

  // Ambil semua undangan + data user pemiliknya
  const invitations = await prisma.invitation.findMany({
    include: { user: true },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="p-8 space-y-8 bg-slate-50 min-h-screen">
      <div className="flex justify-between items-center">
        <div>
           <h1 className="text-3xl font-bold text-slate-900">Admin Control Center</h1>
           <p className="text-slate-500">Kelola semua proyek undangan dari sini.</p>
        </div>
        
        <div className="flex gap-4 items-center">
            <div className="bg-white px-4 py-2 rounded-lg border shadow-sm">
                <span className="text-sm text-slate-500">Total Proyek:</span>
                <span className="ml-2 font-bold text-slate-900">{invitations.length}</span>
            </div>
            {/* Tombol ke halaman Add User */}
            <Link href="/admin/users">
                <Button className="bg-slate-900 text-white gap-2">
                    <Plus className="w-4 h-4" /> Tambah User/Proyek
                </Button>
            </Link>
        </div>
      </div>

      {/* Tabel Daftar Undangan */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="bg-white border-b border-slate-100">
          <CardTitle className="text-lg">Daftar Proyek Undangan</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-semibold">
                <tr>
                  <th className="px-6 py-4">Mempelai & Client</th>
                  <th className="px-6 py-4">Tanggal Acara</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {invitations.length === 0 ? (
                    <tr>
                        <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                            Belum ada proyek. Silakan tambah user baru.
                        </td>
                    </tr>
                ) : invitations.map((inv) => {
                  // Logika Status Selesai/Belum
                  const isDone = new Date() > new Date(inv.eventDate);
                  
                  return (
                    <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900 text-base">{inv.groomNick} & {inv.brideNick}</div>
                        <div className="text-xs text-slate-500 flex flex-col gap-1 mt-1">
                            <span>Email: {inv.user?.email}</span>
                            <span className="font-mono bg-slate-100 px-1 w-fit rounded text-slate-600">/{inv.slug}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {new Date(inv.eventDate).toLocaleDateString('id-ID', {
                          weekday: 'long', day: 'numeric', month: 'short', year: 'numeric'
                        })}
                      </td>
                      <td className="px-6 py-4">
                        {isDone ? (
                          <span className="bg-slate-100 text-slate-500 px-2.5 py-1 rounded-full text-xs font-bold border border-slate-200">
                            SELESAI
                          </span>
                        ) : (
                          <span className="bg-green-100 text-green-700 px-2.5 py-1 rounded-full text-xs font-bold border border-green-200 flex items-center w-fit gap-1">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                            AKAN DATANG
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        {/* Tombol Lihat Undangan (Public) */}
                        <a href={`/invitation/${inv.slug}`} target="_blank" rel="noreferrer">
                            <Button size="sm" variant="outline" title="Lihat Website">
                                <Eye className="w-4 h-4 mr-1"/> Lihat Web
                            </Button>
                        </a>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}