// components/templates/WoodVibe.tsx
'use client';

import { useState } from "react";
// Import Actions tetap mengarah ke app karena itu Server Action
import { submitRsvp } from "@/app/invitation/actions";

// Import UI Components (Mundur satu langkah ke folder ui)
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";

// ... sisa kode komponen WoodVibe sama seperti sebelumnya ...
// Definisikan Tipe Data yang diterima
type WoodVibeProps = {
    invitation: any; // Bisa diperjelas dengan Prisma Type nanti
    guest: any | null;
};

export default function WoodVibe({ invitation, guest }: WoodVibeProps) {
    const [isOpen, setIsOpen] = useState(false); // State Buka Undangan
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDone, setIsDone] = useState(guest?.rsvpStatus !== 'PENDING' && guest?.rsvpStatus !== undefined);

    // Cover Depan (Modal)
    if (!isOpen) {
        return (
            <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-stone-900 text-white bg-[url('https://images.unsplash.com/photo-1519225421980-715cb0202128?q=80&w=1000')] bg-cover bg-center">
                <div className="absolute inset-0 bg-black/60" /> {/* Overlay Gelap */}
                <div className="relative z-10 text-center space-y-6 p-6">
                    <p className="tracking-[0.2em] text-sm uppercase text-stone-300">The Wedding of</p>
                    <h1 className="text-4xl md:text-6xl font-serif text-amber-100">
                        {invitation.groomNick} & {invitation.brideNick}
                    </h1>

                    <div className="py-8">
                        {guest ? (
                            <>
                                <p className="text-sm mb-2 text-stone-300">Kepada Yth Bapak/Ibu/Saudara/i:</p>
                                <h2 className="text-2xl font-bold text-white mb-1">{guest.name}</h2>
                                {guest.category && <span className="text-xs bg-amber-900/50 px-2 py-1 rounded border border-amber-800">{guest.category}</span>}
                            </>
                        ) : (
                            <p className="text-stone-300">Tamu Undangan</p>
                        )}
                    </div>

                    <Button
                        onClick={() => setIsOpen(true)}
                        className="bg-amber-700 hover:bg-amber-600 text-white px-8 py-6 rounded-full text-lg animate-pulse"
                    >
                        Buka Undangan
                    </Button>
                </div>
            </div>
        );
    }

    // Isi Undangan (Setelah dibuka)
    return (
        <div className="min-h-screen bg-stone-50 text-stone-800 font-serif">
            {/* Bagian Hero */}
            <section className="h-screen flex items-center justify-center bg-stone-100 text-center p-6">
                <div className="space-y-4">
                    <p className="italic text-stone-500">Om Swastyastu / Assalamu'alaikum</p>
                    <h2 className="text-3xl md:text-5xl text-amber-800">
                        {invitation.groomName} <br /> <span className="text-2xl text-stone-400">&</span> <br /> {invitation.brideName}
                    </h2>
                    <p className="pt-4 text-stone-600">
                        {new Date(invitation.eventDate).toLocaleDateString('id-ID', {
                            weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
                        })}
                    </p>
                </div>
            </section>

            {/* Form RSVP */}
            <section className="py-16 px-6 max-w-lg mx-auto bg-white my-8 rounded-xl shadow-sm border border-stone-200">
                <h3 className="text-2xl text-center mb-6 text-amber-900 font-bold">Konfirmasi Kehadiran</h3>

                {guest ? (
                    isDone ? (
                        <div className="text-center p-6 bg-green-50 text-green-800 rounded-lg border border-green-200">
                            <p className="font-bold">Terima kasih, {guest.name}!</p>
                            <p className="text-sm mt-1">Konfirmasi Anda telah kami terima.</p>
                        </div>
                    ) : (
                        <form
                            action={async (formData) => {
                                setIsSubmitting(true);
                                await submitRsvp(formData);
                                setIsDone(true);
                                setIsSubmitting(false);
                            }}
                            className="space-y-4"
                        >
                            {/* Hidden Input ID Tamu */}
                            <input type="hidden" name="guestId" value={guest.id} />

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-stone-600">Nama</label>
                                <Input value={guest.name} disabled className="bg-stone-100" />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-stone-600">Apakah Anda akan hadir?</label>
                                <div className="flex gap-4">
                                    <label className="flex items-center gap-2 border p-3 rounded-lg flex-1 cursor-pointer has-checked:bg-amber-50 has-checked:border-amber-500 transition-colors">
                                        <input type="radio" name="status" value="ATTENDING" required className="accent-amber-600" />
                                        <span>Ya, Hadir</span>
                                    </label>
                                    <label className="flex items-center gap-2 border p-3 rounded-lg flex-1 cursor-pointer has-checked:bg-red-50 has-checked:border-red-500 transition-colors">
                                        <input type="radio" name="status" value="DECLINED" required className="accent-red-600" />
                                        <span>Maaf, Tidak</span>
                                    </label>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-stone-600">Jumlah Orang (Pax)</label>
                                <select name="pax" className="w-full p-2 border rounded-md bg-white">
                                    <option value="1">1 Orang</option>
                                    <option value="2">2 Orang</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-stone-600">Ucapan & Doa</label>
                                <Textarea name="message" placeholder="Tulis ucapan selamat..." />
                            </div>

                            <Button className="w-full bg-amber-800 hover:bg-amber-900 text-white" disabled={isSubmitting}>
                                {isSubmitting ? "Mengirim..." : "Kirim Konfirmasi"}
                            </Button>
                        </form>
                    )
                ) : (
                    <div className="text-center p-6 bg-stone-100 rounded-lg">
                        <p className="text-stone-500">
                            Fitur RSVP hanya tersedia untuk tamu yang diundang melalui link khusus (WhatsApp).
                        </p>
                    </div>
                )}
            </section>
        </div>
    );
}