import Link from "next/link";

const features = [
  { icon: "✦", title: "สร้างภาพสินค้า", text: "เปลี่ยนภาพสินค้าธรรมดาให้กลายเป็นภาพพร้อมใช้งาน" },
  { icon: "◈", title: "สร้างฉาก & โฆษณา", text: "กำหนดสไตล์ ฉาก และบรรยากาศด้วย Prompt ของคุณ" },
  { icon: "♡", title: "Community", text: "แชร์ผลงาน กดไลค์ คอมเมนต์ และบันทึกภาพที่ชอบ" },
];

export default function Home() {
  return (
    <main className="relative min-h-full flex-1 overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute -right-32 -top-32 h-[520px] w-[520px] rounded-full opacity-60 blur-[100px]" style={{ background: "var(--accent-dim)" }} />
      <div aria-hidden className="pointer-events-none absolute -bottom-40 -left-32 h-[420px] w-[420px] rounded-full opacity-30 blur-[100px]" style={{ background: "var(--accent-dim)" }} />
      <nav className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl text-lg" style={{ background: "var(--accent)", color: "#14130f" }}>✦</span>
          <span className="text-lg font-medium tracking-tight" style={{ fontFamily: "var(--font-display)" }}>AI Product Studio</span>
        </Link>
        <div className="flex items-center gap-2">
          <Link href="/login" className="rounded-full px-4 py-2 text-sm text-[var(--muted)] transition-colors hover:text-[var(--foreground)]">เข้าสู่ระบบ</Link>
          <Link href="/register" className="rounded-full px-5 py-2.5 text-sm font-medium text-[#14130f] shadow-sm transition-transform hover:-translate-y-0.5" style={{ background: "var(--accent)" }}>เริ่มสร้างภาพ</Link>
        </div>
      </nav>
      <section className="relative z-10 mx-auto grid w-full max-w-6xl items-center gap-12 px-6 pb-16 pt-14 lg:grid-cols-[1.05fr_.95fr] lg:pb-24 lg:pt-20">
        <div>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs" style={{ borderColor: "var(--border)", background: "var(--surface)", color: "var(--muted)" }}>
            <span style={{ color: "var(--accent)" }}>●</span> AI Image Generator · Studio + Community
          </div>
          <h1 className="max-w-3xl text-5xl leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl" style={{ fontFamily: "var(--font-display)", fontWeight: 500 }}>
            สร้างภาพสินค้า
            <br />
            <span style={{ color: "var(--accent)" }}>ให้ดูโดดเด่นกว่าเดิม</span>
          </h1>
          <p className="mt-7 max-w-xl text-base leading-7 text-[var(--muted)] sm:text-lg">
            อัปโหลดรูปสินค้า เขียนสิ่งที่อยากได้ แล้วให้ AI ช่วยสร้างภาพฉากสินค้าและภาพโฆษณา พร้อมนำผลงานไปแชร์ใน Community ได้ทันที
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Link href="/register" className="rounded-full px-7 py-3.5 text-sm font-medium text-[#14130f] shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl" style={{ background: "var(--accent)" }}>✦ สร้างภาพแรกของฉัน</Link>
            <Link href="/login" className="rounded-full border px-6 py-3.5 text-sm font-medium transition-all hover:-translate-y-0.5 hover:border-[var(--accent)]" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>มีบัญชีแล้ว · เข้าสู่ระบบ</Link>
          </div>
          <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-xs text-[var(--muted)]">
            <span>✓ สร้างภาพด้วย AI</span><span>✓ เลือก Public / Private</span><span>✓ Like · Comment · Save</span>
          </div>
        </div>
        <div className="relative mx-auto w-full max-w-lg">
          <div className="absolute inset-8 rounded-[2rem] opacity-60 blur-2xl" style={{ background: "var(--accent-dim)" }} />
          <div className="relative overflow-hidden rounded-[2rem] border p-3 shadow-2xl" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
            <div className="relative aspect-[4/5] overflow-hidden rounded-[1.5rem]" style={{ background: "radial-gradient(circle at 30% 20%, var(--accent-dim), transparent 35%), linear-gradient(145deg, var(--surface-2), var(--surface))" }}>
              <div className="absolute left-5 top-5 rounded-full border px-3 py-1.5 text-xs backdrop-blur" style={{ borderColor: "var(--border)", background: "var(--surface)", color: "var(--muted)" }}>AI PRODUCT STUDIO</div>
              <div className="absolute inset-0 flex items-center justify-center p-10">
                <div className="w-full max-w-[270px]">
                  <div className="aspect-[4/5] rounded-[2rem] border p-5 shadow-xl" style={{ borderColor: "var(--border)", background: "rgba(255,255,255,0.06)" }}>
                    <div className="flex h-full flex-col justify-between rounded-[1.5rem] border p-5" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
                      <div className="flex justify-between text-xs text-[var(--muted)]"><span>NEW CREATION</span><span style={{ color: "var(--accent)" }}>✦ AI</span></div>
                      <div className="text-center">
                        <div className="mx-auto flex h-32 w-32 items-center justify-center rounded-full border text-6xl" style={{ borderColor: "var(--border)", background: "var(--surface-2)" }}>◇</div>
                        <p className="mt-5 text-lg font-medium">Your Product</p>
                        <p className="mt-1 text-xs text-[var(--muted)]">Studio-quality visual</p>
                      </div>
                      <div className="rounded-xl border px-3 py-2 text-xs" style={{ borderColor: "var(--border)", background: "var(--surface-2)" }}>
                        <span className="text-[var(--muted)]">Prompt</span><p className="mt-1 truncate">clean studio product photography</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute bottom-5 left-5 right-5 flex items-center justify-between rounded-xl border px-4 py-3 backdrop-blur" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
                <span className="text-xs text-[var(--muted)]">Ready to create</span><span className="text-sm font-medium" style={{ color: "var(--accent)" }}>Generate ✦</span>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="relative z-10 mx-auto w-full max-w-6xl px-6 pb-12">
        <div className="grid gap-3 md:grid-cols-3">
          {features.map((feature) => (
            <div key={feature.title} className="rounded-2xl border p-5 transition-transform hover:-translate-y-1" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
              <span className="flex h-10 w-10 items-center justify-center rounded-xl text-lg" style={{ background: "var(--accent-dim)", color: "var(--accent)" }}>{feature.icon}</span>
              <h2 className="mt-4 text-sm font-medium">{feature.title}</h2>
              <p className="mt-1.5 text-xs leading-5 text-[var(--muted)]">{feature.text}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
