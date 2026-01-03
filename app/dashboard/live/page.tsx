import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Clock, ArrowLeft, Home } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

// 1. Definisikan Tipe Props (Next.js 15: searchParams adalah Promise)
type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function LiveDashboard(props: Props) {
  const session = await auth();
  if (!session) redirect("/login");

  // 2. AWAIT searchParams sebelum digunakan
  const searchParams = await props.searchParams;
  const paramId = typeof searchParams.id === 'string' ? searchParams.id : undefined;

  const userRole = session.user.role; 
  let invitationId: string | undefined = undefined;

  // --- LOGIKA PENENTUAN ID UNDANGAN ---
  if (userRole === "CLIENT") {
      // Jika Client, cari undangan miliknya sendiri
      const myInv = await prisma.invitation.findFirst({
          where: { userId: session.user.id },
          select: { id: true }
      });
      invitationId = myInv?.id;
  } else if (userRole === "ADMIN" || userRole === "USHER") {
      // Jika Admin/Usher, ambil dari URL parameter (?id=xxx)
      invitationId = paramId;
  }

  // --- VALIDASI ID ---
  if (!invitationId) {
      return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 text-center">
            <h1 className="text-xl font-bold text-slate-800 mb-2">Data Tidak Ditemukan</h1>
            <p className="text-slate-500 mb-6">
                {userRole === "CLIENT" 
                    ? "Anda belum membuat data undangan." 
                    : "ID Acara tidak valid atau belum dipilih dari Dashboard."}
            </p>
            <Link href={userRole === 'USHER' ? "/usher" : "/dashboard"}>
                <Button variant="outline"><ArrowLeft className="w-4 h-4 mr-2"/> Kembali ke Dashboard</Button>
            </Link>
        </div>
      );
  }

  // --- QUERY DATABASE ---
  const inv = await prisma.invitation.findUnique({
    where: { id: invitationId },
    include: { 
        guests: { 
            where: { checkInTime: { not: null } }, // Hanya ambil yang sudah check-in
            orderBy: { checkInTime: 'desc' }      // Urutkan dari yang terbaru
        } 
    }
  });

  if (!inv) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500">
            <p>Data Undangan tidak ditemukan di database.</p>
        </div>
      );
  }

  // --- HITUNG STATISTIK ---
  const totalGuestsCheckIn = inv.guests.length; 
  const totalPaxCheckIn = inv.guests.reduce((sum, g) => sum + g.actualPax, 0); 
  const backLink = userRole === 'USHER' ? "/usher" : "/dashboard";

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-100">
        <div>
            <div className="flex items-center gap-2 mb-2">
                <Link href={backLink}>
                    <Button variant="ghost" size="sm" className="text-slate-500 hover:text-slate-900 px-2">
                        <ArrowLeft className="w-4 h-4"/>
                    </Button>
                </Link>
                <Link href={backLink}>
                    <Button variant="ghost" size="sm" className="text-slate-500 hover:text-slate-900 px-2">
                        <Home className="w-4 h-4"/>
                    </Button>
                </Link>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </span>
                Live Monitor: {inv.groomNick} & {inv.brideNick}
            </h1>
        </div>
        <div className="text-right hidden md:block">
             <Badge variant="outline" className="text-slate-500 border-slate-300">
                {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}
             </Badge>
        </div>
      </div>

      {/* STATISTIK UTAMA */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-slate-900 text-white border-0 shadow-lg col-span-2 md:col-span-1">
              <CardContent className="p-6">
                  <p className="text-slate-400 text-xs uppercase tracking-widest font-bold">Total Tamu (Pax)</p>
                  <div className="text-5xl font-bold mt-2 flex items-baseline gap-2 text-green-400">
                      {totalPaxCheckIn} <span className="text-sm font-normal text-slate-400">Org</span>
                  </div>
              </CardContent>
          </Card>
          
          <Card className="col-span-2 md:col-span-1">
              <CardContent className="p-6">
                  <p className="text-slate-500 text-xs uppercase tracking-widest font-bold">Total Scan (Grup)</p>
                  <div className="text-5xl font-bold mt-2 text-slate-800">
                      {totalGuestsCheckIn} <span className="text-sm font-normal text-slate-400">x</span>
                  </div>
              </CardContent>
          </Card>
      </div>

      {/* LIST TAMU TERBARU (LIVE FEED) */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="border-b border-slate-100 bg-white rounded-t-xl">
            <CardTitle className="flex items-center gap-2 text-base">
                <Clock className="w-4 h-4 text-slate-400" />
                Feed Kedatangan Terbaru
            </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
            {inv.guests.length === 0 ? (
                <div className="p-12 text-center text-slate-400 flex flex-col items-center">
                    <Users className="w-12 h-12 mb-2 opacity-20" />
                    <p>Belum ada tamu yang check-in.</p>
                </div>
            ) : (
                <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
                    {inv.guests.map((guest) => (
                        <div key={guest.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors animate-in slide-in-from-left duration-500">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-lg shadow-sm border border-green-200">
                                    {guest.actualPax}
                                </div>
                                <div>
                                    <p className="font-bold text-slate-900 text-lg">{guest.name}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Badge className={`text-[10px] px-2 ${guest.category === 'VIP' ? 'bg-amber-100 text-amber-800 hover:bg-amber-100' : 'bg-slate-100 text-slate-600 hover:bg-slate-100'}`}>
                                            {guest.category}
                                        </Badge>
                                        <span className="text-xs font-mono text-slate-400">#{guest.guestCode}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-xl font-bold text-slate-700 font-mono">
                                    {guest.checkInTime ? new Date(guest.checkInTime).toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit'}) : '-'}
                                </p>
                                <p className="text-[10px] text-slate-400 uppercase">WIB</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </CardContent>
      </Card>
    </div>
  );
}