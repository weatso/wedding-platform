import { prisma } from "@/lib/db";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FileHeart, LogOut } from "lucide-react"; 
import { signOut } from "@/auth"; // <-- Import fungsi logout dari auth.ts

export default async function AdminDashboard() {
  const totalUsers = await prisma.user.count({ where: { role: "CLIENT" } });
  const totalInvitations = await prisma.invitation.count();

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-5xl mx-auto">
        
        {/* HEADER DENGAN LOGOUT */}
        <div className="flex justify-between items-center mb-8">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 mb-2">Vendor Cockpit</h1>
                <p className="text-slate-500">Selamat datang, Admin.</p>
            </div>
            
            {/* Tombol Logout (Server Action Inline) */}
            <form
              action={async () => {
                "use server"
                await signOut({ redirectTo: "/login" });
              }}
            >
              <Button variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                <LogOut className="w-4 h-4 mr-2" />
                Keluar
              </Button>
            </form>
        </div>

        {/* ... SISA KODE CARD GRID DI BAWAH TETAP SAMA ... */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           {/* ... Card User & Card Undangan ... */}
           {/* (Copy paste bagian card dari kode sebelumnya) */}
           <Link href="/admin/users">
            <Card className="hover:shadow-md transition-shadow cursor-pointer border-slate-200">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-500">
                  Total Client
                </CardTitle>
                <Users className="h-4 w-4 text-slate-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalUsers}</div>
                <p className="text-xs text-slate-500 mt-1">
                  + Klik untuk tambah Client & Undangan Baru
                </p>
                <Button className="w-full mt-4 bg-blue-600 hover:bg-blue-700">
                  Kelola Users
                </Button>
              </CardContent>
            </Card>
          </Link>

          <Card className="border-slate-200 bg-slate-100 opacity-80">
             <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-500">
                  Total Undangan Aktif
                </CardTitle>
                <FileHeart className="h-4 w-4 text-slate-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalInvitations}</div>
                <p className="text-xs text-slate-500 mt-1">
                  List semua undangan (Coming Soon)
                </p>
              </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}