"use client";

import { Share2 } from "lucide-react";
import Button from "../Button";

interface ShareButtonProps {
  title: string;
  text?: string;
  url?: string;
}

export default function ShareButton({ title, text, url }: ShareButtonProps) {
  const handleShare = async () => {
    const shareUrl = url || window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: text || "Check out this pottery!",
          url: shareUrl,
        });
      } catch (error) {
        console.error("Error sharing:", error);
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl);
        alert("Link copied to clipboard!");
      } catch (err) {
        console.error("Could not copy text: ", err);
      }
    }
  };

  return (
    <Button onClick={handleShare} variant="naked">
      <Share2 size={24} />
    </Button>
  );
}
