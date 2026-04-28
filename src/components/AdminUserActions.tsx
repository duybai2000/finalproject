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
        setError(data.error || "Could not update.");
        setRole(previous);
      } else {
        router.refresh();
      }
    } catch {
      setError("Connection error.");
      setRole(previous);
    } finally {
      setBusy(false);
    }
  };

  const deleteUser = async () => {
    if (!window.confirm("Delete this user?")) return;
    setBusy(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Could not delete.");
        return;
      }
      router.refresh();
    } catch {
      setError("Connection error.");
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
          title={isSelf ? "Cannot change your own role" : ""}
        >
          <option value="USER">USER</option>
          <option value="ADMIN">ADMIN</option>
        </select>
        <button
          type="button"
          onClick={deleteUser}
          disabled={busy || isSelf}
          className="text-xs text-red-300 hover:text-red-200 disabled:opacity-50"
          title={isSelf ? "Cannot delete your own account" : ""}
        >
          Delete
        </button>
      </div>
      {error && <span className="text-xs text-red-300">{error}</span>}
    </div>
  );
}
