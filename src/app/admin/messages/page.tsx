import prisma from "@/lib/prisma";

export default async function AdminMessagesPage() {
  const messages = await prisma.contactMessage.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-blue-400">Contact messages</h2>

      <div className="bg-white/5 border border-white/10 rounded-2xl">
        {messages.length === 0 ? (
          <p className="text-gray-400 p-6">No messages yet.</p>
        ) : (
          <ul className="divide-y divide-white/5">
            {messages.map((m) => (
              <li key={m.id} className="p-5">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <p className="font-semibold">{m.name}</p>
                    <p className="text-xs text-gray-400">{m.email}</p>
                  </div>
                  <p className="text-xs text-gray-500 whitespace-nowrap">
                    {m.createdAt.toLocaleString("en-US")}
                  </p>
                </div>
                <p className="text-gray-300 mt-3 whitespace-pre-wrap">
                  {m.message}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
