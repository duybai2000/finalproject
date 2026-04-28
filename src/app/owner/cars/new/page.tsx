import OwnerCarForm from "@/components/OwnerCarForm";

export default function NewOwnerCarPage() {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-emerald-400">Dang xe moi cho thue</h2>
      <p className="text-sm text-gray-400">
        Hay nhap thong tin chinh xac. Khach se thay xe cua ban tren danh sach
        cho thue cong khai.
      </p>
      <OwnerCarForm mode="create" />
    </div>
  );
}
