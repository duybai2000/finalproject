# Ride & Rent

Do an tot nghiep — nen tang dat tai xe theo ngay va thue xe tu lai. Xay dung
bang Next.js 16 (App Router), Prisma 7 + SQLite, NextAuth (Credentials),
Tailwind CSS 4.

## Tinh nang chinh

- 4 vai tro: **USER** (khach thue), **OWNER** (chu xe cho thue), **DRIVER**
  (tai xe nhan chuyen), **ADMIN** (quan tri he thong). Khi dang nhap se duoc
  dieu huong tu dong toi trang phu hop voi vai tro.
- Dang ky / dang nhap (NextAuth, mat khau hash bcrypt)
- Dat tai xe theo ngay: lay GPS, uoc tinh gia (co phu thu cuoi tuan / ngay le),
  xac nhan don
- Thue xe tu lai: chon xe trong danh sach, chon ngay nhan / tra, dat don
- Trang xac nhan don sau khi dat
- Mo phong cong thanh toan (form the gia, khong nhan the that)
- Lich su don cua nguoi dung tai `/profile`, ho tro huy don PENDING
- Trang chu xe tai `/owner`: dashboard rieng, them/sua/xoa xe cua minh
  (kem mo ta), xem don thue tren xe cua minh, doi trang thai don, xem
  doanh thu thuc nhan sau hoa hong
- Trang tai xe tai `/driver`: xem chuyen dang cho, nhan chuyen, xem
  thu nhap thuc nhan sau hoa hong
- Trang gioi thieu `/about` va lien he `/contact` (form mock)
- Trang Admin tai `/admin` voi 3 phan:
  - **Tong quan**: thong ke khach hang/cuoc xe/don thue, doanh thu tuan & tong,
    bieu do doanh thu 7 ngay gan day, bang booking voi doi trang thai inline
  - **Quan ly xe**: them / sua / xoa / bat-tat xe (CRUD voi `Car` model)
  - **Nguoi dung**: doi vai tro, xoa nguoi dung (chan xoa neu con don)

## Yeu cau

- Node.js >= 22.14
- npm

## Cai dat

```bash
npm install
cp .env.example .env
# Sua NEXTAUTH_SECRET trong file .env thanh chuoi ngau nhien dai
npx prisma db push
npm run seed   # tao tai khoan demo (xem ben duoi)
npm run dev
```

Mo http://localhost:3000

## Tai khoan demo

| Email              | Mat khau | Vai tro |
| ------------------ | -------- | ------- |
| admin@gmail.com    | 123456   | ADMIN   |
| owner@gmail.com    | 123456   | OWNER   |
| user@gmail.com     | 123456   | USER    |

(Tai khoan DRIVER tu dang ky tren trang `/register`.)

## Cau truc thu muc chinh

```
src/
  app/
    api/
      auth/[...nextauth]/   # NextAuth handler
      register/             # POST /api/register
      ride/                 # POST /api/ride (xac nhan don, can dang nhap)
      ride/estimate/        # POST /api/ride/estimate (tinh gia, khong dang nhap)
      rental/               # POST /api/rental
      cars/                 # GET danh sach xe + bang gia (tu Car model)
      payment/[type]/[id]/  # POST mo phong thanh toan
      booking/[type]/[id]/cancel/  # POST nguoi dung huy don PENDING cua minh
      admin/booking/[type]/[id]/   # PATCH doi trang thai (admin)
      admin/cars/                  # POST tao xe
      admin/cars/[id]/             # PATCH/DELETE xe (admin)
      admin/users/[id]/            # PATCH role / DELETE user (admin)
    booking/[type]/[id]/    # Trang xac nhan don
    booking/[type]/[id]/payment/  # Trang thanh toan mo phong
    admin/                  # Layout admin chung + sub-nav
    admin/page.tsx          # Tong quan + doanh thu + booking tables
    admin/cars/             # CRUD xe (list, new, [id]/edit)
    admin/users/            # Quan ly nguoi dung
    profile/                # Lich su don cua nguoi dung
    login/  register/       # Auth UI
    error.tsx not-found.tsx # Trang loi & 404
  components/               # RideForm, RentalForm, PaymentForm, AdminStatusSelect, ...
  lib/
    prisma.ts               # Prisma Client singleton (dung adapter better-sqlite3)
    auth.ts                 # Cau hinh NextAuth
    pricing.ts              # Tinh gia (co logic phu thu cuoi tuan/ngay le)
    bookingStatus.ts        # Hang so trang thai don
prisma/
  schema.prisma             # User, RideBooking, RentalBooking
  seed.js                   # Seed tai khoan demo
```

## Mo hinh du lieu (don gian)

- `User` (id, email, password, name, role: USER|ADMIN)
- `RideBooking` (pickup, dropoff, GPS, ngay bat dau / ket thuc, gia, status,
  paidAt, userId)
- `RentalBooking` (carId, carName, dateRange, totalPrice, status, paidAt,
  userId) — `carName` la snapshot, khong rang buoc khoa ngoai voi `Car`
- `Car` (id, name, type, seats, auto, dailyRate, img, active) — admin CRUD

## Mo hinh doanh thu

- **Cuoc xe co tai xe**: tai xe nhan **90%**, nen tang giu **10%**.
- **Cuoc xe khong co tai xe** (chua duoc nhan): nen tang giu 100%.
- **Thue xe cua chu xe**: chu xe nhan **85%**, nen tang giu **15%**.
- **Thue xe cua nen tang**: nen tang giu 100%.

Owner / driver dashboard hien thi tong / phi / thuc nhan; admin dashboard
hien thi co cau doanh thu (truc tiep + hoa hong + chi tra cho chu xe + chi
tra cho tai xe).

## Quy uoc gia

- **Thue tai xe theo ngay**: `don gia ngay × so ngay × phu thu cuoi tuan/ngay le`
  - Don gia co ban: **1.000.000 d/ngay**
  - Phu thu Thu 7 / Chu nhat / ngay le (01-01, 30-04, 01-05, 02-09): **+20%**
  - Diem don (GPS) va diem den (danh sach destinations) duoc luu cho dieu
    phoi nhung **khong** anh huong gia
- **Thue xe tu lai**: `don gia xe × so ngay × phu thu cuoi tuan/ngay le`

## Pham vi do an

Day la do an tot nghiep, **khong phai san pham thuong mai**. Mot so tinh nang
duoc mo phong de tap trung vao luong nghiep vu chinh:

- Cong thanh toan: form mo phong, khong giao tiep voi cong thanh toan that
- Tai xe / dieu phoi: khong co ung dung tai xe rieng. Vai tro tai xe duoc mo
  phong qua admin (admin doi trang thai don tu PENDING -> ACCEPTED -> COMPLETED)
- Ban do: chi hien thi vi tri don tren OpenStreetMap, khong co dinh tuyen /
  ETA / theo doi thoi gian thuc
- Email / SMS thong bao: khong tich hop
- Co so du lieu: SQLite cho de chay local; cho production can chuyen sang
  PostgreSQL hoac MySQL

## Scripts

- `npm run dev` — chay dev server
- `npm run build` — build production
- `npm run start` — chay production build
- `npm run lint` — kiem tra ESLint
- `npm run seed` — seed tai khoan demo
