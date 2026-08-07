# AI Product Image Generator

สร้างภาพสินค้า ฉาก และโฆษณาด้วย AI — ฟรี, มีระบบ login

**Stack**: Next.js (frontend) · FastAPI (backend) · PostgreSQL · Gemini (Nano Banana) image API พร้อม fallback ฟรี 100%

## โครงสร้างโปรเจกต์

```
AI-Product-Image-generator/
├── frontend/          Next.js app (App Router, TypeScript, Tailwind)
├── backend/           FastAPI app (SQLAlchemy, Alembic, JWT auth)
├── docker-compose.yml Postgres + backend สำหรับ dev บนเครื่อง
└── .github/workflows/ CI: lint + typecheck ทุกครั้งที่ push
```

## รันบนเครื่องตัวเอง (local dev)

### 1. Backend

```bash
cd backend
cp .env.example .env          # แล้วกรอกค่าตามด้านล่าง
python3 -m venv venv
source venv/bin/activate       # Windows: venv\Scripts\activate
pip install -r requirements.txt

# รัน Postgres ด้วย docker (จากโฟลเดอร์ root ของโปรเจกต์)
cd .. && docker compose up -d db

cd backend
alembic upgrade head            # สร้างตารางในฐานข้อมูล
uvicorn app.main:app --reload   # รันที่ http://localhost:8000
```

### 2. Frontend

```bash
cd frontend
cp .env.local.example .env.local
npm install
npm run dev                     # รันที่ http://localhost:3000
```

## ตัวแปรที่ต้องตั้งค่า (.env ของ backend)

| ตัวแปร | จำเป็นไหม | หาได้จากไหน |
|---|---|---|
| `DATABASE_URL` | จำเป็น | connection string ของ Postgres |
| `JWT_SECRET` | จำเป็น | สุ่ม string ยาวๆ เช่น `openssl rand -hex 32` |
| `GEMINI_API_KEY` | แนะนำ (ไม่ใส่ก็ใช้ fallback ฟรีได้) | https://aistudio.google.com/apikey (ฟรี ไม่ต้องผูกบัตร) |
| `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | จำเป็น | https://cloudinary.com/console (ฟรี 25GB) |
| `FRONTEND_ORIGIN` | จำเป็น | URL ของ frontend เช่น `https://your-app.vercel.app` |

**หมายเหตุเรื่อง AI**: ระบบเรียก Gemini 2.5 Flash Image (Nano Banana) เป็นหลัก ถ้าไม่ได้ตั้งค่า `GEMINI_API_KEY` หรือโควตาฟรีของ Gemini หมดในวันนั้น ระบบจะ fallback ไปใช้ Pollinations.ai ซึ่งฟรีไม่จำกัดและไม่ต้องมี API key โดยอัตโนมัติ

## Deploy ขึ้นจริง (ฟรีทั้งหมด)

### ขั้นตอนที่ 1 — Push ขึ้น GitHub

```bash
git init
git add .
git commit -m "Initial commit: AI product image generator MVP"
git branch -M main
git remote add origin https://github.com/<your-username>/<repo-name>.git
git push -u origin main
```

### ขั้นตอนที่ 2 — Database: Neon (PostgreSQL ฟรี)

1. สมัครที่ https://neon.tech (ฟรี ไม่ต้องผูกบัตร)
2. สร้าง project ใหม่ → copy connection string
3. แก้ให้ใช้ driver `psycopg`: `postgresql+psycopg://...` (Neon จะให้มาเป็น `postgresql://` — เติม `+psycopg` เข้าไปหลัง `postgresql`)

### ขั้นตอนที่ 3 — Image storage: Cloudinary (ฟรี)

1. สมัครที่ https://cloudinary.com (ฟรี 25GB)
2. หน้า Dashboard จะมี Cloud name, API Key, API Secret ให้ copy ไปใส่ env

### ขั้นตอนที่ 4 — AI: Google AI Studio (ฟรี)

1. ไปที่ https://aistudio.google.com/apikey
2. สร้าง API key (ไม่ต้องผูกบัตรเครดิต)

### ขั้นตอนที่ 5 — Backend: Render.com (ฟรี)

1. สมัครที่ https://render.com → เชื่อมกับ GitHub repo
2. New → Web Service → เลือก repo นี้ → **Root Directory: `backend`**
3. Environment: **Docker** (จะใช้ `backend/Dockerfile` อัตโนมัติ)
4. ใส่ Environment Variables ทั้งหมดตามตารางด้านบน (ใช้ connection string จาก Neon, key จาก Cloudinary และ Gemini)
5. Deploy — จะได้ URL เช่น `https://your-app.onrender.com`

> หมายเหตุ: free tier ของ Render จะ sleep หลังไม่มีการใช้งาน 15 นาที คำขอแรกหลัง sleep จะช้าประมาณ 30-50 วินาที ถือเป็นข้อจำกัดปกติของแผนฟรี

### ขั้นตอนที่ 6 — Frontend: Vercel (ฟรี)

1. สมัครที่ https://vercel.com → เชื่อมกับ GitHub repo
2. Import repo นี้ → **Root Directory: `frontend`**
3. Environment Variables: `NEXT_PUBLIC_API_URL` = URL ของ backend จาก Render (ขั้นตอนที่ 5)
4. Deploy — จะได้ URL เช่น `https://your-app.vercel.app`

### ขั้นตอนที่ 7 — เชื่อมกลับ

กลับไปที่ Render → แก้ env `FRONTEND_ORIGIN` เป็น URL ของ Vercel ที่ได้ (เพื่อให้ CORS อนุญาต) → redeploy backend

**เสร็จแล้ว** — เปิด URL ของ Vercel เพื่อทดสอบระบบทั้งหมด: สมัครสมาชิก → login → อัปโหลดรูปสินค้า → สร้างภาพ

## Roadmap ต่อยอด (ไม่บังคับ)

- เพิ่ม rate limiting ต่อ user (กันโควตา AI หมดเร็วเกินไป)
- เพิ่มปุ่มดาวน์โหลดภาพและลบภาพจาก gallery
- เพิ่ม preset ฉาก/สไตล์สำเร็จรูปให้เลือกแทนการพิมพ์ prompt เอง
- เพิ่ม background job queue (เช่น Celery) ถ้าอยากให้ generate แบบ async ไม่ block request
