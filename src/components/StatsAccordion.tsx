import { useId } from "react";
import { ChevronDown } from "lucide-react";

type StatsAccordionItem = {
  number: string;
  label: string;
  description: string;
};

type StatsAccordionProps = {
  items: StatsAccordionItem[];
};

export default function StatsAccordion({ items }: StatsAccordionProps) {
  const titleId = useId();

  return (
    <section className="stats-accordion-section py-12 gradient-hero" aria-labelledby={titleId}>
      <div className="container mx-auto px-4">
        <h2
          id={titleId}
          className="mb-6 text-center font-serif text-3xl font-bold text-primary-foreground"
        >
          FOCOM en chiffres
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item) => (
            <details
              key={item.label}
              className="stats-accordion-item rounded-2xl border border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground"
            >
              <summary className="flex min-h-24 cursor-pointer list-none items-center justify-between gap-4 rounded-2xl px-5 py-5 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-foreground">
                <span>
                  <span className="block font-serif text-4xl font-bold">{item.number}</span>
                  <span className="mt-1 block text-sm uppercase tracking-wider text-primary-foreground/80">
                    {item.label}
                  </span>
                </span>
                <ChevronDown className="stats-accordion-chevron h-5 w-5 shrink-0" aria-hidden="true" />
              </summary>
              <div className="px-5 pb-5 text-sm leading-relaxed text-primary-foreground/90">
                <p>{item.description}</p>
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
