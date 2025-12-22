// app/dashboard/actions.ts
'use server';

import { auth } from "@/auth";
import { prisma } from "@/lib/db"; // Pastikan path ini benar sesuai struktur folder Anda
import { revalidatePath } from "next/cache";
import { z } from "zod";

// 1. Schema Validasi Input
const AddGuestSchema = z.object({
  name: z.string().min(1, "Nama tamu wajib diisi"),
  whatsapp: z.string().min(10, "Nomor WA minimal 10 digit"), // Validasi panjang minimal
  category: z.string().optional(),
});

// 2. Action Tambah Tamu
export async function addGuest(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized: Harap login terlebih dahulu." };

  // Ambil data dari FormData
  const rawData = {
    name: formData.get("name"),
    whatsapp: formData.get("whatsapp"),
    category: formData.get("category"),
  };

  // Validasi dengan Zod
  const validation = AddGuestSchema.safeParse(rawData);

  if (!validation.success) {
    // PERBAIKAN: Mengambil pesan error pertama dengan aman
    const errorMessages = validation.error.flatten().fieldErrors;
    // Ambil error dari field 'name' atau 'whatsapp' jika ada
    const firstError = errorMessages.name?.[0] || errorMessages.whatsapp?.[0] || "Input tidak valid";
    return { error: firstError };
  }

  const { name, whatsapp, category } = validation.data;

  try {
    // Cari Undangan milik User ini
    const invitation = await prisma.invitation.findFirst({
      where: { userId: session.user.id },
    });

    if (!invitation) return { error: "Undangan tidak ditemukan." };

    // Simpan ke Database
    await prisma.guest.create({
      data: {
        name,
        whatsapp,
        category: category || "Umum",
        invitationId: invitation.id,
        // token: otomatis dibuat oleh @default(cuid()) di schema
        // rsvpStatus: default PENDING
      },
    });

    revalidatePath("/dashboard"); // Refresh data di dashboard
    return { success: true };
    
  } catch (error) {
    console.error("Gagal tambah tamu:", error);
    return { error: "Gagal menyimpan data tamu ke database." };
  }
}

// 3. Action Hapus Tamu
export async function deleteGuest(guestId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  try {
    // Security Check: Pastikan tamu ini benar-benar milik user yang login
    const guest = await prisma.guest.findUnique({
      where: { id: guestId },
      include: { invitation: true },
    });

    // Jika tamu tidak ada ATAU pemilik undangannya bukan user yang login -> TOLAK
    if (!guest || guest.invitation.userId !== session.user.id) {
      return { error: "Akses ditolak." };
    }

    // Hapus Tamu
    await prisma.guest.delete({ where: { id: guestId } });
    
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Gagal hapus tamu:", error);
    return { error: "Gagal menghapus tamu." };
  }
}