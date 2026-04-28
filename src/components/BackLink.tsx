import Link from "next/link";
import { ArrowLeft } from "lucide-react";

type Props = {
  href: string;
  label?: string;
  className?: string;
};

export default function BackLink({
  href,
  label = "Back",
  className = "",
}: Props) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-2 text-sm text-gray-300 hover:text-white transition-colors ${className}`}
    >
      <ArrowLeft className="w-4 h-4" />
      {label}
    </Link>
  );
}
