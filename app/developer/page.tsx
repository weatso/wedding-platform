import { prisma } from "@/lib/db";
import { Badge } from "@/components/ui/badge"; // Install badge nanti: npx shadcn@latest add badge
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"; // Install table nanti
import Link from "next/link";

// Simulasi Auth (Nanti diganti Session asli)
const CURRENT_USER_ROLE = "DEVELOPER"; 

export const dynamic = 'force-dynamic';

export default async function DeveloperDashboard() {
  // 1. Security Check (Hardcode dulu)
  if (CURRENT_USER_ROLE !== "DEVELOPER") {
    return <div className="p-10 text-red-500">Akses Ditolak. Halaman ini khusus Developer.</div>;
  }

  // 2. Ambil SEMUA undangan (Tanpa filter user)
  const allInvitations = await prisma.invitation.findMany({
    include: {
      user: true, // Ambil data pemilik
      guests: true, // Ambil data tamu untuk dihitung
    },
    orderBy: { createdAt: 'desc' }
  });

  // 3. Hitung Global Stats
  const totalProjects = allInvitations.length;
  const totalGuestsSystem = allInvitations.reduce((acc, inv) => acc + inv.guests.length, 0);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8">
      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-center mb-10">
          <div>
             <h1 className="text-3xl font-bold text-white">Weatso HQ</h1>
             <p className="text-slate-400">Master Control Panel</p>
          </div>
          <Button variant="secondary">Log Out</Button>
        </header>

        {/* Global Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="pb-2"><CardTitle className="text-sm text-slate-400">Active Projects</CardTitle></CardHeader>
            <CardContent><div className="text-4xl font-bold text-white">{totalProjects}</div></CardContent>
          </Card>
          <Card className="bg-slate-900 border-slate-800">
             <CardHeader className="pb-2"><CardTitle className="text-sm text-slate-400">Total Guests Served</CardTitle></CardHeader>
             <CardContent><div className="text-4xl font-bold text-blue-400">{totalGuestsSystem}</div></CardContent>
          </Card>
          <Card className="bg-slate-900 border-slate-800">
             <CardHeader className="pb-2"><CardTitle className="text-sm text-slate-400">Revenue (Est)</CardTitle></CardHeader>
             <CardContent><div className="text-4xl font-bold text-green-400">Rp {totalProjects * 1000}k</div></CardContent>
          </Card>
        </div>

        {/* Table Semua Client */}
        <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
          <div className="p-6 border-b border-slate-800">
            <h3 className="font-bold text-lg">Client Projects</h3>
          </div>
          <Table>
            <TableHeader className="bg-slate-950">
              <TableRow className="hover:bg-slate-900 border-slate-800">
                <TableHead className="text-slate-400">Project / Slug</TableHead>
                <TableHead className="text-slate-400">Client Owner</TableHead>
                <TableHead className="text-slate-400">Event Date</TableHead>
                <TableHead className="text-slate-400">Stats (Tamu)</TableHead>
                <TableHead className="text-right text-slate-400">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allInvitations.map((inv) => (
                <TableRow key={inv.id} className="hover:bg-slate-800 border-slate-800">
                  <TableCell>
                    <div className="font-bold text-white">{inv.groomNickname} & {inv.brideNickname}</div>
                    <div className="text-xs text-slate-500">/{inv.slug}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-slate-300">{inv.user?.name || "No Owner"}</div>
                    <div className="text-xs text-slate-500">{inv.user?.email}</div>
                  </TableCell>
                  <TableCell className="text-slate-300">
                    {new Date(inv.eventDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-slate-300 border-slate-600">
                      {inv.guests.length} Guests
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Link href={`/dashboard?slug=${inv.slug}`}>
                        <Button size="sm" variant="ghost" className="text-blue-400 hover:text-blue-300 hover:bg-blue-950">
                            View Dashboard
                        </Button>
                    </Link>
                    <Link href={`/invitation/${inv.slug}`} target="_blank">
                        <Button size="sm" variant="ghost" className="text-slate-400 hover:text-white">
                            Visit Site
                        </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

      </div>
    </div>
  );
}