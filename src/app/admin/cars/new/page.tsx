import CarForm from "@/components/CarForm";

export default function NewCarPage() {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-emerald-400">Them xe moi</h2>
      <CarForm mode="create" />
    </div>
  );
}
