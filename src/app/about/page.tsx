import Link from "next/link";
import { Car, Navigation, Users, ShieldCheck } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen pt-24 px-6 md:px-12 text-white">
      <div className="max-w-4xl mx-auto space-y-12">
        <header className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
            Về Ride &amp; Rent
          </h1>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Nền tảng di chuyển thông minh cho người Việt. Đặt tài xế theo ngày
            hoặc thuê xe tự lái — kết nối khách thuê và chủ xe trong một hệ thống.
          </p>
        </header>

        <section className="grid md:grid-cols-2 gap-6">
          <Feature
            icon={<Navigation className="w-6 h-6 text-blue-400" />}
            title="Đặt tài xế theo ngày"
            body="Chọn điểm đón qua GPS, chọn điểm đến trong danh sách. Giá tính theo công thức minh bạch: đơn giá ngày + chi phí quãng đường."
          />
          <Feature
            icon={<Car className="w-6 h-6 text-emerald-400" />}
            title="Thuê xe tự lái"
            body="Hệ thống cung cấp xe của nền tảng và xe của các chủ xe cá nhân. Đặt online theo ngày, thanh toán trong vài bước."
          />
          <Feature
            icon={<Users className="w-6 h-6 text-amber-400" />}
            title="Cho thuê chiếc xe của bạn"
            body="Đăng ký với vai trò chủ xe, đăng xe lên hệ thống và bắt đầu nhận đơn. Quản lý đơn thuê và doanh thu trong bảng điều khiển riêng."
          />
          <Feature
            icon={<ShieldCheck className="w-6 h-6 text-purple-400" />}
            title="Đơn giản & rõ ràng"
            body="Mọi đơn đều có thể theo dõi trạng thái: chờ xác nhận, đã chấp nhận, hoàn tất. Khách hàng có thể hủy đơn khi đang chờ."
          />
        </section>

        <section className="bg-white/5 border border-white/10 rounded-2xl p-8 space-y-3">
          <h2 className="text-2xl font-bold">Cam kết của chúng tôi</h2>
          <p className="text-gray-300">
            Ride &amp; Rent xây dựng dịch vụ trên ba trụ cột:
          </p>
          <ul className="list-disc list-inside text-gray-400 space-y-1 pl-2">
            <li>Giá minh bạch — không có phụ thu ẩn, mọi khoản đều hiển thị trước khi đặt</li>
            <li>Bảo vệ chủ xe và khách thuê — quy trình xác nhận hai bước cho mỗi đơn</li>
            <li>Hỗ trợ nhanh — đội chăm sóc khách hàng phản hồi trong 24 giờ</li>
            <li>Cơ chế hoa hồng công bằng — chủ xe nhận 85% giá trị mỗi đơn</li>
          </ul>
        </section>

        <section className="text-center space-y-4 pt-4">
          <h2 className="text-2xl font-bold">Bắt đầu ngay</h2>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/register"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl"
            >
              Đăng ký tài khoản
            </Link>
            <Link
              href="/contact"
              className="bg-white/10 hover:bg-white/20 text-white font-semibold px-6 py-3 rounded-xl border border-white/10"
            >
              Liên hệ với chúng tôi
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}

function Feature({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-2">
      <div className="flex items-center gap-3">
        {icon}
        <h3 className="font-bold text-lg">{title}</h3>
      </div>
      <p className="text-gray-400 text-sm leading-relaxed">{body}</p>
    </div>
  );
}
