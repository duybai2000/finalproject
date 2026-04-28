import BackLink from "@/components/BackLink";
import OwnerCarForm from "@/components/OwnerCarForm";

export default function NewOwnerCarPage() {
  return (
    <div className="space-y-4">
      <BackLink href="/owner/cars" label="Back to my cars" />
      <h2 className="text-2xl font-bold text-emerald-400">List a new car</h2>
      <p className="text-sm text-gray-400">
        Fill in the details accurately. Customers will see this listing in the
        public car catalog.
      </p>
      <OwnerCarForm mode="create" />
    </div>
  );
}
