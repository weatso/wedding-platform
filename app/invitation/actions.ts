// app/invitation/actions.ts
'use server';

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const RsvpSchema = z.object({
  guestId: z.string().min(1),
  status: z.enum(["ATTENDING", "DECLINED"]),
  pax: z.coerce.number().min(1).max(10).default(1), // Jumlah orang hadir
  message: z.string().optional(), // Ucapan doa
});

export async function submitRsvp(formData: FormData) {
  const rawData = {
    guestId: formData.get("guestId"),
    status: formData.get("status"),
    pax: formData.get("pax"),
    message: formData.get("message"),
  };

  const validated = RsvpSchema.safeParse(rawData);

  if (!validated.success) {
    return { success: false, error: "Input tidak valid" };
  }

  const { guestId, status, pax, message } = validated.data;

  try {
    // 1. Update Status Tamu
    const guest = await prisma.guest.update({
      where: { id: guestId },
      data: {
        rsvpStatus: status,
        pax: status === "ATTENDING" ? pax : 0,
      }
    });

    // 2. Simpan Ucapan (Jika ada)
    if (message && message.trim() !== "") {
      await prisma.wish.create({
        data: {
          message,
          guestId: guest.id,
          invitationId: guest.invitationId,
        }
      });
    }

    // Refresh halaman agar status berubah
    revalidatePath(`/invitation`); 
    return { success: true };
  } catch (error) {
    console.error("RSVP Error:", error);
    return { success: false, error: "Gagal menyimpan RSVP" };
  }
}