'use server'

import { prisma } from "@/lib/db"
import bcrypt from "bcryptjs"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { z } from "zod"

// 1. Definisikan Schema Validasi dengan Zod
const AddUserSchema = z.object({
  name: z.string().min(3, "Nama minimal 3 karakter"),
  email: z.string().email("Format email salah"),
  password: z.string().min(6, "Password minimal 6 karakter"),
  role: z.enum(["ADMIN", "CLIENT"]),
  groomName: z.string().min(1, "Nama Pria wajib diisi"),
  brideName: z.string().min(1, "Nama Wanita wajib diisi"),
  slug: z.string().min(3).regex(/^[a-z0-9-]+$/, "Slug hanya boleh huruf kecil, angka, dan strip"),
  eventDate: z.string().refine((date) => new Date(date).toString() !== 'Invalid Date', {
    message: "Tanggal tidak valid",
  }),
})

// 2. Definisikan Tipe State untuk return value
export type ActionState = {
  message?: string | null;
  errors?: {
    [key: string]: string[] | undefined;
  };
  success?: boolean;
}

// 3. Action Utama
export async function addUser(prevState: ActionState, formData: FormData): Promise<ActionState> {
    // Ambil data mentah
    const rawData = {
        name: formData.get("name"),
        email: formData.get("email"),
        password: formData.get("password"),
        role: formData.get("role"),
        groomName: formData.get("groomName"),
        brideName: formData.get("brideName"),
        slug: formData.get("slug"),
        eventDate: formData.get("eventDate"),
    }

    // Validasi Zod
    const validated = AddUserSchema.safeParse(rawData)

    // Jika Gagal Validasi
    if (!validated.success) {
        return {
            success: false,
            message: "Gagal Validasi Input",
            errors: validated.error.flatten().fieldErrors, // Menggunakan flatten() lebih aman daripada .errors langsung
        }
    }

    const data = validated.data;
    const hashedPassword = await bcrypt.hash(data.password, 10);

    try {
        await prisma.$transaction(async (tx) => {
            // Cek Email Duplicate (Manual Check karena Prisma throw errornya kadang tidak rapi)
            const existingUser = await tx.user.findUnique({ where: { email: data.email } });
            if (existingUser) throw new Error("Email sudah digunakan");

            // Cek Slug Duplicate
            const existingSlug = await tx.invitation.findUnique({ where: { slug: data.slug } });
            if (existingSlug) throw new Error("Slug URL sudah digunakan");

            // Create User
            const newUser = await tx.user.create({
                data: {
                    name: data.name,
                    email: data.email,
                    password: hashedPassword,
                    role: data.role as "ADMIN" | "CLIENT",
                }
            })

            // Create Invitation
            await tx.invitation.create({
                data: {
                    slug: data.slug,
                    userId: newUser.id,
                    groomName: data.groomName,
                    groomNick: data.groomName.split(' ')[0], // Ambil nama depan
                    groomFather: "-",
                    groomMother: "-",
                    brideName: data.brideName,
                    brideNick: data.brideName.split(' ')[0], // Ambil nama depan
                    brideFather: "-",
                    brideMother: "-",
                    eventDate: new Date(data.eventDate),
                    location: "Lokasi Belum Diisi",
                }
            })
        })
    } catch (e: any) {
        console.error("Database Error:", e)
        return { 
            success: false, 
            message: e.message || "Terjadi kesalahan database" 
        }
    }

    // Jika sukses, redirect (Redirect akan melempar 'error', jadi code di bawahnya tidak jalan, itu normal)
    revalidatePath('/admin/users')
    redirect('/admin/users')
}

export async function deleteUser(userId: string) {
    try {
        // Hapus Invitation milik user ini dulu (Cascade manual)
        // Prisma sebenarnya bisa handle Cascade Delete jika di-setting di schema,
        // tapi cara manual ini lebih aman untuk logika aplikasi.
        
        const userInvitation = await prisma.invitation.findFirst({
            where: { userId }
        });

        if (userInvitation) {
            // Hapus tamu & ucapan undangan tersebut
            await prisma.guest.deleteMany({ where: { invitationId: userInvitation.id } });
            await prisma.wish.deleteMany({ where: { invitationId: userInvitation.id } }); // Jika ada tabel Wish
            
            // Hapus undangan
            await prisma.invitation.delete({ where: { id: userInvitation.id } });
        }

        // Akhirnya hapus User
        await prisma.user.delete({ where: { id: userId } });

        revalidatePath('/admin/users');
        return { success: true, message: "User berhasil dihapus total." };
    } catch (e) {
        console.error(e);
        return { success: false, message: "Gagal menghapus user." };
    }
}