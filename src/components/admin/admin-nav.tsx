"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/admin", label: "Dashboard", exact: true },
  { href: "/admin/clients", label: "Clients", exact: false },
  { href: "/admin/developers", label: "Developers", exact: false },
  { href: "/admin/requests", label: "Requests", exact: false },
];

export function AdminNav() {
  const pathname = usePathname();
  return (
    <nav className="flex gap-1 overflow-x-auto md:flex-col md:gap-0.5">
      {LINKS.map((link) => {
        const active = link.exact ? pathname === link.href : pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "whitespace-nowrap rounded-lg px-3.5 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-white text-ink shadow-[0_1px_2px_rgba(16,24,43,0.06)] md:bg-green-tint md:text-green md:shadow-none"
                : "text-muted-ink hover:text-ink"
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
