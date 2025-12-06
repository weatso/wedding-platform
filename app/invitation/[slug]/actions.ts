"use server"; // Wajib: Menandakan ini kode Server (Backend)

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

// Kita terima FormData (standar HTML Form)
export async function submitRsvp(formData: FormData) {
  
  // 1. Ambil data dari form
  const name = formData.get("name") as string;
  const phone = formData.get("phone") as string;
  const status = formData.get("status") as "ATTENDING" | "DECLINED";
  const invitationId = formData.get("invitationId") as string;
  const slug = formData.get("slug") as string;

  // 2. Validasi sederhana
  if (!name || !status || !invitationId) {
    return { success: false, message: "Mohon isi semua data!" };
  }

  try {
    // 3. Simpan ke Supabase via Prisma
    await prisma.guest.create({
      data: {
        name: name,
        phoneNumber: phone,
        rsvpStatus: status, // Enum: ATTENDING / DECLINED
        invitationId: invitationId,
        // qrCode otomatis digenerate UUID oleh database (lihat schema)
      },
    });

    // 4. Refresh halaman agar data terbaru muncul (misal counter tamu)
    revalidatePath(`/invitation/${slug}`);
    
    return { success: true, message: "Terima kasih! RSVP berhasil disimpan." };

  } catch (error) {
    console.error("Gagal save RSVP:", error);
    return { success: false, message: "Gagal menyimpan data. Coba lagi." };
  }
}