"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function DeleteCarButton({ id, name }: { id: number; name: string }) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleDelete = async () => {
    if (!window.confirm(`Xoa xe "${name}"?`)) return;

    setSubmitting(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/cars/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Khong xoa duoc.");
        return;
      }
      router.refresh();
    } catch {
      setError("Loi ket noi.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={handleDelete}
        disabled={submitting}
        className="text-xs text-red-300 hover:text-red-200 disabled:opacity-60"
      >
        {submitting ? "Dang xoa..." : "Xoa"}
      </button>
      {error && <span className="text-xs text-red-300">{error}</span>}
    </div>
  );
}
