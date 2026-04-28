"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

type Option = { value: string; label: string };

type Props = {
  options: Option[];
  paramName?: string;
};

export default function StatusFilter({ options, paramName = "status" }: Props) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current = searchParams.get(paramName) ?? "";

  const buildHref = (value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) params.set(paramName, value);
    else params.delete(paramName);
    const qs = params.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  };

  const active = (value: string) => current === value;
  const all: Option = { value: "", label: "Tất cả" };

  return (
    <div className="flex flex-wrap gap-2">
      {[all, ...options].map((opt) => (
        <Link
          key={opt.value || "all"}
          href={buildHref(opt.value)}
          className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
            active(opt.value)
              ? "bg-blue-600/30 border-blue-400 text-white"
              : "bg-white/5 border-white/10 text-gray-300 hover:border-white/30"
          }`}
        >
          {opt.label}
        </Link>
      ))}
    </div>
  );
}
