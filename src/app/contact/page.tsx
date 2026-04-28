import { Mail, Phone, MapPin } from "lucide-react";
import ContactForm from "@/components/ContactForm";

export default function ContactPage() {
  return (
    <div className="min-h-screen pt-24 px-6 md:px-12 text-white">
      <div className="max-w-5xl mx-auto space-y-8">
        <header className="text-center space-y-3">
          <h1 className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
            Liên hệ
          </h1>
          <p className="text-gray-300 max-w-xl mx-auto">
            Có câu hỏi về dịch vụ, muốn hợp tác, hoặc cần hỗ trợ về tài khoản?
            Hãy gửi tin nhắn cho chúng tôi.
          </p>
        </header>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <ContactInfo
              icon={<Mail className="w-5 h-5 text-blue-400" />}
              label="Email"
              value="hello@rideandrent.vn"
            />
            <ContactInfo
              icon={<Phone className="w-5 h-5 text-emerald-400" />}
              label="Hotline"
              value="1900 xxxx (8:00 - 22:00)"
            />
            <ContactInfo
              icon={<MapPin className="w-5 h-5 text-amber-400" />}
              label="Văn phòng"
              value="TP. Hồ Chí Minh, Việt Nam"
            />
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 text-sm text-gray-400 leading-relaxed">
              <p className="text-gray-300 font-semibold mb-2">Thông báo</p>
              <p>
                Đây là form mô phỏng của đồ án tốt nghiệp. Tin nhắn không được
                gửi tới email thật mà chỉ được lưu vào console của server.
              </p>
            </div>
          </div>

          <ContactForm />
        </div>
      </div>
    </div>
  );
}

function ContactInfo({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex items-center gap-4">
      <div className="bg-white/10 rounded-xl p-3">{icon}</div>
      <div>
        <p className="text-xs text-gray-400 uppercase tracking-wide">{label}</p>
        <p className="font-semibold mt-1">{value}</p>
      </div>
    </div>
  );
}
