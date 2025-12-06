"use client";
import QRCode from "react-qr-code";

import { useState } from "react";
import { Calendar, MapPin, Heart, Music } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"; // Component baru
import { Label } from "@/components/ui/label"; // Component baru
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"; // Component baru
import { Invitation } from "@prisma/client";
import { submitRsvp } from "./actions";

export function InvitationClient({ data }: { data: Invitation }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  // Format tanggal
  const formattedDate = new Date(data.eventDate).toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Function saat form dikirim
  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); // Mencegah reload halaman
    setIsSubmitting(true);
    setMessage("");

    const formData = new FormData(event.currentTarget);
    
    // Panggil Server Action (Kirim ke Backend)
    const result = await submitRsvp(formData);

    setMessage(result.message);
    setIsSubmitting(false);

    if (result.success) {
      // Reset form jika sukses
      (event.target as HTMLFormElement).reset();
    }
  }

  return (
    <div className="min-h-screen w-full bg-gray-200 flex justify-center items-start">
      <div className="w-full max-w-[430px] min-h-screen bg-white shadow-2xl relative overflow-hidden">
        
        {/* --- COVER SECTION --- */}
        <div 
            className={`absolute inset-0 z-50 bg-slate-900 text-white flex flex-col items-center justify-center text-center p-6 transition-transform duration-1000 ease-in-out ${isOpen ? '-translate-y-full' : 'translate-y-0'}`}
        >
            <p className="tracking-widest text-sm mb-6 uppercase">The Wedding Of</p>
            <h1 className="text-4xl mb-4 font-serif italic text-yellow-500">
                {data.groomNickname} & {data.brideNickname}
            </h1>
            <p className="mb-8 text-gray-300">{formattedDate}</p>
            
            <Button 
                onClick={() => setIsOpen(true)} 
                className="bg-yellow-600 hover:bg-yellow-700 text-white rounded-full px-8 animate-bounce"
            >
                <Heart className="w-4 h-4 mr-2 fill-current" />
                Buka Undangan
            </Button>
        </div>


        {/* --- KONTEN UTAMA --- */}
        <main className="pb-20">
            {/* Foto Placeholder */}
            <div className="h-64 bg-slate-300 flex items-center justify-center text-slate-500">
                [Foto Prewed]
            </div>

            {/* Mempelai */}
            <section className="py-12 px-6 text-center space-y-8">
                <p className="italic text-gray-500">Assalamu'alaikum Wr. Wb.</p>
                <div>
                    <h3 className="text-2xl font-bold text-slate-800">{data.groomName}</h3>
                    <p className="text-sm text-gray-500">Putra Bpk {data.groomFather} & Ibu {data.groomMother}</p>
                </div>
                <div className="text-3xl text-yellow-600 font-serif">&</div>
                <div>
                    <h3 className="text-2xl font-bold text-slate-800">{data.brideName}</h3>
                    <p className="text-sm text-gray-500">Putri Bpk {data.brideFather} & Ibu {data.brideMother}</p>
                </div>
            </section>

            {/* Event Details */}
            <section className="bg-slate-50 py-12 px-6">
                <h2 className="text-center text-xl font-bold mb-8 uppercase tracking-widest text-slate-700">Save The Date</h2>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 space-y-6">
                    <div className="flex items-start gap-4">
                        <Calendar className="w-6 h-6 text-yellow-600 mt-1" />
                        <div>
                            <p className="font-bold text-slate-800">Akad & Resepsi</p>
                            <p className="text-slate-600">{formattedDate}</p>
                            <p className="text-sm text-slate-500">{data.eventTime}</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-4">
                        <MapPin className="w-6 h-6 text-yellow-600 mt-1" />
                        <div>
                            <p className="font-bold text-slate-800">Lokasi</p>
                            <p className="text-slate-600">{data.locationName}</p>
                            <p className="text-sm text-slate-500 mt-1">{data.locationAddress}</p>
                            {data.mapUrl && (
                                <a href={data.mapUrl} target="_blank" rel="noreferrer">
                                    <Button variant="outline" size="sm" className="mt-3 w-full">Lihat Maps</Button>
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* --- RSVP SECTION & TICKET --- */}
            <section className="py-12 px-6 bg-white border-t border-gray-100" id="rsvp-section">
                <h2 className="text-center text-xl font-bold mb-8 uppercase tracking-widest text-slate-700">
                    {message && message.includes("Terima") ? "E-Ticket Anda" : "Konfirmasi Kehadiran"}
                </h2>
                
                {/* LOGIC: Jika Pesan Sukses Muncul -> Tampilkan Tiket QR */}
                {message && message.includes("Terima") ? (
                    <div className="max-w-sm mx-auto bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl p-8 text-center animate-in zoom-in duration-500">
                        <div className="mb-6 bg-white p-4 rounded-lg inline-block shadow-sm">
                            {/* QR CODE GENERATOR */}
                            {/* Value ini nanti discan oleh panitia */}
                            <QRCode 
                                value={`GUEST-${data.slug}-${new Date().getTime()}`} 
                                size={180}
                                level="M"
                                fgColor="#1e293b" 
                            />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 mb-2">SCAN ME</h3>
                        <p className="text-sm text-slate-500 mb-6">Tunjukkan QR Code ini di meja penerima tamu.</p>
                        
                        <div className="bg-green-100 text-green-800 p-3 rounded-lg text-sm font-medium mb-4">
                            ✅ Data Tersimpan
                        </div>

                        <Button 
                            variant="outline" 
                            className="w-full border-slate-400 text-slate-700 hover:bg-slate-100"
                            onClick={() => window.print()} 
                        >
                            Simpan Tiket
                        </Button>
                    </div>
                ) : (
                    /* ELSE: Tampilkan Form Biasa */
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <input type="hidden" name="invitationId" value={data.id} />
                        <input type="hidden" name="slug" value={data.slug} />

                        <div className="space-y-2">
                            <Label>Nama Lengkap</Label>
                            <Input name="name" placeholder="Nama Anda" required />
                        </div>

                        <div className="space-y-2">
                            <Label>Nomor WhatsApp</Label>
                            <Input name="phone" placeholder="08xxx" type="tel" required />
                        </div>

                        <div className="space-y-2">
                            <Label>Apakah akan hadir?</Label>
                            <RadioGroup defaultValue="ATTENDING" name="status" className="flex gap-4">
                                <div className="flex items-center space-x-2 border p-3 rounded-lg w-full justify-center has-[:checked]:bg-green-50 has-[:checked]:border-green-500 cursor-pointer transition-all">
                                    <RadioGroupItem value="ATTENDING" id="r1" />
                                    <Label htmlFor="r1" className="cursor-pointer">Hadir</Label>
                                </div>
                                <div className="flex items-center space-x-2 border p-3 rounded-lg w-full justify-center has-[:checked]:bg-red-50 has-[:checked]:border-red-500 cursor-pointer transition-all">
                                    <RadioGroupItem value="DECLINED" id="r2" />
                                    <Label htmlFor="r2" className="cursor-pointer">Maaf</Label>
                                </div>
                            </RadioGroup>
                        </div>

                        <Button 
                            type="submit" 
                            className="w-full bg-slate-900 hover:bg-slate-800 h-12 text-lg" 
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? "Mengirim..." : "Kirim Konfirmasi"}
                        </Button>

                        {/* Pesan Error (Jika ada) */}
                        {message && !message.includes("Terima") && (
                            <div className="p-4 rounded-lg text-center text-sm bg-red-100 text-red-800">
                                {message}
                            </div>
                        )}
                    </form>
                )}
            </section>

            {/* Floating Music Button */}
            <div className="fixed bottom-6 right-6 z-40 bg-white p-3 rounded-full shadow-lg border border-gray-200">
                <Music className="w-5 h-5 text-slate-800 animate-spin-slow" />
            </div>
        </main>

      </div>
    </div>
  );
}