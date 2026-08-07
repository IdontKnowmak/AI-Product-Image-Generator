import Link from "next/link";

export default function Home() {
  return (
    <main className="relative flex flex-1 flex-col items-center justify-center overflow-hidden px-6 py-24 text-center">
      {/* signature: softbox glow, evoking a studio light behind the product */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[560px] w-[560px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-70 blur-[90px]"
        style={{
          background:
            "radial-gradient(circle, var(--accent-dim) 0%, transparent 70%)",
        }}
      />

      <p className="relative z-10 text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
        สตูดิโอถ่ายภาพสินค้า ขับเคลื่อนด้วย AI
      </p>

      <h1
        className="relative z-10 mt-6 max-w-3xl text-5xl leading-tight sm:text-6xl"
        style={{ fontFamily: "var(--font-display)", fontWeight: 500 }}
      >
        เปลี่ยนรูปสินค้าธรรมดา
        <br />
        ให้เป็นภาพโฆษณาระดับสตูดิโอ
      </h1>

      <p className="relative z-10 mt-6 max-w-xl text-base text-[var(--muted)]">
        อัปโหลดรูปสินค้า เลือกฉากหรือสไตล์โฆษณาที่ต้องการ แล้วให้ AI
        สร้างภาพใหม่ให้ในไม่กี่วินาที — ฟรี ไม่มีค่าใช้จ่าย
      </p>

      <div className="relative z-10 mt-10 flex gap-4">
        <Link
          href="/register"
          className="rounded-full px-7 py-3 text-sm font-medium text-[#14130f] transition-transform hover:scale-105"
          style={{ background: "var(--accent)" }}
        >
          เริ่มใช้งานฟรี
        </Link>
        <Link
          href="/login"
          className="rounded-full border px-7 py-3 text-sm font-medium text-[var(--foreground)] transition-colors hover:border-[var(--accent)]"
          style={{ borderColor: "var(--border)" }}
        >
          เข้าสู่ระบบ
        </Link>
      </div>
    </main>
  );
}
