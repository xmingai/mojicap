"use client";

import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import { useState } from "react";
import { copyToClipboard } from "@/lib/clipboard";

export function CopyButton({ emoji, name }: { emoji: string; name: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await copyToClipboard(emoji, name);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button onClick={handleCopy} size="lg" className="mt-2">
      {copied ? (
        <>
          <Check className="h-4 w-4 mr-2" /> Copied!
        </>
      ) : (
        <>
          <Copy className="h-4 w-4 mr-2" /> Copy {emoji}
        </>
      )}
    </Button>
  );
}
