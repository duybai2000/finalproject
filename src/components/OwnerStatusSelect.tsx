"use client";

import { useState } from "react";

type Props = {
  id: string;
  initial: string;
  options: readonly string[];
};

export default function OwnerStatusSelect({ id, initial, options }: Props) {
  const [status, setStatus] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleChange = async (next: string) => {
    const previous = status;
    setStatus(next);
    setSaving(true);
    setError("");

    try {
      const res = await fetch(`/api/owner/booking/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Could not update.");
        setStatus(previous);
      }
    } catch {
      setError("Connection error.");
      setStatus(previous);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <select
        value={status}
        disabled={saving}
        onChange={(e) => handleChange(e.target.value)}
        className="bg-slate-800 border border-white/20 text-white text-xs px-2 py-1 rounded disabled:opacity-60"
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
      {error && <span className="text-xs text-red-300">{error}</span>}
    </div>
  );
}
