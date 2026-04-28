import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import AdminNav from "@/components/AdminNav";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (session?.user?.role !== "ADMIN") {
    redirect("/");
  }

  return (
    <div className="min-h-screen pt-24 px-6 md:px-12 text-white">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Admin</h1>
        <AdminNav />
        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
}
