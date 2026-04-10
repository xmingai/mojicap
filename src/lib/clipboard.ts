"use client";

import { toast } from "sonner";

export async function copyToClipboard(text: string, label?: string) {
  try {
    await navigator.clipboard.writeText(text);
    toast.success(`Copied ${label || text}`, {
      duration: 1500,
      position: "bottom-center",
    });
    return true;
  } catch {
    // Fallback for older browsers
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    document.body.removeChild(textarea);
    toast.success(`Copied ${label || text}`, {
      duration: 1500,
      position: "bottom-center",
    });
    return true;
  }
}
