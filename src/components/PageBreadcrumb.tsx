import { Link } from "react-router-dom";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export interface BreadcrumbStep {
  label: string;
  href?: string;
}

interface PageBreadcrumbProps {
  steps: BreadcrumbStep[];
  className?: string;
}

export function PageBreadcrumb({ steps, className }: PageBreadcrumbProps) {
  return (
    <Breadcrumb className={className}>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link to="/">Accueil</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>

        {steps.map((step, i) => (
          <span key={i} className="contents">
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              {step.href && i < steps.length - 1 ? (
                <BreadcrumbLink asChild>
                  <Link to={step.href}>{step.label}</Link>
                </BreadcrumbLink>
              ) : (
                <BreadcrumbPage className="max-w-[220px] truncate" title={step.label}>
                  {step.label}
                </BreadcrumbPage>
              )}
            </BreadcrumbItem>
          </span>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
