"use client";

import { useState } from "react";

export default function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    // Mock submit — log to console, then "succeed" after a tiny delay.
    console.log("[contact form]", { name, email, message });
    await new Promise((r) => setTimeout(r, 600));

    setSuccess(true);
    setName("");
    setEmail("");
    setMessage("");
    setSubmitting(false);
  };

  if (success) {
    return (
      <div className="bg-emerald-500/10 border border-emerald-400/30 rounded-2xl p-6 text-emerald-100">
        <h3 className="text-lg font-semibold">Đã gửi tin nhắn!</h3>
        <p className="text-sm text-emerald-200/80 mt-1">
          Cảm ơn bạn đã liên hệ. Chúng tôi sẽ phản hồi sớm nhất.
        </p>
        <button
          type="button"
          onClick={() => setSuccess(false)}
          className="text-sm text-emerald-300 hover:text-emerald-200 mt-3 underline"
        >
          Gửi tin nhắn khác
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4"
    >
      <Field label="Họ và tên">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className={inputClass}
        />
      </Field>
      <Field label="Email">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className={inputClass}
        />
      </Field>
      <Field label="Nội dung">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
          rows={5}
          className={inputClass + " resize-none"}
        />
      </Field>
      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold py-3 rounded-xl"
      >
        {submitting ? "Đang gửi..." : "Gửi tin nhắn"}
      </button>
    </form>
  );
}

const inputClass =
  "w-full bg-slate-900/50 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-sm text-gray-300 mb-1 block">{label}</span>
      {children}
    </label>
  );
}
