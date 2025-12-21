// components/templates/registry.ts
import dynamic from 'next/dynamic';
import { ComponentType } from 'react';

// Tipe props yang wajib diterima semua template
// Agar Anda tidak pusing saat gonta-ganti template
export interface TemplateProps {
  data: any;  // Data Undangan (Invitation + Guests)
  guest: any; // Data Tamu yang sedang login (bisa null)
}

// MAPPING: Kunci Enum Database -> Komponen File
// Perhatikan: Kita pakai fungsi () => import(...)
export const TEMPLATE_REGISTRY: Record<string, ComponentType<TemplateProps>> = {
  // --- Kategori Rustic ---
  'RUSTIC_A': dynamic(() => import('./rustic/WoodVibe')),
  'RUSTIC_B': dynamic(() => import('./rustic/GreenLeaf')),
  
  // --- Kategori Luxury ---
  'LUXURY_GOLD': dynamic(() => import('./luxury/GoldFloral')),
  'LUXURY_BLUE': dynamic(() => import('./luxury/RoyalBlue')),

  // --- Kategori Minimalist ---
  'MINIMAL_SIMPLE': dynamic(() => import('./minimalist/CleanWhite')),

  // --- Custom Project (Undangan Mahal) ---
  'CUSTOM_SULTAN_01': dynamic(() => import('./custom/CustomRaffiGigi')),
};

// Fungsi helper untuk mengambil component
export function getTemplateComponent(themeCode: string) {
  const Component = TEMPLATE_REGISTRY[themeCode];
  
  // Fallback jika tema tidak ditemukan (misal kode salah/hapus)
  if (!Component) {
    return dynamic(() => import('./minimalist/CleanWhite')); // Default aman
  }
  
  return Component;
}