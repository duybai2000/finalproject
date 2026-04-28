import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen pt-24 px-6 md:px-12 text-white grid place-items-center">
      <div className="max-w-md text-center space-y-4">
        <h1 className="text-5xl font-bold text-blue-400">404</h1>
        <p className="text-gray-400">The page you&apos;re looking for could not be found.</p>
        <Link
          href="/"
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}
