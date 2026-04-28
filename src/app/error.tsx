"use client";

import Link from "next/link";

export default function Error({ reset }: { reset: () => void }) {
  return (
    <div className="min-h-screen pt-24 px-6 md:px-12 text-white grid place-items-center">
      <div className="max-w-md text-center space-y-4">
        <h1 className="text-3xl font-bold">Something went wrong</h1>
        <p className="text-gray-400">
          The system ran into an error. Please try again or go back to the home page.
        </p>
        <div className="flex justify-center gap-3 pt-2">
          <button
            onClick={() => reset()}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
          >
            Try again
          </button>
          <Link
            href="/"
            className="bg-white/10 hover:bg-white/20 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
          >
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}
