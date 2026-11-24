import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import { openWhatsAppShare } from "@/lib/whatsapp";

interface ShareWhatsAppButtonProps {
  text: string;
  label?: string;
  variant?: "default" | "outline" | "ghost" | "secondary" | "link";
  size?: "default" | "sm" | "icon" | "lg";
  className?: string;
}

export const ShareWhatsAppButton = ({
  text,
  label = "WhatsApp",
  variant = "outline",
  size = "sm",
  className,
}: ShareWhatsAppButtonProps) => {
  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      className={className}
      onClick={() => openWhatsAppShare(text)}
      aria-label={label === "WhatsApp" ? "Partager sur WhatsApp" : `Partager sur WhatsApp : ${label}`}
    >
      <MessageCircle className="h-4 w-4 mr-2 text-green-600" />
      {size !== "icon" && <span>{label}</span>}
    </Button>
  );
};

export default ShareWhatsAppButton;
