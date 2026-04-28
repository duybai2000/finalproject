"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/admin", label: "Tong quan" },
  { href: "/admin/cars", label: "Quan ly xe" },
  { href: "/admin/users", label: "Nguoi dung" },
];

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-2 border-b border-white/10 pb-1">
      {TABS.map((tab) => {
        const active =
          tab.href === "/admin"
            ? pathname === "/admin"
            : pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-colors ${
              active
                ? "bg-white/10 text-white border-b-2 border-emerald-400"
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
