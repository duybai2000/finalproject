import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import DriverNav from "@/components/DriverNav";

export default async function DriverLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "DRIVER") {
    redirect("/");
  }

  return (
    <div className="min-h-screen pt-24 px-6 md:px-12 text-white">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Driver Dashboard</h1>
        <DriverNav />
        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
}
