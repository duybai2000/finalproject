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

  await prisma.user.upsert({
    where: { email: "admin@gmail.com" },
    update: {},
    create: {
      email: "admin@gmail.com",
      name: "Admin",
      password,
      role: "ADMIN",
    },
  });

  await prisma.user.upsert({
    where: { email: "user@gmail.com" },
    update: {},
    create: {
      email: "user@gmail.com",
      name: "Student",
      password,
      role: "USER",
    },
  });

  const owner = await prisma.user.upsert({
    where: { email: "owner@gmail.com" },
    update: {},
    create: {
      email: "owner@gmail.com",
      name: "Anh Tuan",
      password,
      role: "OWNER",
    },
  });

  // Platform cars (ownerId = null) — admin-managed fleet
  const platformCars = [
    {
      id: 1,
      name: "Toyota Vios 2023",
      type: "Thuong",
      seats: 4,
      auto: true,
      dailyRate: 700_000,
      img: "https://images.unsplash.com/photo-1590362891991-f776e747a588?auto=format&fit=crop&q=80&w=400&h=250",
    },
    {
      id: 2,
      name: "Mazda 3 2024",
      type: "Cao cap",
      seats: 4,
      auto: true,
      dailyRate: 900_000,
      img: "https://images.unsplash.com/photo-1609521263047-f8f205293f24?auto=format&fit=crop&q=80&w=400&h=250",
    },
    {
      id: 3,
      name: "Mitsubishi Xpander",
      type: "Gia dinh",
      seats: 7,
      auto: true,
      dailyRate: 1_000_000,
      img: "https://images.unsplash.com/photo-1629897048514-3dd7414cdfce?auto=format&fit=crop&q=80&w=400&h=250",
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
      type: "Cao cap",
      seats: 4,
      auto: true,
      dailyRate: 850_000,
      img: "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&q=80&w=400&h=250",
      ownerId: owner.id,
    },
    {
      name: "Kia Morning 2023",
      type: "Tiet kiem",
      seats: 4,
      auto: true,
      dailyRate: 500_000,
      img: "https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&q=80&w=400&h=250",
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
