"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function OwnerDeleteCarButton({
  id,
  name,
}: {
  id: number;
  name: string;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleDelete = async () => {
    if (!window.confirm(`Delete car "${name}"?`)) return;

    setSubmitting(true);
    setError("");
    try {
      const res = await fetch(`/api/owner/cars/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Could not delete.");
        return;
      }
      router.refresh();
    } catch {
      setError("Connection error.");
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
        {submitting ? "Deleting..." : "Delete"}
      </button>
      {error && <span className="text-xs text-red-300">{error}</span>}
    </div>
  );
}
