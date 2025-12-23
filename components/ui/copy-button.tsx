'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Reset icon setelah 2 detik
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <Button 
      size="icon" 
      variant="outline" 
      className="h-8 w-8" 
      onClick={handleCopy}
      type="button" // PENTING: Agar tidak men-submit form jika ada di dalam form
      title="Salin Link"
    >
      {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4 text-slate-500" />}
    </Button>
  );
}