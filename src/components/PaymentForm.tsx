"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CreditCard, Lock } from "lucide-react";
import BackLink from "@/components/BackLink";

type Props = {
  type: "ride" | "rental";
  id: string;
  amount: number;
  label: string;
};

export default function PaymentForm({ type, id, amount, label }: Props) {
  const [cardNumber, setCardNumber] = useState("");
  const [name, setName] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const formatCard = (raw: string) =>
    raw
      .replace(/\D/g, "")
      .slice(0, 16)
      .replace(/(.{4})/g, "$1 ")
      .trim();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (cardNumber.replace(/\s/g, "").length < 12) {
      setError("Card number is invalid.");
      return;
    }
    if (!name.trim()) {
      setError("Please enter the cardholder name.");
      return;
    }
    if (!/^\d{2}\/\d{2}$/.test(expiry)) {
      setError("Expiry date must be in MM/YY format.");
      return;
    }
    if (!/^\d{3,4}$/.test(cvv)) {
      setError("CVV is invalid.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const res = await fetch(`/api/payment/${type}/${id}`, {
        method: "POST",
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.error || "Payment could not be completed.");
        return;
      }

      router.push(`/booking/${type}/${id}?paid=1`);
    } catch {
      setError("Connection error.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 px-6 md:px-12 text-white">
      <div className="max-w-xl mx-auto">
        <div className="mb-4">
          <BackLink href={`/booking/${type}/${id}`} label="Back to booking" />
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 mb-6">
          <h1 className="text-2xl font-bold mb-2">Payment</h1>
          <p className="text-sm text-gray-400">{label}</p>
          <p className="mt-3 text-3xl font-bold text-emerald-400">
            {amount.toLocaleString("en-US")} VND
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-white/10 bg-gradient-to-br from-blue-900/40 to-slate-800/40 p-6 space-y-4"
        >
          <div className="flex items-center gap-2 text-gray-300 mb-2">
            <CreditCard className="w-5 h-5" />
            <span className="font-semibold">Card details</span>
          </div>

          <label className="block">
            <span className="text-sm text-gray-300">Card number</span>
            <input
              type="text"
              value={cardNumber}
              onChange={(e) => setCardNumber(formatCard(e.target.value))}
              placeholder="4242 4242 4242 4242"
              inputMode="numeric"
              className="mt-1 w-full bg-white/5 border border-white/10 text-white placeholder:text-gray-500 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </label>

          <label className="block">
            <span className="text-sm text-gray-300">Cardholder name</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value.toUpperCase())}
              placeholder="JOHN DOE"
              className="mt-1 w-full bg-white/5 border border-white/10 text-white placeholder:text-gray-500 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-sm text-gray-300">Expiry (MM/YY)</span>
              <input
                type="text"
                value={expiry}
                onChange={(e) => {
                  const raw = e.target.value.replace(/\D/g, "").slice(0, 4);
                  const next =
                    raw.length > 2 ? `${raw.slice(0, 2)}/${raw.slice(2)}` : raw;
                  setExpiry(next);
                }}
                placeholder="12/28"
                inputMode="numeric"
                className="mt-1 w-full bg-white/5 border border-white/10 text-white placeholder:text-gray-500 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </label>

            <label className="block">
              <span className="text-sm text-gray-300">CVV</span>
              <input
                type="text"
                value={cvv}
                onChange={(e) =>
                  setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))
                }
                placeholder="123"
                inputMode="numeric"
                className="mt-1 w-full bg-white/5 border border-white/10 text-white placeholder:text-gray-500 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </label>
          </div>

          {error && (
            <div className="rounded-xl border border-red-400/30 bg-red-500/15 px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-70 text-white font-semibold py-3 px-6 rounded-xl shadow-lg transition-all"
          >
            {submitting ? "Processing..." : "Pay"}
          </button>

          <p className="flex items-center justify-center gap-2 text-xs text-gray-400 pt-2">
            <Lock className="w-3 h-3" />
            Transactions are encrypted. We do not store your card details.
          </p>
        </form>
      </div>
    </div>
  );
}
