"use client"; // Wajib ada karena kita pakai interaksi (klik)

import { useState } from "react";
import { Button } from "@/components/ui/button"; // Kita pakai tombol gaya shadcn

export function TombolLike() {
  // STATE: [variable, pengubahVariable] = useState(nilaiAwal)
  const [likes, setLikes] = useState(0);

  return (
    <div className="flex flex-col items-center gap-4 p-6 border rounded-lg shadow-sm mt-8 bg-white">
      <h3 className="text-lg font-semibold">Test React State</h3>
      
      <p className="text-gray-600">
        Jumlah Likes: <span className="font-bold text-blue-600 text-2xl">{likes}</span>
      </p>

      {/* Saat diklik, panggil setLikes, ambil nilai prev (sebelumnya) + 1 */}
      <Button 
        onClick={() => setLikes(likes + 1)}
        className="bg-blue-500 hover:bg-blue-600"
      >
        👍 Like Disini
      </Button>

      {/* Tombol Reset (Bonus Logic) */}
      <Button 
        variant="outline"
        onClick={() => setLikes(0)}
      >
        Reset
      </Button>
    </div>
  );
}