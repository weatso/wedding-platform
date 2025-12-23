// app/dashboard/page.tsx
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/ui/copy-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Users, 
  Trash2, 
  Copy, 
  MessageCircle, 
  CheckCircle, 
  XCircle, 
  Clock, 
  LogOut 
} from "lucide-react";
import { deleteGuest } from "./actions"; 
import GuestForm from "./GuestForm";     
import { signOut } from "@/auth";

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const invitation = await prisma.invitation.findFirst({
    where: { userId: session.user.id },
    include: { guests: { orderBy: { createdAt: 'desc' } } }
  });

  if (!invitation) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
        <div className="bg-white p-8 rounded-xl shadow-sm text-center max-w-md border border-slate-200">
          <h1 className="text-xl font-bold text-slate-800 mb-2">Undangan Belum Siap</h1>
          <p className="text-slate-500 mb-6">Hubungi Admin untuk mengaktifkan paket undangan Anda.</p>
          <form action={async () => { "use server"; await signOut(); }}>
             <Button variant="outline">Keluar</Button>
          </form>
        </div>
      </div>
    );
  }

  const totalGuests = invitation.guests.length;
  const attending = invitation.guests.filter(g => g.rsvpStatus === 'ATTENDING').length;
  const declined = invitation.guests.filter(g => g.rsvpStatus === 'DECLINED').length;
  const pending = invitation.guests.filter(g => g.rsvpStatus === 'PENDING').length;

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* --- HEADER --- */}
        <header className="flex flex-col md:flex-row justify-between md:items-center gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Wedding Dashboard</h1>
                <p className="text-slate-500 text-sm mt-1">
                  {/* PERBAIKAN: Menggunakan groomNick & brideNick sesuai schema Anda */}
                  Mempelai: <span className="font-semibold text-slate-700">{invitation.groomNick} & {invitation.brideNick}</span>
                </p>
            </div>
            
            <div className="flex gap-3 items-center">
              <div className="bg-slate-100 px-3 py-1.5 rounded-md border text-xs font-mono text-slate-600">
                  /{invitation.slug}
              </div>
              
              <form action={async () => { 
                "use server"; 
                await signOut({ redirectTo: "/login" }); 
              }}>
                <Button variant="ghost" size="sm" className="text-red-600 hover:bg-red-50">
                  <LogOut className="w-4 h-4 mr-2" />
                  Keluar
                </Button>
              </form>
            </div>
        </header>

        {/* --- STATISTIK CARDS --- */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard icon={<Users className="text-blue-600"/>} label="Total Tamu" value={totalGuests} bg="bg-blue-50" border="border-blue-100" />
            <StatCard icon={<CheckCircle className="text-green-600"/>} label="Hadir" value={attending} bg="bg-green-50" border="border-green-100" />
            <StatCard icon={<XCircle className="text-red-600"/>} label="Tidak Hadir" value={declined} bg="bg-red-50" border="border-red-100" />
            <StatCard icon={<Clock className="text-yellow-600"/>} label="Menunggu" value={pending} bg="bg-yellow-50" border="border-yellow-100" />
        </div>

        {/* --- FORM TAMBAH TAMU --- */}
        <GuestForm />

        {/* --- TABEL DAFTAR TAMU --- */}
        <Card className="shadow-sm border-slate-200 overflow-hidden">
            <CardHeader className="border-b border-slate-100 bg-white px-6 py-4">
                <CardTitle className="text-base font-bold text-slate-800 flex justify-between items-center">
                  <span>Daftar Tamu & Link Undangan</span>
                  <span className="text-xs font-normal text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
                    {totalGuests} Orang
                  </span>
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-semibold tracking-wider border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-3 w-[25%]">Nama Tamu</th>
                                <th className="px-6 py-3 w-[45%]">Link Personal</th>
                                <th className="px-6 py-3 w-[15%] text-center">Status RSVP</th>
                                <th className="px-6 py-3 w-[15%] text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                            {invitation.guests.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-16 text-center text-slate-400">
                                        <div className="flex flex-col items-center gap-2">
                                            <Users className="w-8 h-8 text-slate-200" />
                                            <p>Belum ada tamu.</p>
                                            <p className="text-xs">Tambahkan tamu di atas untuk mendapatkan link.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                invitation.guests.map((guest) => {
                                    const uniqueLink = `${baseUrl}/invitation/${invitation.slug}?u=${guest.token}`;
                                    const waMessage = `Kepada Yth. ${guest.name},\n\nTanpa mengurangi rasa hormat, mohon kehadiran Anda di pernikahan kami. Info lengkap: ${uniqueLink}`;
                                    const waUrl = `https://wa.me/${guest.whatsapp?.replace(/^0/, '62').replace(/\D/g, '')}?text=${encodeURIComponent(waMessage)}`;

                                    return (
                                    <tr key={guest.id} className="hover:bg-slate-50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-slate-900">{guest.name}</div>
                                            <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                                              <span className="bg-slate-100 px-1.5 rounded">{guest.category || 'Umum'}</span>
                                              <span>• {guest.whatsapp}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="relative flex-1">
                                                  <input 
                                                    readOnly 
                                                    value={uniqueLink} 
                                                    className="text-xs bg-slate-50 border border-slate-200 rounded px-2 py-1.5 w-full text-slate-600 truncate focus:outline-none focus:ring-1 focus:ring-blue-500" 
                                                  />
                                                </div>
                                                
                                                <a 
                                                  href={waUrl} 
                                                  target="_blank" 
                                                  rel="noopener noreferrer"
                                                  title="Kirim via WhatsApp"
                                                >
                                                  <Button size="icon" variant="outline" className="h-8 w-8 text-green-600 border-green-200 hover:bg-green-50 hover:border-green-300">
                                                      <MessageCircle className="w-4 h-4" />
                                                  </Button>
                                                </a>

                                                <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400 hover:text-slate-600" title="Copy Link">
                                                    <Copy className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${
                                                guest.rsvpStatus === 'ATTENDING' ? 'bg-green-100 text-green-700' : 
                                                guest.rsvpStatus === 'DECLINED' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-500'
                                            }`}>
                                                {guest.rsvpStatus === 'ATTENDING' ? 'Hadir' : 
                                                 guest.rsvpStatus === 'DECLINED' ? 'Absen' : 'Pending'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <form
                                                action={async () => {
                                                  "use server";
                                                  await deleteGuest(guest.id);
                                                }}
                                              >
                                              <Button size="icon" variant="ghost" className="h-8 w-8 text-red-300 hover:text-red-600 hover:bg-red-50 transition-colors">
                                                  <Trash2 className="w-4 h-4" />
                                              </Button>
                                            </form>
                                        </td>
                                    </tr>
                                )})
                            )}
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, bg, border }: { icon: any, label: string, value: number, bg: string, border: string }) {
  return (
    <Card className={`shadow-sm ${border}`}>
        <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <div className={`p-2 rounded-full mb-2 ${bg}`}>{icon}</div>
            <p className="text-xs text-slate-500 uppercase font-bold tracking-widest">{label}</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
        </CardContent>
    </Card>
  )
}