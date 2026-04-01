"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import Button from "@/components/ui/Button";
import { Check, Copy } from "lucide-react";

export default function CopyButton({ text, label = "Copy", className = "" }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success("Copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Failed to copy");
    }
  }

  return (
    <Button 
      variant="secondary" 
      onClick={handleCopy}
      className={`flex items-center gap-2 ${className}`}
    >
      {copied ? (
        <>
          <Check className="w-4 h-4" />
          Copied
        </>
      ) : (
        <>
          <Copy className="w-4 h-4" />
          {label}
        </>
      )}
    </Button>
  );
}
