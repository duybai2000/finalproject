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
      name: "Student",
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
      name: "Anh Tuan",
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
      type: "Thuong",
      seats: 4,
      auto: true,
      dailyRate: 700_000,
      img: "https://images.unsplash.com/photo-1590362891991-f776e747a588?auto=format&fit=crop&q=80&w=400&h=250",
      description:
        "Sedan tiet kiem nhien lieu, dieu hoa lanh sau, phu hop di noi thanh va tinh ngan ngay.",
    },
    {
      id: 2,
      name: "Mazda 3 2024",
      type: "Cao cap",
      seats: 4,
      auto: true,
      dailyRate: 900_000,
      img: "https://images.unsplash.com/photo-1609521263047-f8f205293f24?auto=format&fit=crop&q=80&w=400&h=250",
      description:
        "Sedan cao cap, noi that da, cam bien lui, man hinh giai tri 8\". Lai em va thoai mai cho cac chuyen di tinh.",
    },
    {
      id: 3,
      name: "Mitsubishi Xpander",
      type: "Gia dinh",
      seats: 7,
      auto: true,
      dailyRate: 1_000_000,
      img: "https://images.unsplash.com/photo-1629897048514-3dd7414cdfce?auto=format&fit=crop&q=80&w=400&h=250",
      description:
        "MPV 7 cho rong rai, khoang hanh ly lon, ly tuong cho gia dinh hoac nhom ban di du lich.",
    },
    {
      id: 4,
      name: "Hyundai Accent 2024",
      type: "Thuong",
      seats: 4,
      auto: true,
      dailyRate: 750_000,
      img: "https://images.unsplash.com/photo-1542362567-b07e54358753?auto=format&fit=crop&q=80&w=400&h=250",
      description:
        "Sedan be, tiet kiem xang, hop so tu dong moi. Phu hop nguoi moi lai va di lai trong pho.",
    },
    {
      id: 5,
      name: "Ford Ranger 2023",
      type: "Ban tai",
      seats: 5,
      auto: true,
      dailyRate: 1_400_000,
      img: "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&q=80&w=400&h=250",
      description:
        "Ban tai gam cao, hai cau, thung sau lon. Manh me cho cac chuyen di phuot xa va dia hinh kho.",
    },
    {
      id: 6,
      name: "Toyota Innova Cross 2024",
      type: "Gia dinh",
      seats: 7,
      auto: true,
      dailyRate: 1_200_000,
      img: "https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&q=80&w=400&h=250",
      description:
        "MPV moi, dong co Hybrid tiet kiem, noi that rong rai, ly tuong cho gia dinh 6-7 nguoi.",
    },
    {
      id: 7,
      name: "VinFast VF 5 2024",
      type: "Tiet kiem",
      seats: 5,
      auto: true,
      dailyRate: 600_000,
      img: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&q=80&w=400&h=250",
      description:
        "Crossover dien co nho, sac nhanh 30 phut, tam di chuyen 326 km. Khong tieng on, lai mu et.",
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
        "SUV gam cao, an toan 5 sao ASEAN NCAP. Phu hop di duong dai va dia hinh hon hop.",
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
      description:
        "Honda Civic doi 2022, dau xe sport, da bao duong day du, dem cao su moi. Nhan giao xe tan noi noi thanh.",
      ownerId: owner.id,
    },
    {
      name: "Kia Morning 2023",
      type: "Tiet kiem",
      seats: 4,
      auto: true,
      dailyRate: 500_000,
      img: "https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&q=80&w=400&h=250",
      description:
        "Xe nho gon, de lai trong pho, tieu thu xang thap (~5L/100km). Thich hop cho nguoi moi lai.",
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
