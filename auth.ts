// auth.ts
import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { z } from "zod"
import { prisma } from "@/lib/db"
import bcrypt from "bcryptjs"
import { authConfig } from "./auth.config" // Kita akan buat file config terpisah agar middleware aman

// Schema validasi input login
const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const { auth, signIn, signOut, handlers } = NextAuth({
  ...authConfig, // Load config session/pages
  providers: [
    Credentials({
      async authorize(credentials) {
        const validatedFields = LoginSchema.safeParse(credentials);

        if (validatedFields.success) {
          const { email, password } = validatedFields.data;
          
          // 1. Cari user di DB
          const user = await prisma.user.findUnique({ where: { email } });
          if (!user || !user.password) return null;

          // 2. Cek Password
          const passwordsMatch = await bcrypt.compare(password, user.password);
          if (passwordsMatch) {
            // Return user object (akan masuk ke session)
            return user;
          }
        }
        return null;
      },
    }),
  ],
});