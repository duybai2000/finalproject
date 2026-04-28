"use client";

import Link from "next/link";

export default function Error({ reset }: { reset: () => void }) {
  return (
    <div className="min-h-screen pt-24 px-6 md:px-12 text-white grid place-items-center">
      <div className="max-w-md text-center space-y-4">
        <h1 className="text-3xl font-bold">Da xay ra loi</h1>
        <p className="text-gray-400">
          He thong gap su co. Vui long thu lai sau hoac quay ve trang chu.
        </p>
        <div className="flex justify-center gap-3 pt-2">
          <button
            onClick={() => reset()}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
          >
            Thu lai
          </button>
          <Link
            href="/"
            className="bg-white/10 hover:bg-white/20 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
          >
            Trang chu
          </Link>
        </div>
      </div>
    </div>
  );
}
