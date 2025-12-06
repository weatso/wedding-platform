import { prisma } from "@/lib/db";
import { Users, CheckCircle, Clock, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Agar data selalu fresh (Realtime) saat ada tamu baru input
export const dynamic = 'force-dynamic';

// Next.js 15: searchParams sekarang adalah Promise, harus di-await
export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ slug?: string }> }) {
  
  // 1. Ambil Parameter URL (Logic Developer)
  // Jika URL-nya: /dashboard?slug=romeo-juliet, maka developerSlugView = "romeo-juliet"
  const params = await searchParams;
  const developerSlugView = params.slug; 

  // 2. Simulasi Session Login (Logic Client)
  // ---------------------------------------------------------------------------
  // ⚠️ GANTI STRING DI BAWAH INI DENGAN UUID USER CLIENT DARI PRISMA STUDIO!
  // Contoh: "550e8400-e29b-41d4-a716-446655440000"
  const SIMULASI_LOGGED_IN_USER_ID = "uuid-client-456"; 
  // ---------------------------------------------------------------------------

  let invitation;

  // --- LOGIC PENENTUAN DATA (RBAC SEDERHANA) ---
  if (developerSlugView) {
    // SKENARIO A: Developer melihat spesifik project (via link ?slug=...)
    // Kita mencari berdasarkan SLUG unik undangan
    invitation = await prisma.invitation.findUnique({
      where: { slug: developerSlugView },
      include: {
        guests: { orderBy: { createdAt: 'desc' } }
      }
    });
  } else {
    // SKENARIO B: Client login melihat project miliknya sendiri
    // Kita mencari undangan yang userId-nya cocok dengan user yang login
    invitation = await prisma.invitation.findFirst({
      where: { userId: SIMULASI_LOGGED_IN_USER_ID },
      include: {
        guests: { orderBy: { createdAt: 'desc' } }
      }
    });
  }

  // Jika data tidak ditemukan (misal ID salah atau slug salah)
  if (!invitation) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-slate-600 p-4 text-center">
        <h1 className="text-2xl font-bold mb-2 text-red-500">Data Tidak Ditemukan</h1>
        <p>Sistem tidak dapat menemukan undangan yang terkait.</p>
        
        <div className="mt-6 bg-white p-4 rounded border text-left text-xs font-mono text-slate-500 shadow-sm max-w-lg">
          <p className="font-bold mb-2">Debug Info:</p>
          <p>• Mode: {developerSlugView ? "Developer View (?slug)" : "Client View (Login)"}</p>
          <p>• Slug Dicari: {developerSlugView || "-"}</p>
          <p>• User ID Simulasi: {SIMULASI_LOGGED_IN_USER_ID}</p>
          <p className="mt-2 text-orange-500">Tips: Pastikan UUID di kodingan sudah diganti dengan UUID Client yang valid dari Prisma Studio.</p>
        </div>
      </div>
    );
  }

  // --- HITUNG STATISTIK ---
  const totalGuests = invitation.guests.length;
  const attending = invitation.guests.filter(g => g.rsvpStatus === 'ATTENDING').length;
  const declined = invitation.guests.filter(g => g.rsvpStatus === 'DECLINED').length;
  const pending = invitation.guests.filter(g => g.rsvpStatus === 'PENDING').length;

  return (
    <div className="min-h-screen bg-slate-50 p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        
        {/* Header Dashboard */}
        <header className="mb-8 flex flex-col md:flex-row justify-between md:items-center gap-4">
            <div>
                <h1 className="text-3xl font-bold text-slate-800">Wedding Dashboard</h1>
                <p className="text-slate-500 mt-1">
                  Mempelai: <span className="font-semibold text-slate-700">{invitation.groomNickname} & {invitation.brideNickname}</span>
                </p>
            </div>
            
            {/* Status Badge */}
            <div className="flex gap-2 items-center">
              {developerSlugView && (
                <div className="bg-slate-900 text-white px-3 py-1.5 rounded text-xs font-bold font-mono tracking-wide shadow-sm">
                  DEV VIEW
                </div>
              )}
              <div className="bg-white px-4 py-2 rounded-lg border text-sm font-mono text-slate-600 shadow-sm">
                  Slug: {invitation.slug}
              </div>
            </div>
        </header>

        {/* Stats Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <StatCard icon={<Users className="text-blue-500"/>} label="Total Respon" value={totalGuests} />
            <StatCard icon={<CheckCircle className="text-green-500"/>} label="Hadir" value={attending} />
            <StatCard icon={<XCircle className="text-red-500"/>} label="Tidak Hadir" value={declined} />
            <StatCard icon={<Clock className="text-yellow-500"/>} label="Menunggu" value={pending} />
        </div>

        {/* Tabel Data Tamu */}
        <Card className="shadow-sm border-slate-200">
            <CardHeader className="border-b border-slate-100 bg-white">
                <CardTitle className="text-lg text-slate-800">Daftar Tamu Terbaru</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-semibold tracking-wider">
                            <tr>
                                <th className="px-6 py-4">Nama Tamu</th>
                                <th className="px-6 py-4">No. WhatsApp</th>
                                <th className="px-6 py-4">Status RSVP</th>
                                <th className="px-6 py-4 text-right">Waktu Input</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                            {invitation.guests.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-16 text-center text-slate-400">
                                        <div className="flex flex-col items-center gap-2">
                                            <Users className="w-10 h-10 text-slate-200 mb-2" />
                                            <p>Belum ada data tamu.</p>
                                            <p className="text-xs">Bagikan link undangan Anda untuk mulai menerima RSVP.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                invitation.guests.map((guest) => (
                                    <tr key={guest.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-slate-900">{guest.name}</td>
                                        <td className="px-6 py-4 text-slate-500 font-mono text-xs">{guest.phoneNumber}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider border ${
                                                guest.rsvpStatus === 'ATTENDING' ? 'bg-green-50 text-green-700 border-green-200' : 
                                                guest.rsvpStatus === 'DECLINED' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                                            }`}>
                                                {guest.rsvpStatus === 'ATTENDING' ? 'HADIR' : 
                                                 guest.rsvpStatus === 'DECLINED' ? 'TIDAK' : 'PENDING'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-slate-400 text-xs text-right tabular-nums">
                                            {new Date(guest.createdAt).toLocaleString('id-ID', { 
                                              day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' 
                                            })}
                                        </td>
                                    </tr>
                                ))
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

// Komponen Helper Kecil untuk Card Statistik
function StatCard({ icon, label, value }: { icon: any, label: string, value: number }) {
  return (
    <Card className="shadow-sm border-slate-200">
        <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-slate-100 rounded-full shadow-inner">{icon}</div>
            <div>
                <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest mb-1">{label}</p>
                <p className="text-3xl font-bold text-slate-900 tracking-tight">{value}</p>
            </div>
        </CardContent>
    </Card>
  )
}