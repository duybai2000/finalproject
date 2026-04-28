"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AcceptRideButton({ id }: { id: string }) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleAccept = async () => {
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch(`/api/driver/rides/${id}/accept`, {
        method: "POST",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Could not accept this ride.");
        return;
      }
      router.push("/driver/my-rides");
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
        onClick={handleAccept}
        disabled={submitting}
        className="bg-purple-500 hover:bg-purple-600 disabled:opacity-60 text-white text-sm font-semibold px-3 py-1.5 rounded-lg"
      >
        {submitting ? "Accepting..." : "Accept"}
      </button>
      {error && <span className="text-xs text-red-300">{error}</span>}
    </div>
  );
}
