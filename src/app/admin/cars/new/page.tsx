import BackLink from "@/components/BackLink";
import CarForm from "@/components/CarForm";

export default function NewCarPage() {
  return (
    <div className="space-y-4">
      <BackLink href="/admin/cars" label="Back to cars" />
      <h2 className="text-2xl font-bold text-emerald-400">Add a new car</h2>
      <CarForm mode="create" />
    </div>
  );
}
