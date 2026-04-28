import { getServerSession } from "next-auth/next";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import AdminUserActions from "@/components/AdminUserActions";

export default async function AdminUsersPage() {
  const session = await getServerSession(authOptions);
  const me = session!.user.id;

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      _count: { select: { rides: true, rentals: true } },
    },
  });

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-blue-400">Users</h2>

      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-gray-400 border-b border-white/10">
            <tr>
              <th className="text-left p-4">Name</th>
              <th className="text-left p-4">Email</th>
              <th className="text-center p-4">Joined</th>
              <th className="text-center p-4">Bookings</th>
              <th className="text-right p-4">Role / Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => {
              const isSelf = u.id === me;
              return (
                <tr key={u.id} className="border-b border-white/5 last:border-b-0">
                  <td className="p-4">
                    <p className="font-medium">
                      {u.name || "No name"}
                      {isSelf && (
                        <span className="ml-2 text-xs text-emerald-400">(you)</span>
                      )}
                    </p>
                  </td>
                  <td className="p-4 text-gray-300">{u.email || "-"}</td>
                  <td className="p-4 text-center text-xs text-gray-400">
                    {u.createdAt.toISOString().slice(0, 10)}
                  </td>
                  <td className="p-4 text-center">
                    {u._count.rides + u._count.rentals}
                  </td>
                  <td className="p-4">
                    <AdminUserActions
                      id={u.id}
                      currentRole={u.role}
                      isSelf={isSelf}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
