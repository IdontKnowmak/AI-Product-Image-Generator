"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { RequireAuth } from "../components/RequireAuth";
import { useAuth } from "../context/AuthContext";
import { api, type AdminDashboard, type AdminGeneration, type AdminUser } from "../lib/api";

function AdminContent() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<AdminDashboard | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [generations, setGenerations] = useState<AdminGeneration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [dashboard, userList, generationList] = await Promise.all([
        api.adminDashboard(),
        api.adminUsers(),
        api.adminGenerations(),
      ]);
      setStats(dashboard);
      setUsers(userList);
      setGenerations(generationList);
    } catch (err) {
      const message = err instanceof Error ? err.message : "ไม่สามารถโหลดข้อมูลหลังบ้านได้";
      setError(message);
      if (message === "Admin access required") router.replace("/dashboard");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (user && user.role === "admin") {
      // eslint-disable-next-line react-hooks/set-state-in-effect, react-hooks/exhaustive-deps -- load synchronizes the admin dashboard with the API after auth is ready
      load();
    }
  }, [user]);

  async function toggleUser(userItem: AdminUser) {
    try {
      await api.adminSetUserStatus(userItem.id, !userItem.is_active);
      setUsers((prev) => prev.map((item) => item.id === userItem.id ? { ...item, is_active: !item.is_active } : item));
    } catch (err) {
      setError(err instanceof Error ? err.message : "เปลี่ยนสถานะผู้ใช้ไม่สำเร็จ");
    }
  }

  async function removeGeneration(id: string) {
    if (!confirm("ต้องการลบภาพนี้ออกจากระบบใช่หรือไม่?")) return;
    try {
      await api.adminDeleteGeneration(id);
      setGenerations((prev) => prev.filter((item) => item.id !== id));
      setStats((prev) => prev ? { ...prev, generations: Math.max(0, prev.generations - 1) } : prev);
    } catch (err) {
      setError(err instanceof Error ? err.message : "ลบรายการไม่สำเร็จ");
    }
  }

  if (user && user.role !== "admin") {
    return <main className="flex flex-1 items-center justify-center"><p className="text-sm text-[var(--muted)]">หน้านี้สำหรับผู้ดูแลระบบเท่านั้น</p></main>;
  }

  const cards = stats ? [
    ["ผู้ใช้ทั้งหมด", stats.users],
    ["ผู้ใช้ที่ใช้งาน", stats.active_users],
    ["สร้างภาพทั้งหมด", stats.generations],
    ["สร้างวันนี้", stats.today_generations],
    ["สำเร็จ", stats.completed],
    ["ล้มเหลว", stats.failed],
  ] : [];

  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-6 py-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div><p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">Admin</p><h1 className="mt-1 text-3xl" style={{ fontFamily: "var(--font-display)" }}>ระบบหลังบ้าน</h1></div>
        <div className="flex gap-2"><button onClick={() => router.push("/dashboard")} className="rounded-lg border px-4 py-2 text-sm">ไป Studio</button><button onClick={logout} className="rounded-lg border px-4 py-2 text-sm">ออกจากระบบ</button></div>
      </header>

      {error && <p className="mt-5 rounded-lg border p-3 text-sm" style={{ borderColor: "var(--danger)", color: "var(--danger)" }}>{error}</p>}
      {loading ? <p className="mt-8 text-sm text-[var(--muted)]">กำลังโหลดข้อมูล...</p> : <>
        <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map(([label, value]) => <div key={label} className="rounded-2xl border p-5" style={{ borderColor: "var(--border)", background: "var(--surface)" }}><p className="text-sm text-[var(--muted)]">{label}</p><p className="mt-2 text-3xl">{value}</p></div>)}
        </section>

        <section className="mt-10"><h2 className="text-xl">ผู้ใช้งาน</h2><div className="mt-3 overflow-x-auto rounded-2xl border" style={{ borderColor: "var(--border)" }}><table className="w-full min-w-[760px] text-left text-sm"><thead><tr className="border-b" style={{ borderColor: "var(--border)" }}><th className="p-4">ผู้ใช้</th><th className="p-4">Role</th><th className="p-4">สถานะ</th><th className="p-4">สร้างภาพ</th><th className="p-4">จัดการ</th></tr></thead><tbody>{users.map((item) => <tr key={item.id} className="border-b last:border-0" style={{ borderColor: "var(--border)" }}><td className="p-4"><div>{item.full_name || "-"}</div><div className="text-xs text-[var(--muted)]">{item.email}</div></td><td className="p-4">{item.role}</td><td className="p-4">{item.is_active ? "ใช้งาน" : "ปิดใช้งาน"}</td><td className="p-4">{item.generation_count}</td><td className="p-4"><button disabled={item.id === user?.id} onClick={() => toggleUser(item)} className="rounded-md border px-3 py-1.5 text-xs disabled:opacity-40">{item.is_active ? "ปิดบัญชี" : "เปิดบัญชี"}</button></td></tr>)}</tbody></table></div></section>

        <section className="mt-10"><h2 className="text-xl">ภาพที่สร้างล่าสุด</h2><div className="mt-3 space-y-3">{generations.length === 0 ? <p className="text-sm text-[var(--muted)]">ยังไม่มีข้อมูล</p> : generations.slice(0, 30).map((item) => <div key={item.id} className="flex gap-4 rounded-xl border p-3" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>{item.result_image_url ? <Image src={item.result_image_url} alt={item.prompt} width={80} height={80} className="h-20 w-20 rounded-lg object-cover" unoptimized /> : <div className="h-20 w-20 rounded-lg" style={{ background: "var(--surface-2)" }} /> }<div className="min-w-0 flex-1"><p className="text-xs text-[var(--muted)]">{item.user_email} · {item.status}</p><p className="mt-1 truncate text-sm">{item.prompt}</p><p className="mt-1 text-xs text-[var(--muted)]">{new Date(item.created_at).toLocaleString("th-TH")}</p></div><button onClick={() => removeGeneration(item.id)} className="self-center rounded-md border px-3 py-1.5 text-xs">ลบ</button></div>)}</div></section>
      </>}
    </main>
  );
}

export default function AdminPage() { return <RequireAuth><AdminContent /></RequireAuth>; }
