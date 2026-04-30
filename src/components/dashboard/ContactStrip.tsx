import { Info, Phone, Mail, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useSiteContent } from "@/lib/siteContent";

const ContactStrip = () => {
  const section = useSiteContent("contact_strip");
  const content = section.content as {
    phone: string;
    phoneNote: string;
    email: string;
    emailNote: string;
    buttonLabel: string;
  };

  return (
    <div className="bg-card rounded-2xl border border-border card-shadow p-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center shrink-0">
            <Info className="h-5 w-5 text-secondary" />
          </div>
          <div>
            <div className="font-bold text-sm">{section.title}</div>
            <div className="text-xs text-muted-foreground">{section.subtitle}</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center shrink-0">
            <Phone className="h-5 w-5 text-secondary" />
          </div>
          <div>
            <div className="font-bold text-sm">{content.phone}</div>
            <div className="text-xs text-muted-foreground">{content.phoneNote}</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center shrink-0">
            <Mail className="h-5 w-5 text-secondary" />
          </div>
          <div className="min-w-0">
            <div className="font-bold text-sm truncate">{content.email}</div>
            <div className="text-xs text-muted-foreground">{content.emailNote}</div>
          </div>
        </div>

        <Button asChild variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground rounded-full font-bold h-12 gap-2">
          <Link to="/contact">
            {content.buttonLabel} <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default ContactStrip;
