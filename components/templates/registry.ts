// components/templates/registry.ts

import WoodVibe from "@/components/templates/WoodVibe";

// Mapping antara ThemeType (Database) dengan Component (File React)
// Key di sini HARUS sama persis dengan enum ThemeType di prisma/schema.prisma
// yaitu: RUSTIC_A, LUXURY_GOLD, MINIMALIST_B, CUSTOM_CODE

export const templateRegistry: Record<string, any> = {
  "RUSTIC_A": WoodVibe,

  // Karena template lain belum dibuat, kita arahkan sementara ke WoodVibe (Fallback)
  // Ini mencegah error jika di database tersetting 'LUXURY_GOLD' tapi filenya belum ada.
  "LUXURY_GOLD": WoodVibe,     
  "MINIMALIST_B": WoodVibe,   
  "CUSTOM_CODE": WoodVibe,    
};

// Fungsi Helper untuk mengambil komponen yang aman
export function getTemplate(theme: string | null | undefined) {
  // Jika theme kosong/null, default ke RUSTIC_A
  if (!theme) return templateRegistry["RUSTIC_A"];

  const Component = templateRegistry[theme];

  // Jika tema yang diminta tidak ada di daftar registry, return default (WoodVibe)
  return Component || templateRegistry["RUSTIC_A"];
}