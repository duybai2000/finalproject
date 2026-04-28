"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type CarInput = {
  name: string;
  type: string;
  seats: number;
  auto: boolean;
  dailyRate: number;
  img: string;
  description: string;
  active: boolean;
};

type Props = {
  mode: "create" | "edit";
  carId?: number;
  initial?: Partial<CarInput>;
};

export default function OwnerCarForm({ mode, carId, initial }: Props) {
  const [name, setName] = useState(initial?.name ?? "");
  const [type, setType] = useState(initial?.type ?? "Standard");
  const [seats, setSeats] = useState(initial?.seats ?? 4);
  const [auto, setAuto] = useState(initial?.auto ?? true);
  const [dailyRate, setDailyRate] = useState(initial?.dailyRate ?? 700_000);
  const [img, setImg] = useState(initial?.img ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [active, setActive] = useState(initial?.active ?? true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const url =
      mode === "create" ? "/api/owner/cars" : `/api/owner/cars/${carId}`;
    const method = mode === "create" ? "POST" : "PATCH";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          type,
          seats,
          auto,
          dailyRate,
          img,
          description: description || undefined,
          active,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.error || "Could not save car.");
        return;
      }

      router.push("/owner/cars");
      router.refresh();
    } catch {
      setError("Connection error.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4 max-w-2xl"
    >
      <Field label="Car name">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          maxLength={100}
          className={inputClass}
          placeholder="e.g. Honda Civic 2022"
        />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Type">
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className={inputClass}
            required
          >
            <option className="bg-slate-800">Economy</option>
            <option className="bg-slate-800">Standard</option>
            <option className="bg-slate-800">Premium</option>
            <option className="bg-slate-800">Family</option>
            <option className="bg-slate-800">SUV</option>
          </select>
        </Field>

        <Field label="Seats">
          <input
            type="number"
            min={1}
            max={64}
            value={seats}
            onChange={(e) => setSeats(Number(e.target.value))}
            required
            className={inputClass}
          />
        </Field>
      </div>

      <Field label="Daily rate (VND/day)">
        <input
          type="number"
          min={1}
          step={1000}
          value={dailyRate}
          onChange={(e) => setDailyRate(Number(e.target.value))}
          required
          className={inputClass}
        />
      </Field>

      <Field label="Image URL">
        <input
          type="url"
          value={img}
          onChange={(e) => setImg(e.target.value)}
          required
          className={inputClass}
          placeholder="https://..."
        />
      </Field>

      <Field label="Description">
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          maxLength={1000}
          className={inputClass + " resize-none"}
          placeholder="Year, condition, key features, interior, recent service..."
        />
      </Field>

      <div className="flex gap-6 pt-2">
        <label className="flex items-center gap-2 text-sm text-gray-300">
          <input
            type="checkbox"
            checked={auto}
            onChange={(e) => setAuto(e.target.checked)}
            className="w-4 h-4 accent-emerald-500"
          />
          Automatic transmission
        </label>

        <label className="flex items-center gap-2 text-sm text-gray-300">
          <input
            type="checkbox"
            checked={active}
            onChange={(e) => setActive(e.target.checked)}
            className="w-4 h-4 accent-emerald-500"
          />
          List publicly
        </label>
      </div>

      {error && (
        <div className="rounded-xl border border-red-400/30 bg-red-500/15 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={submitting}
          className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-white font-semibold py-2 px-5 rounded-xl"
        >
          {submitting ? "Saving..." : mode === "create" ? "List car" : "Update"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/owner/cars")}
          className="bg-white/10 hover:bg-white/20 text-white font-semibold py-2 px-5 rounded-xl"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

const inputClass =
  "w-full bg-white/5 border border-white/10 text-white placeholder:text-gray-500 px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm text-gray-300 block mb-1">{label}</span>
      {children}
    </label>
  );
}
