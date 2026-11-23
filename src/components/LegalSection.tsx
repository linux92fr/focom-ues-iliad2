import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface LegalSectionProps {
  id?: string;
  number: string;
  title: string;
  icon: LucideIcon;
  children: ReactNode;
}

export function LegalSection({
  id,
  number,
  title,
  icon: Icon,
  children,
}: LegalSectionProps) {
  return (
    <Card
      id={id}
      className="scroll-mt-6 overflow-hidden rounded-3xl border-slate-200/80 bg-white shadow-sm shadow-slate-900/[0.03]"
    >
      <CardHeader className="border-b border-slate-100 px-5 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-red-50 text-xs font-extrabold tracking-wide text-red-600 ring-1 ring-red-100">
            {number}
          </span>
          <CardTitle className="min-w-0 flex-1 text-lg font-extrabold tracking-tight text-slate-900 sm:text-xl">
            {title}
          </CardTitle>
          <Icon className="h-5 w-5 shrink-0 text-teal-600" aria-hidden="true" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4 px-5 py-5 text-sm leading-7 text-slate-600 sm:px-6">
        {children}
      </CardContent>
    </Card>
  );
}
