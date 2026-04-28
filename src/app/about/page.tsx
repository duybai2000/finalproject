import Link from "next/link";
import { Car, Navigation, Users, ShieldCheck } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen pt-24 px-6 md:px-12 text-white">
      <div className="max-w-4xl mx-auto space-y-12">
        <header className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
            About Ride &amp; Rent
          </h1>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            A smart mobility platform — hire a driver by the day or rent a self-drive
            car, all on one marketplace that connects renters, owners, and drivers.
          </p>
        </header>

        <section className="grid md:grid-cols-2 gap-6">
          <Feature
            icon={<Navigation className="w-6 h-6 text-blue-400" />}
            title="Hire a driver by the day"
            body="Pick up via GPS, see the price up-front (transparent formula: daily rate, with a small weekend / holiday surcharge), and confirm in two clicks."
          />
          <Feature
            icon={<Car className="w-6 h-6 text-emerald-400" />}
            title="Rent a self-drive car"
            body="Browse cars from our platform fleet and from individual owners. Book online by the day and pay in just a few steps."
          />
          <Feature
            icon={<Users className="w-6 h-6 text-amber-400" />}
            title="List your car"
            body="Sign up as a car owner, list your vehicle in minutes, and start receiving bookings. Manage every booking and your earnings from a dedicated dashboard."
          />
          <Feature
            icon={<ShieldCheck className="w-6 h-6 text-purple-400" />}
            title="Simple &amp; transparent"
            body="Every booking has a clear status — pending, accepted, completed. Customers can cancel pending bookings; drivers and owners get paid the moment a trip wraps up."
          />
        </section>

        <section className="bg-white/5 border border-white/10 rounded-2xl p-8 space-y-3">
          <h2 className="text-2xl font-bold">Our commitments</h2>
          <p className="text-gray-300">
            Ride &amp; Rent is built on three principles:
          </p>
          <ul className="list-disc list-inside text-gray-400 space-y-1 pl-2">
            <li>Transparent pricing — no hidden fees, every cost shown before booking</li>
            <li>Protection for both sides — two-step confirmation on every order</li>
            <li>Fast support — our team responds within 24 hours</li>
            <li>Fair commission — owners keep 85% of every booking</li>
          </ul>
        </section>

        <section className="text-center space-y-4 pt-4">
          <h2 className="text-2xl font-bold">Get started today</h2>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/register"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl"
            >
              Create an account
            </Link>
            <Link
              href="/contact"
              className="bg-white/10 hover:bg-white/20 text-white font-semibold px-6 py-3 rounded-xl border border-white/10"
            >
              Contact us
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
