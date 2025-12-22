'use client'

import { useActionState } from "react";
import { addUser, ActionState } from "./actions"; // Import ActionState juga
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Initial State kosong
const initialState: ActionState = {
    message: null,
    errors: {},
    success: false
}

export default function AdminAddUserPage() {
  const [state, formAction, isPending] = useActionState(addUser, initialState);

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Tambah Client Baru</h1>
      
      {/* Alert Global Message */}
      {state.message && (
        <div className={`p-4 rounded mb-6 text-sm font-bold border ${state.success ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-600 border-red-200'}`}>
            {state.success ? '✅ ' : '⚠️ '} {state.message}
        </div>
      )}

      <form action={formAction} className="space-y-6 border p-6 rounded-xl bg-white shadow-sm">
        
        <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label>Nama Client</Label>
                <Input name="name" placeholder="Romeo Montague" />
                {state.errors?.name && <p className="text-red-500 text-xs">{state.errors.name[0]}</p>}
            </div>
            <div className="space-y-2">
                <Label>Role</Label>
                <select name="role" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                    <option value="CLIENT">Client (Mempelai)</option>
                    <option value="ADMIN">Admin / Staff</option>
                </select>
            </div>
        </div>

        <div className="space-y-2">
            <Label>Email Login</Label>
            <Input name="email" type="email" placeholder="client@email.com" />
            {state.errors?.email && <p className="text-red-500 text-xs">{state.errors.email[0]}</p>}
        </div>

        <div className="space-y-2">
            <Label>Password Awal</Label>
            <Input name="password" type="text" placeholder="min. 6 karakter" />
            <p className="text-xs text-slate-400">Info ini wajib dicatat/dikirim ke klien.</p>
            {state.errors?.password && <p className="text-red-500 text-xs">{state.errors.password[0]}</p>}
        </div>

        <div className="border-t pt-4 mt-4">
            <p className="font-bold text-sm text-slate-700 mb-4">Setup Undangan Awal</p>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
                 <div className="space-y-2">
                    <Label>Nama Pria</Label>
                    <Input name="groomName" />
                    {state.errors?.groomName && <p className="text-red-500 text-xs">{state.errors.groomName[0]}</p>}
                 </div>
                 <div className="space-y-2">
                    <Label>Nama Wanita</Label>
                    <Input name="brideName" />
                    {state.errors?.brideName && <p className="text-red-500 text-xs">{state.errors.brideName[0]}</p>}
                 </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <Label>Slug URL (Unik)</Label>
                    <Input name="slug" placeholder="romeo-juliet" />
                    {state.errors?.slug && <p className="text-red-500 text-xs">{state.errors.slug[0]}</p>}
                 </div>
                 <div className="space-y-2">
                    <Label>Tanggal Acara</Label>
                    <Input name="eventDate" type="datetime-local" />
                    {state.errors?.eventDate && <p className="text-red-500 text-xs">{state.errors.eventDate[0]}</p>}
                 </div>
            </div>
        </div>

        <Button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white h-12 mt-6" disabled={isPending}>
            {isPending ? "Sedang Memproses..." : "Simpan & Buat Undangan"}
        </Button>
      </form>
    </div>
  );
}