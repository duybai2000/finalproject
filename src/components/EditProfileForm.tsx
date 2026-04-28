"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  initialName: string;
};

export default function EditProfileForm({ initialName }: Props) {
  const [name, setName] = useState(initialName);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccess("");
    setError("");

    const body: Record<string, string> = {};
    if (name && name !== initialName) body.name = name;
    if (newPassword) {
      if (!currentPassword) {
        setError("Cần nhập mật khẩu hiện tại để đổi mật khẩu.");
        setSubmitting(false);
        return;
      }
      body.currentPassword = currentPassword;
      body.newPassword = newPassword;
    }

    if (Object.keys(body).length === 0) {
      setError("Không có thay đổi nào.");
      setSubmitting(false);
      return;
    }

    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Không cập nhật được.");
        return;
      }
      setSuccess("Đã cập nhật thông tin.");
      setCurrentPassword("");
      setNewPassword("");
      router.refresh();
    } catch {
      setError("Lỗi kết nối.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4"
    >
      <h3 className="text-lg font-semibold">Chỉnh sửa thông tin</h3>

      <Field label="Họ và tên">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={100}
          className={inputClass}
        />
      </Field>

      <div className="border-t border-white/10 pt-4 space-y-3">
        <p className="text-sm text-gray-400">
          Đổi mật khẩu (để trống nếu không đổi)
        </p>
        <Field label="Mật khẩu hiện tại">
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Mật khẩu mới">
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            minLength={6}
            className={inputClass}
          />
        </Field>
      </div>

      {error && (
        <div className="rounded-xl border border-red-400/30 bg-red-500/15 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-xl border border-emerald-400/30 bg-emerald-500/15 px-4 py-3 text-sm text-emerald-200">
          {success}
        </div>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold py-2 px-5 rounded-xl"
      >
        {submitting ? "Đang lưu..." : "Cập nhật"}
      </button>
    </form>
  );
}

const inputClass =
  "w-full bg-slate-900/50 border border-white/10 text-white rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-sm text-gray-300 block mb-1">{label}</span>
      {children}
    </label>
  );
}
