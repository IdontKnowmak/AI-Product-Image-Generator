"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { AuthCard, FormField } from "../components/AuthCard";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email, password);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "เข้าสู่ระบบไม่สำเร็จ");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthCard title="เข้าสู่ระบบ" subtitle="กลับมาสร้างภาพสินค้าต่อได้เลย">
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField
          label="อีเมล"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <FormField
          label="รหัสผ่าน"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && (
          <p className="text-sm" style={{ color: "var(--danger)" }}>
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg py-2.5 text-sm font-medium text-[#14130f] disabled:opacity-60"
          style={{ background: "var(--accent)" }}
        >
          {submitting ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-[var(--muted)]">
        ยังไม่มีบัญชี?{" "}
        <Link href="/register" className="text-[var(--accent)]">
          สมัครสมาชิก
        </Link>
      </p>
    </AuthCard>
  );
}
