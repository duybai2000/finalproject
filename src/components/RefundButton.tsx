"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  type: "ride" | "rental";
  id: string;
};

export default function RefundButton({ type, id }: Props) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleRefund = async () => {
    if (!window.confirm("Cancel this booking and refund the customer?")) return;
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/booking/${type}/${id}/refund`, {
        method: "POST",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Could not process refund.");
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
        onClick={handleRefund}
        disabled={submitting}
        className="bg-red-500/80 hover:bg-red-500 disabled:opacity-60 text-white text-sm font-semibold px-4 py-2 rounded-xl"
      >
        {submitting ? "Processing..." : "Cancel & refund"}
      </button>
      {error && <span className="text-xs text-red-300">{error}</span>}
    </div>
  );
}
