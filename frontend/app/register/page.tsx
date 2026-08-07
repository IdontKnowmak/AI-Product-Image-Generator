"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { AuthCard, FormField } from "../components/AuthCard";
import { useAuth } from "../context/AuthContext";

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร");
      return;
    }

    setSubmitting(true);
    try {
      await register(email, password, fullName || undefined);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "สมัครสมาชิกไม่สำเร็จ");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthCard title="สร้างบัญชีใหม่" subtitle="เริ่มสร้างภาพสินค้าด้วย AI ฟรี">
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField
          label="ชื่อ (ไม่บังคับ)"
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />
        <FormField
          label="อีเมล"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <FormField
          label="รหัสผ่าน (อย่างน้อย 8 ตัวอักษร)"
          type="password"
          required
          minLength={8}
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
          {submitting ? "กำลังสมัครสมาชิก..." : "สมัครสมาชิก"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-[var(--muted)]">
        มีบัญชีอยู่แล้ว?{" "}
        <Link href="/login" className="text-[var(--accent)]">
          เข้าสู่ระบบ
        </Link>
      </p>
    </AuthCard>
  );
}
