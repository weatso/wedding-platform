// lib/actions.ts
'use server';

import { signIn } from '@/auth'; 
import { AuthError } from 'next-auth';

export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  try {
    // 'credentials' sesuai dengan konfigurasi di auth.ts
    await signIn('credentials', formData);
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return 'Email atau Password salah.';
        default:
          return 'Terjadi kesalahan sistem. Coba lagi.';
      }
    }
    throw error;
  }
}