import path from "node:path";
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import bcrypt from "bcrypt";

const adapter = new PrismaBetterSqlite3({
  url:
    process.env.DATABASE_URL ||
    `file:${path.join(process.cwd(), "dev.db")}`,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  const password = await bcrypt.hash("123456", 10);

  // Stable IDs for the seeded demo accounts so re-seeding the DB doesn't
  // invalidate JWTs in existing browser sessions.
  await prisma.user.upsert({
    where: { email: "admin@gmail.com" },
    update: {},
    create: {
      id: "seed-admin",
      email: "admin@gmail.com",
      name: "Admin",
      phone: "0900000001",
      password,
      role: "ADMIN",
    },
  });

  await prisma.user.upsert({
    where: { email: "user@gmail.com" },
    update: {},
    create: {
      id: "seed-user",
      email: "user@gmail.com",
      name: "Demo Customer",
      phone: "0901234567",
      password,
      role: "USER",
    },
  });

  const owner = await prisma.user.upsert({
    where: { email: "owner@gmail.com" },
    update: {},
    create: {
      id: "seed-owner",
      email: "owner@gmail.com",
      name: "John Owner",
      phone: "0908888888",
      password,
      role: "OWNER",
    },
  });

  // Platform cars (ownerId = null) — admin-managed fleet
  const platformCars = [
    {
      id: 1,
      name: "Toyota Vios 2023",
      type: "Standard",
      seats: 4,
      auto: true,
      dailyRate: 700_000,
      img: "https://images.unsplash.com/photo-1590362891991-f776e747a588?auto=format&fit=crop&q=80&w=400&h=250",
      description:
        "Fuel-efficient sedan with strong air-conditioning. Great for short city trips and weekend getaways.",
    },
    {
      id: 2,
      name: "Mazda 3 2024",
      type: "Premium",
      seats: 4,
      auto: true,
      dailyRate: 900_000,
      img: "https://images.unsplash.com/photo-1609521263047-f8f205293f24?auto=format&fit=crop&q=80&w=400&h=250",
      description:
        "Premium sedan with leather interior, reverse parking sensors, and an 8\" infotainment screen. Smooth ride for longer trips.",
    },
    {
      id: 3,
      name: "Mitsubishi Xpander",
      type: "Family",
      seats: 7,
      auto: true,
      dailyRate: 1_000_000,
      img: "https://images.unsplash.com/photo-1629897048514-3dd7414cdfce?auto=format&fit=crop&q=80&w=400&h=250",
      description:
        "Spacious 7-seat MPV with a large luggage compartment — ideal for families or groups of friends.",
    },
    {
      id: 4,
      name: "Hyundai Accent 2024",
      type: "Standard",
      seats: 4,
      auto: true,
      dailyRate: 750_000,
      img: "https://images.unsplash.com/photo-1542362567-b07e54358753?auto=format&fit=crop&q=80&w=400&h=250",
      description:
        "Compact sedan with great fuel economy and a recently serviced automatic transmission. Easy to drive in the city.",
    },
    {
      id: 5,
      name: "Ford Ranger 2023",
      type: "Pickup",
      seats: 5,
      auto: true,
      dailyRate: 1_400_000,
      img: "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&q=80&w=400&h=250",
      description:
        "High-clearance pickup with 4WD and a large bed. Strong choice for long road trips and rough terrain.",
    },
    {
      id: 6,
      name: "Toyota Innova Cross 2024",
      type: "Family",
      seats: 7,
      auto: true,
      dailyRate: 1_200_000,
      img: "https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&q=80&w=400&h=250",
      description:
        "Brand-new MPV with a hybrid powertrain. Roomy interior — perfect for groups of 6 to 7.",
    },
    {
      id: 7,
      name: "VinFast VF 5 2024",
      type: "Economy",
      seats: 5,
      auto: true,
      dailyRate: 600_000,
      img: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&q=80&w=400&h=250",
      description:
        "Compact electric crossover, 30-minute fast charge, 326 km range. Quiet and smooth around town.",
    },
    {
      id: 8,
      name: "Honda CR-V 2023",
      type: "SUV",
      seats: 5,
      auto: true,
      dailyRate: 1_300_000,
      img: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=400&h=250",
      description:
        "5-star ASEAN NCAP SUV with high ground clearance. Great for highway and mixed-terrain driving.",
    },
  ];

  for (const car of platformCars) {
    await prisma.car.upsert({
      where: { id: car.id },
      update: {},
      create: car,
    });
  }

  // Owner-listed demo cars
  const ownerCars = [
    {
      name: "Honda Civic 2022",
      type: "Premium",
      seats: 4,
      auto: true,
      dailyRate: 850_000,
      img: "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&q=80&w=400&h=250",
      description:
        "2022 Honda Civic with a sporty front. Fully maintained, fresh tires. Free in-city delivery.",
      ownerId: owner.id,
    },
    {
      name: "Kia Morning 2023",
      type: "Economy",
      seats: 4,
      auto: true,
      dailyRate: 500_000,
      img: "https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&q=80&w=400&h=250",
      description:
        "Compact car, easy to maneuver in the city, low fuel consumption (~5L/100km). Great for new drivers.",
      ownerId: owner.id,
    },
  ];

  for (const car of ownerCars) {
    const exists = await prisma.car.findFirst({
      where: { name: car.name, ownerId: owner.id },
    });
    if (!exists) {
      await prisma.car.create({ data: car });
    }
  }
}

main()
  .then(async () => {
    console.log("Seeded database");
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
