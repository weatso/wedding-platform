import { prisma } from "@/lib/db"; // 1. Import koneksi DB
import { notFound } from "next/navigation"; // 2. Untuk handle 404
import { InvitationClient } from "./client-page"; // 3. Kita akan pisah UI interaktif ke file baru

// PENTING: Component ini Async karena harus tunggu database
// Props 'params' di Next.js 15 harus di-await (perubahan baru)
export default async function InvitationPage({ params }: { params: Promise<{ slug: string }> }) {
  
  // 1. Tangkap slug dari URL (misal: "romeo-juliet")
  const { slug } = await params;

  // 2. Query ke Database Supabase
  const data = await prisma.invitation.findUnique({
    where: {
      slug: slug, // Cari baris yang slug-nya sama
    },
  });

  // 3. Jika data tidak ada di DB, lempar ke halaman 404
  if (!data) {
    return notFound();
  }

  // 4. Jika ada, kirim data ke Component Client (UI)
  // Kita harus memisahkannya karena halaman ini (Server) tidak boleh pakai useState
  return <InvitationClient data={data} />;
}