"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { RequireAuth } from "../components/RequireAuth";
import { StatusBadge } from "../components/StatusBadge";
import { useAuth } from "../context/AuthContext";
import { api, type Generation } from "../lib/api";

const TYPE_LABELS = {
  product_scene: "ตกแต่งฉากสินค้า",
  ad_creative: "ภาพโฆษณา",
} as const;

function getDownloadUrl(url: string) {
  return url.replace(
    "/image/upload/",
    "/image/upload/fl_attachment/"
  );
}

function DashboardContent() {
  const { user, logout } = useAuth();
  const [generationType, setGenerationType] =
    useState<Generation["generation_type"]>("product_scene");
  const [prompt, setPrompt] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<Generation[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  

  async function loadHistory() {
    setLoadingHistory(true);
    try {
      const data = await api.listGenerations();
      setHistory(data);
    } catch {
      // silently ignore - history is non-critical
    } finally {
      setLoadingHistory(false);
    }
  }

  async function handleDelete(id: string) {
  const confirmDelete = confirm(
    "ต้องการลบรายการนี้ใช่หรือไม่?"
  );

  if (!confirmDelete) return;

  try {
    setDeleting(id);

    await api.deleteGeneration(id);

    setHistory((prev) =>
      prev.filter((item) => item.id !== id)
    );

  } catch (err) {
    setError(
      err instanceof Error
        ? err.message
        : "ลบไม่สำเร็จ"
    );
  } finally {
    setDeleting(null);
  }
}

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect, react-hooks/exhaustive-deps -- fetching history on mount is the standard pattern
    loadHistory();
  }, []);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0] ?? null;
    setFile(selected);
    setPreview(selected ? URL.createObjectURL(selected) : null);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!prompt.trim()) {
      setError("กรุณาใส่คำอธิบายฉากหรือสไตล์ที่ต้องการ");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const result = await api.createGeneration({
        generation_type: generationType,
        prompt,
        sourceImage: file,
      });
      setHistory((prev) => [result, ...prev]);

      if (result.status === "failed") {
        setError(result.error_message || "สร้างภาพไม่สำเร็จ กรุณาลองใหม่");
      } else {
        setPrompt("");
        setFile(null);
        setPreview(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "สร้างภาพไม่สำเร็จ");
    } finally {
      setSubmitting(false);
    }
  }

  

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-10">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
            สตูดิโอ
          </p>
          <h1
            className="mt-1 text-3xl"
            style={{ fontFamily: "var(--font-display)", fontWeight: 500 }}
          >
            สร้างภาพสินค้า
          </h1>
        </div>
        <div className="flex flex-col items-end gap-3">
          <p className="text-sm text-[var(--foreground)]">{user?.email}</p>
          <nav className="flex flex-wrap justify-end gap-2" aria-label="เมนูหลัก">
            <a
              href="/dashboard"
              className="rounded-full border px-4 py-2 text-sm font-medium shadow-sm transition-all hover:-translate-y-0.5"
              style={{ borderColor: "var(--accent)", background: "var(--accent)", color: "#14130f" }}
            >
              ✦ Studio
            </a>
            <a
              href="/community"
              className="rounded-full border px-4 py-2 text-sm font-medium transition-all hover:-translate-y-0.5 hover:border-[var(--accent)] hover:text-[var(--accent)]"
              style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
            >
              ✦ Community
            </a>
            <a
              href="/saved"
              className="rounded-full border px-4 py-2 text-sm font-medium transition-all hover:-translate-y-0.5 hover:border-[var(--accent)] hover:text-[var(--accent)]"
              style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
            >
              ♡ บันทึก
            </a>
            {user?.role === "admin" && (
              <a
                href="/admin"
                className="rounded-full border px-4 py-2 text-sm font-medium transition-all hover:-translate-y-0.5 hover:border-[var(--accent)] hover:text-[var(--accent)]"
                style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
              >
                ⚙ หลังบ้าน
              </a>
            )}
            <button
              onClick={logout}
              className="rounded-full border px-4 py-2 text-sm font-medium transition-all hover:-translate-y-0.5 hover:border-[var(--danger)] hover:text-[var(--danger)]"
              style={{ borderColor: "var(--border)", color: "var(--muted)" }}
            >
              ออกจากระบบ
            </button>
          </nav>
        </div>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_1.2fr]">
        {/* Generation form */}
        <form
          onSubmit={handleSubmit}
          className="h-fit rounded-2xl border p-6"
          style={{ background: "var(--surface)", borderColor: "var(--border)" }}
        >
          <div className="flex gap-2">
            {(Object.keys(TYPE_LABELS) as Generation["generation_type"][]).map(
              (type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setGenerationType(type)}
                  className="flex-1 rounded-lg border px-3 py-2 text-sm transition-colors"
                  style={{
                    borderColor:
                      generationType === type ? "var(--accent)" : "var(--border)",
                    color:
                      generationType === type
                        ? "var(--accent)"
                        : "var(--muted)",
                  }}
                >
                  {TYPE_LABELS[type]}
                </button>
              )
            )}
          </div>

          <label className="mt-5 block text-sm">
            <span className="text-[var(--muted)]">รูปสินค้า (ไม่บังคับ)</span>
            <div
              className="mt-1.5 flex aspect-video items-center justify-center rounded-lg border border-dashed"
              style={{ borderColor: "var(--border)" }}
            >
              {preview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={preview}
                  alt="ตัวอย่างรูปสินค้า"
                  className="h-full w-full rounded-lg object-contain p-2"
                />
              ) : (
                <span className="text-xs text-[var(--muted)]">
                  คลิกเพื่ออัปโหลดรูปสินค้า
                </span>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="mt-2 w-full text-xs text-[var(--muted)]"
            />
          </label>

          <label className="mt-5 block text-sm">
            <span className="text-[var(--muted)]">
              อธิบายฉากหรือสไตล์ที่ต้องการ
            </span>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={4}
              placeholder="แนะนำให้เขียน Prompt เป็นภาษาอังกฤษ เช่น “Place the product on a wooden table in a cozy café with warm morning sunlight.”"
              className="mt-1.5 w-full rounded-lg border bg-transparent px-3 py-2.5 text-[var(--foreground)] outline-none transition-colors focus:border-[var(--accent)]"
              style={{ borderColor: "var(--border)" }}
            />
          </label>

          {error && (
            <p className="mt-3 text-sm" style={{ color: "var(--danger)" }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="mt-5 w-full rounded-lg py-2.5 text-sm font-medium text-[#14130f] disabled:opacity-60"
            style={{ background: "var(--accent)" }}
          >
            {submitting ? "กำลังสร้างภาพ..." : "สร้างภาพ"}
          </button>
        </form>

        {/* Gallery / history */}
        <div>
          <div className="flex items-center justify-between">
            <h2 className="text-sm text-[var(--muted)]">ประวัติการสร้างภาพ</h2>
            <span className="text-xs text-[var(--muted)]">เลือกเพื่อแชร์ใน Community</span>
          </div>
          <div className="mt-3 space-y-4">
            {loadingHistory && (
              <p className="text-sm text-[var(--muted)]">กำลังโหลด...</p>
            )}
            {!loadingHistory && history.length === 0 && (
              <p className="text-sm text-[var(--muted)]">
                ยังไม่มีภาพที่สร้าง — ลองสร้างภาพแรกของคุณดูสิ
              </p>
            )}
            {history.map((gen) => (
              <div
                key={gen.id}
                className="flex gap-4 rounded-xl border p-3"
                style={{ borderColor: "var(--border)", background: "var(--surface)" }}
              >
                <div
                  className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-lg"
                  style={{ background: "var(--surface-2)" }}
                >
                  {gen.result_image_url ? (
                    <button
                      type="button"
                      onClick={() => setSelectedImage(gen.result_image_url)}
                      className="h-full w-full cursor-pointer"
                      title="คลิกเพื่อดูรูปขนาดใหญ่"
                    >
                      <Image
                        src={gen.result_image_url}
                        alt={gen.prompt}
                        width={96}
                        height={96}
                        className="h-full w-full object-cover transition-transform hover:scale-105"
                        unoptimized
                      />
                    </button>
                  ) : (
                    <span className="text-xs text-[var(--muted)]">—</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs text-[var(--muted)]">
                      {TYPE_LABELS[gen.generation_type]}
                    </span>
                    <StatusBadge status={gen.status} />
                  </div>
                  <p className="mt-1 truncate text-sm text-[var(--foreground)]">
                    {gen.prompt}
                  </p>
                  <div className="mt-2 flex gap-2">

                    {gen.result_image_url && (
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            const updated = await api.setGenerationVisibility(gen.id, !gen.is_public);
                            setHistory((prev) => prev.map((item) => item.id === gen.id ? updated : item));
                          } catch (err) {
                            setError(err instanceof Error ? err.message : "เปลี่ยนสถานะการแชร์ไม่สำเร็จ");
                          }
                        }}
                        className="rounded-md border px-3 py-1.5 text-xs font-medium"
                        style={{ borderColor: gen.is_public ? "var(--accent)" : "var(--border)", color: gen.is_public ? "var(--accent)" : "var(--muted)" }}
                      >
                        {gen.is_public ? "◉ สาธารณะ" : "○ ส่วนตัว"}
                      </button>
                    )}

                    {gen.result_image_url && (
                      <a
                        href={getDownloadUrl(gen.result_image_url)}
                        className="inline-flex items-center rounded-md px-3 py-1.5 text-xs font-medium"
                        style={{
                          background: "var(--accent)",
                          color: "#14130f",
                        }}
                      >
                        ดาวน์โหลดรูป
                      </a>
                    )}

                    <button
                      onClick={() => handleDelete(gen.id)}
                      disabled={deleting === gen.id}
                      className="ml-2 rounded-md px-3 py-1.5 text-xs font-medium"
                      style={{
                        background: "#dc2626",
                        color: "white",
                      }}
                    >
                      {deleting === gen.id ? "กำลังลบ..." : "ลบ"}
                    </button>

                  </div>

                    {gen.error_message && (
                    <p className="mt-1 text-xs" style={{ color: "var(--danger)" }}>
                      {gen.error_message}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {selectedImage && (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
    onClick={() => setSelectedImage(null)}
  >
    <div
      className="relative max-h-[90vh] max-w-[90vw]"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        onClick={() => setSelectedImage(null)}
        className="absolute -right-3 -top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white text-black shadow-lg"
        aria-label="ปิด"
      >
        ✕
      </button>

            <Image
              src={selectedImage}
              alt="รูปภาพขนาดใหญ่"
              width={1200}
              height={1200}
              className="max-h-[90vh] w-auto rounded-xl object-contain"
              unoptimized
            />
          </div>
        </div>
      )}
    </main>
  );
}

export default function DashboardPage() {
  return (
    <RequireAuth>
      <DashboardContent />
    </RequireAuth>
  );
}
