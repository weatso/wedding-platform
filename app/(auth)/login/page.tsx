// app/(auth)/login/page.tsx
'use client';
 
import { useActionState } from 'react';
import { authenticate } from '@/lib/actions'; 
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
 
export default function LoginPage() {
  const [errorMessage, formAction, isPending] = useActionState(
    authenticate,
    undefined
  );
 
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-sm space-y-6 bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
        
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900">Masuk ke Platform</h1>
          <p className="text-sm text-slate-500 mt-1">Vendor & Client Login</p>
        </div>
        
        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email" 
              type="email" 
              name="email" 
              placeholder="nama@email.com" 
              required 
              className="bg-slate-50"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input 
              id="password" 
              type="password" 
              name="password" 
              required 
              className="bg-slate-50"
            />
          </div>

          <Button className="w-full bg-slate-900 hover:bg-slate-800" disabled={isPending}>
            {isPending ? 'Sedang Memproses...' : 'Masuk'}
          </Button>

          {errorMessage && (
            <div className="p-3 rounded bg-red-50 text-red-600 text-sm font-medium border border-red-100 text-center">
              ⚠️ {errorMessage}
            </div>
          )}
        </form>

        <div className="text-center text-xs text-slate-400">
          Wedding Platform &copy; 2025
        </div>
      </div>
    </div>
  );
}