"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Star } from "lucide-react";

type Props = {
  type: "ride" | "rental";
  id: string;
};

export default function RatingForm({ type, id }: Props) {
  const [open, setOpen] = useState(false);
  const [score, setScore] = useState(5);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch(`/api/booking/${type}/${id}/rate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          score,
          comment: comment.trim() || undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Không gửi được đánh giá.");
        return;
      }
      setOpen(false);
      router.refresh();
    } catch {
      setError("Lỗi kết nối.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-xs text-amber-300 hover:text-amber-200 underline-offset-2 hover:underline"
      >
        Đánh giá
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full bg-slate-800/80 border border-white/10 rounded-xl p-3 mt-2 space-y-2"
    >
      <div className="flex justify-center gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onMouseEnter={() => setHover(n)}
            onMouseLeave={() => setHover(0)}
            onClick={() => setScore(n)}
            className="p-0.5"
          >
            <Star
              className={`w-6 h-6 ${
                (hover || score) >= n
                  ? "fill-amber-400 text-amber-400"
                  : "text-gray-600"
              }`}
            />
          </button>
        ))}
      </div>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={2}
        maxLength={500}
        placeholder="Cảm nhận của bạn (tùy chọn)..."
        className="w-full bg-slate-900/50 border border-white/10 text-white text-xs rounded-lg px-3 py-2 resize-none"
      />
      {error && <p className="text-xs text-red-300 text-center">{error}</p>}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={submitting}
          className="flex-1 bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-white text-xs font-semibold py-1.5 rounded-lg"
        >
          {submitting ? "Đang gửi..." : "Gửi"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="bg-white/10 hover:bg-white/20 text-white text-xs font-semibold px-3 py-1.5 rounded-lg"
        >
          Hủy
        </button>
      </div>
    </form>
  );
}
