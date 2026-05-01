import { useState, useRef, useEffect, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface HoverCardProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  image?: string;
  revealContent: ReactNode;
  className?: string;
  variant?: "default" | "image" | "gradient" | "bordered";
  gradientFrom?: string;
  gradientTo?: string;
}

export function HoverCard({
  children,
  title,
  subtitle,
  icon,
  image,
  revealContent,
  className,
  variant = "default",
  gradientFrom = "from-teal-600",
  gradientTo = "to-teal-700",
}: HoverCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePosition({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  };

  return (
    <div
      ref={cardRef}
      className={cn(
        "group relative overflow-hidden rounded-xl cursor-pointer",
        "transition-all duration-500 ease-out",
        "hover:shadow-2xl hover:-translate-y-2",
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseMove={handleMouseMove}
    >
      {/* Spotlight effect */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-10"
        style={{
          background: isHovered
            ? `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(255,255,255,0.15) 0%, transparent 50%)`
            : "none",
        }}
      />

      {/* Card background based on variant */}
      {variant === "image" && image && (
        <>
          <img
            src={image}
            alt={title}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/30 group-hover:from-black/95 group-hover:via-black/70 transition-all duration-500" />
        </>
      )}

      {variant === "gradient" && (
        <div className={cn("absolute inset-0 bg-gradient-to-br", gradientFrom, gradientTo)} />
      )}

      {variant === "bordered" && (
        <div className="absolute inset-0 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 group-hover:border-teal-500 dark:group-hover:border-teal-400 transition-colors duration-500" />
      )}

      {variant === "default" && (
        <div className="absolute inset-0 bg-white dark:bg-slate-900 shadow-md group-hover:shadow-xl transition-shadow duration-500" />
      )}

      {/* Content container */}
      <div className="relative z-20 p-6 h-full flex flex-col">
        {/* Header - always visible */}
        <div className="flex items-start gap-3 mb-4">
          {icon && (
            <div
              className={cn(
                "w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0",
                "transition-all duration-500",
                variant === "default" && "bg-teal-50 text-teal-600 group-hover:bg-teal-600 group-hover:text-white",
                variant === "gradient" && "bg-white/20 text-white",
                variant === "bordered" && "bg-slate-100 text-slate-600 group-hover:bg-teal-50 group-hover:text-teal-600",
                variant === "image" && "bg-white/20 backdrop-blur-sm text-white"
              )}
            >
              {icon}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3
              className={cn(
                "text-lg font-bold transition-colors duration-300",
                variant === "default" && "text-slate-900 dark:text-white group-hover:text-teal-600",
                variant === "gradient" && "text-white",
                variant === "bordered" && "text-slate-900 dark:text-white group-hover:text-teal-600",
                variant === "image" && "text-white"
              )}
            >
              {title}
            </h3>
            {subtitle && (
              <p
                className={cn(
                  "text-sm mt-1 transition-colors duration-300",
                  variant === "default" && "text-slate-500 dark:text-slate-400",
                  variant === "gradient" && "text-white/80",
                  variant === "bordered" && "text-slate-500",
                  variant === "image" && "text-white/70"
                )}
              >
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Default content - visible by default, slides up on hover */}
        <div
          className={cn(
            "transition-all duration-500 ease-out",
            isHovered ? "opacity-0 -translate-y-4 max-h-0 overflow-hidden" : "opacity-100 translate-y-0 max-h-40"
          )}
        >
          {children}
        </div>

        {/* Reveal content - hidden by default, slides in on hover */}
        <div
          className={cn(
            "mt-4 transition-all duration-500 ease-out",
            isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 max-h-0 overflow-hidden"
          )}
        >
          <div
            className={cn(
              "pt-4 border-t",
              variant === "default" && "border-slate-100 dark:border-slate-800",
              variant === "gradient" && "border-white/20",
              variant === "bordered" && "border-slate-100",
              variant === "image" && "border-white/20"
            )}
          >
            {revealContent}
          </div>
        </div>

        {/* Hover indicator arrow */}
        <div
          className={cn(
            "absolute bottom-4 right-4 transition-all duration-500",
            isHovered ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2"
          )}
        >
          <svg
            className={cn(
              "w-5 h-5",
              variant === "gradient" || variant === "image" ? "text-white" : "text-teal-600"
            )}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </div>
      </div>

      {/* Animated border on hover */}
      <div
        className={cn(
          "absolute inset-0 rounded-xl pointer-events-none",
          "opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        )}
      >
        <div
          className="absolute inset-0 rounded-xl"
          style={{
            padding: "2px",
            background: `linear-gradient(90deg, transparent, rgba(20, 184, 166, 0.5), transparent)`,
            mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
            maskComposite: "exclude",
            WebkitMaskComposite: "xor",
          }}
        />
      </div>
    </div>
  );
}

// Card Grid component for displaying multiple hover cards
interface HoverCardGridProps {
  cards: Array<{
    title: string;
    subtitle?: string;
    icon?: ReactNode;
    image?: string;
    content: ReactNode;
    revealContent: ReactNode;
    variant?: "default" | "image" | "gradient" | "bordered";
    gradientFrom?: string;
    gradientTo?: string;
  }>;
  className?: string;
  columns?: 1 | 2 | 3 | 4;
}

export function HoverCardGrid({ cards, className, columns = 3 }: HoverCardGridProps) {
  const columnClasses = {
    1: "grid-cols-1",
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
  };

  return (
    <div className={cn("grid gap-6", columnClasses[columns], className)}>
      {cards.map((card, index) => (
        <HoverCard
          key={index}
          title={card.title}
          subtitle={card.subtitle}
          icon={card.icon}
          image={card.image}
          revealContent={card.revealContent}
          variant={card.variant}
          gradientFrom={card.gradientFrom}
          gradientTo={card.gradientTo}
          className="min-h-[200px]"
        >
          {card.content}
        </HoverCard>
      ))}
    </div>
  );
}

export default HoverCard;
