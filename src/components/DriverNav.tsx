"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/driver", label: "Overview" },
  { href: "/driver/available", label: "Available rides" },
  { href: "/driver/my-rides", label: "My rides" },
];

export default function DriverNav() {
  const pathname = usePathname();
  return (
    <nav className="flex gap-2 border-b border-white/10 pb-1">
      {TABS.map((tab) => {
        const active =
          tab.href === "/driver"
            ? pathname === "/driver"
            : pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-colors ${
              active
                ? "bg-white/10 text-white border-b-2 border-purple-400"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
