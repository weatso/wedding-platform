import { TombolLike } from "@/components/TombolLike"; // Import dulu

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-50">
      <h1 className="text-4xl font-bold text-slate-800 mb-4">Project Wedding Dimulai</h1>
      <p className="text-slate-500">Belajar Next.js & React dari nol.</p>
      
      {/* Tempel Component disini */}
      <TombolLike /> 
      
    </main>
  )
}