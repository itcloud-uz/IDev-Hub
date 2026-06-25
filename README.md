# iDev-Hub — Dasturchilar uchun maxsus dasturlar sotuv platformasi

iDev-Hub — bu dasturchilar uchun mo'ljallangan marketplace platformasi. Unda server sozlash vositalari, AI botlar, web dasturlash shablonlari, DevOps va mobil rivojlantirish uchun kerakli dasturlar sotiladi.

Loyiha to'liq toza, modulli stackda qurilgan bo'lib, **SQLite** ma'lumotlar bazasida ishlaydi va o'rnatishga ortiqcha qiyinchilik tug'dirmaydi.

## Texnologik Stack
- **Frontend**: Next.js 16 (App Router, TypeScript) + Tailwind CSS v4
- **Backend**: Node.js + Express.js (TypeScript)
- **Ma'lumotlar bazasi**: SQLite (Prisma ORM orqali boshqariladi)
- **Autentifikatsiya**: JWT (access + refresh token), parollar bcrypt bilan hash qilingan

---

## Loyihani Ishga Tushirish

### 1. Ma'lumotlar bazasini sozlash va migratsiya
Loyiha SQLite ma'lumotlar bazasidan foydalanganligi sababli, hech qanday qo'shimcha o'rnatish shart emas.

Backend papkasida database schema push qiling va seed ma'lumotlarini yuklang:
```bash
cd backend
npx prisma db push
npm run seed
```

### 2. Backend serverni ishga tushirish
Backend porti `5000` da ishga tushadi:
```bash
cd backend
npm run dev
```

### 3. Frontend serverni ishga tushirish
Frontend Next.js porti `3000` da ishga tushadi:
```bash
cd frontend
npm run dev
```

Endi brauzeringizda `http://localhost:3000` havolasini ochishingiz mumkin.

---

## Default Admin Kirish Ma'lumotlari

Tizimga to'liq administratorlik huquqi bilan kirish uchun quyidagi default ma'lumotlardan foydalaning:
- **Email**: `admin@idev-hub.com`
- **Parol**: `Admin123!`

---

## Xavfsizlik va Muhim Xususiyatlar
1. **Role-based authorization**: Barcha admin endpointlar backend middleware orqali himoyalangan.
2. **Secure Downloads**: Mahsulot yuklab olish havolasi to'g'ridan-to'g'ri statik havola emas, u buyurtmaning tasdiqlangan holatini va foydalanuvchining shaxsini tekshirgandan keyingina yuklashga ruxsat beradi.
3. **Neo-Classic Dizayn**: Platforma dark-tech estetikasiga mos, sekin harakatlanuvchi MatrixRain va ParticleNetwork animatsion fonlar bilan premium dizaynda tayyorlangan.
