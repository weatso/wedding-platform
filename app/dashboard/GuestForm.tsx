// app/dashboard/GuestForm.tsx
'use client';

import { addGuest } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { useRef, useState } from "react";

const PRESET_CATEGORIES = ["Keluarga", "Teman Kantor", "Teman Sekolah", "VIP", "Tetangga"];

export default function GuestForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // State untuk menghandle dropdown vs input manual
  const [selectedCategory, setSelectedCategory] = useState("");
  const [isCustom, setIsCustom] = useState(false);

  async function handleSubmit(formData: FormData) {
    setIsPending(true);
    setError(null);

    const res = await addGuest(formData);

    if (res?.error) {
      setError(res.error);
    } else {
      formRef.current?.reset();
      // Reset state lokal
      setSelectedCategory("");
      setIsCustom(false);
    }
    setIsPending(false);
  }

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-8">
      <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
        <Plus className="w-4 h-4 text-blue-600" />
        Tambah Tamu Baru
      </h3>

      <form ref={formRef} action={handleSubmit} className="flex flex-col md:flex-row gap-4 items-start">
        <div className="flex-1 w-full space-y-1">
          <Input name="name" placeholder="Nama Tamu (misal: Budi Santoso)" required />
        </div>

        <div className="w-full md:w-1/4 space-y-1">
          <Input name="whatsapp" placeholder="No. WA (628...)" required />
        </div>

        <div className="w-full md:w-1/4 space-y-1">
          {/* LOGIKA DROPDOWN PINTAR */}
          {!isCustom ? (
            <select
              className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              name="category"
              value={selectedCategory}
              onChange={(e) => {
                if (e.target.value === "OTHER") {
                  setIsCustom(true);
                  setSelectedCategory(""); // Reset agar input text bersih
                } else {
                  setSelectedCategory(e.target.value);
                }
              }}
            >
              <option value="" disabled>Pilih Kategori...</option>
              {PRESET_CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
              <option value="OTHER" className="font-bold text-blue-600">+ Tambah Kategori Baru</option>
            </select>
          ) : (
            <div className="flex gap-2">
              <Input
                name="category"
                placeholder="Tulis Kategori..."
                autoFocus
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setIsCustom(false)}
                title="Batal"
              >
                ✕
              </Button>
            </div>
          )}
        </div>

        <Button type="submit" disabled={isPending} className="bg-slate-900 text-white w-full md:w-auto">
          {isPending ? "Menyimpan..." : "Simpan"}
        </Button>
      </form>

      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </div>
  );
}