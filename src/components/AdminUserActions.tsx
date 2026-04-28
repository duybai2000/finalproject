"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  id: string;
  currentRole: "USER" | "ADMIN" | string;
  isSelf: boolean;
};

export default function AdminUserActions({ id, currentRole, isSelf }: Props) {
  const [role, setRole] = useState(currentRole);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const changeRole = async (next: string) => {
    const previous = role;
    setRole(next);
    setBusy(true);
    setError("");

    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: next }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Khong cap nhat duoc.");
        setRole(previous);
      } else {
        router.refresh();
      }
    } catch {
      setError("Loi ket noi.");
      setRole(previous);
    } finally {
      setBusy(false);
    }
  };

  const deleteUser = async () => {
    if (!window.confirm("Xoa nguoi dung nay?")) return;
    setBusy(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Khong xoa duoc.");
        return;
      }
      router.refresh();
    } catch {
      setError("Loi ket noi.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex items-center gap-3">
        <select
          value={role}
          disabled={busy || isSelf}
          onChange={(e) => changeRole(e.target.value)}
          className="bg-slate-800 border border-white/20 text-white text-xs px-2 py-1 rounded disabled:opacity-50"
          title={isSelf ? "Khong the doi quyen cua chinh minh" : ""}
        >
          <option value="USER">USER</option>
          <option value="ADMIN">ADMIN</option>
        </select>
        <button
          type="button"
          onClick={deleteUser}
          disabled={busy || isSelf}
          className="text-xs text-red-300 hover:text-red-200 disabled:opacity-50"
          title={isSelf ? "Khong the xoa chinh minh" : ""}
        >
          Xoa
        </button>
      </div>
      {error && <span className="text-xs text-red-300">{error}</span>}
    </div>
  );
}
