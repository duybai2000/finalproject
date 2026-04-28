import Link from "next/link";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-white/10 bg-slate-900/80 backdrop-blur-sm mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-8 grid gap-6 md:grid-cols-3 text-sm">
        <div>
          <p className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
            Ride &amp; Rent
          </p>
          <p className="text-gray-400 mt-2 max-w-xs">
            Nền tảng đặt tài xế và thuê xe tự lái cho người Việt.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Link href="/about" className="text-gray-400 hover:text-white">
            Về chúng tôi
          </Link>
          <Link href="/contact" className="text-gray-400 hover:text-white">
            Liên hệ
          </Link>
          <Link href="/login" className="text-gray-400 hover:text-white">
            Đăng nhập
          </Link>
          <Link href="/register" className="text-gray-400 hover:text-white">
            Đăng ký
          </Link>
        </div>
        <div className="text-gray-500 md:text-right">
          <p>&copy; {year} Ride &amp; Rent</p>
          <p className="text-xs mt-1">Đồ án tốt nghiệp</p>
        </div>
      </div>
    </footer>
  );
}
