"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  type: "ride" | "rental";
  id: string;
};

export default function CancelBookingButton({ type, id }: Props) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleCancel = async () => {
    if (!window.confirm("Cancel this booking?")) return;

    setSubmitting(true);
    setError("");

    try {
      const res = await fetch(`/api/booking/${type}/${id}/cancel`, {
        method: "POST",
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Could not cancel.");
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
        onClick={handleCancel}
        disabled={submitting}
        className="text-xs text-red-300 hover:text-red-200 disabled:opacity-60 underline-offset-2 hover:underline"
      >
        {submitting ? "Cancelling..." : "Cancel booking"}
      </button>
      {error && <span className="text-xs text-red-300">{error}</span>}
    </div>
  );
}
