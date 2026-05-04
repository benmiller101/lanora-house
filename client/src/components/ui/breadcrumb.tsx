import { Link } from "wouter";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

// Export individual components for compatibility
export { BreadcrumbItem };
export const BreadcrumbLink = Link;
export const BreadcrumbSeparator = ({ className, ...props }: any) => (
  <ChevronRight className={cn("w-4 h-4 text-neutral-wood/40", className)} {...props} />
);

export function Breadcrumb({ items, className = "" }: BreadcrumbProps) {
  return (
    <nav className={`flex items-center space-x-1 text-sm text-neutral-wood/70 ${className}`} aria-label="Breadcrumb">
      <Link href="/">
        <a className="hover:text-neutral-wood transition-colors p-1">
          <Home className="w-4 h-4" />
        </a>
      </Link>
      
      {items.map((item, index) => (
        <div key={index} className="flex items-center space-x-1">
          <ChevronRight className="w-4 h-4 text-neutral-wood/40" />
          {item.href && index < items.length - 1 ? (
            <Link href={item.href}>
              <a className="hover:text-neutral-wood transition-colors capitalize">
                {item.label}
              </a>
            </Link>
          ) : (
            <span className="text-neutral-wood font-medium capitalize">
              {item.label}
            </span>
          )}
        </div>
      ))}
    </nav>
  );
}