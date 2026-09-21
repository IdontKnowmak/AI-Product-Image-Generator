"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { RequireAuth } from "../components/RequireAuth";
import { useAuth } from "../context/AuthContext";
import { api, type CommunityComment, type CommunityImage } from "../lib/api";

function CommunityContent() {
  const { user, logout } = useAuth();
  const [images, setImages] = useState<CommunityImage[]>([]);
  const [sort, setSort] = useState<"newest" | "popular">("newest");
  const [selected, setSelected] = useState<CommunityImage | null>(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [comments, setComments] = useState<CommunityComment[]>([]);

  async function loadImages() {
    setLoading(true);
    try {
      setImages(await api.communityImages(sort));
    } catch (err) {
      setError(err instanceof Error ? err.message : "โหลดชุมชนไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  }

  async function openImage(image: CommunityImage) {
    setSelected(image);
    try {
      const detail = await api.communityImage(image.id);
      setSelected(detail);
      setComments(detail.comments);
    } catch {
      setComments([]);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect, react-hooks/exhaustive-deps -- fetch community data when the selected sort changes
    loadImages();
  }, [sort]);

  async function toggleLike(id: string) {
    const result = await api.communityLike(id);
    setImages((prev) => prev.map((item) => item.id === id ? { ...item, liked: result.active, like_count: result.count } : item));
    setSelected((item) => item && item.id === id ? { ...item, liked: result.active, like_count: result.count } : item);
  }

  async function toggleSave(id: string) {
    const result = await api.communitySave(id);
    setImages((prev) => prev.map((item) => item.id === id ? { ...item, saved: result.active, save_count: result.count } : item));
    setSelected((item) => item && item.id === id ? { ...item, saved: result.active, save_count: result.count } : item);
  }

  function downloadImage(image: CommunityImage) {
    const downloadUrl = image.result_image_url.replace(
      "/image/upload/",
      "/image/upload/fl_attachment/"
    );
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = "ai-product-" + image.id + ".png";
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  async function addComment() {
    if (!selected || !comment.trim()) return;
    try {
      const created = await api.communityComment(selected.id, comment.trim());
      setComments((prev) => [...prev, created]);
      setSelected((item) => item ? { ...item, comment_count: item.comment_count + 1 } : item);
      setImages((prev) => prev.map((item) => item.id === selected.id ? { ...item, comment_count: item.comment_count + 1 } : item));
      setComment("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "คอมเม้นต์ไม่สำเร็จ");
    }
  }

  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-5 py-8">
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">COMMUNITY</p>
          <h1 className="mt-1 text-3xl" style={{ fontFamily: "var(--font-display)", fontWeight: 500 }}>
            แชร์แรงบันดาลใจ
          </h1>
          <p className="mt-1 text-sm text-[var(--muted)]">ดูผลงานจากคนในชุมชน กดถูกใจ คอมเม้นต์ และบันทึกภาพที่ชอบ</p>
        </div>
        <div className="flex flex-col items-end gap-3">
          <span className="text-sm text-[var(--foreground)]">{user?.full_name || user?.email}</span>
          <nav className="flex flex-wrap justify-end gap-2" aria-label="เมนูหลัก">
            <a
              href="/dashboard"
              className="rounded-full border px-4 py-2 text-sm font-medium transition-all hover:-translate-y-0.5 hover:border-[var(--accent)] hover:text-[var(--accent)]"
              style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
            >
              ✦ Studio
            </a>
            <a
              href="/community"
              className="rounded-full border px-4 py-2 text-sm font-medium shadow-sm transition-all hover:-translate-y-0.5"
              style={{ borderColor: "var(--accent)", background: "var(--accent)", color: "#14130f" }}
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
            <button
              onClick={logout}
              className="rounded-full border px-4 py-2 text-sm font-medium transition-all hover:-translate-y-0.5 hover:border-[var(--danger)] hover:text-[var(--danger)]"
              style={{ borderColor: "var(--border)", color: "var(--muted)" }}
            >
              ออกจากระบบ
            </button>
          </nav>
        </div>
      </header>

      <div className="mb-6 flex gap-2">
        <button onClick={() => setSort("newest")} className="rounded-full border px-4 py-2 text-sm" style={{ borderColor: sort === "newest" ? "var(--accent)" : "var(--border)", color: sort === "newest" ? "var(--accent)" : "var(--muted)" }}>ล่าสุด</button>
        <button onClick={() => setSort("popular")} className="rounded-full border px-4 py-2 text-sm" style={{ borderColor: sort === "popular" ? "var(--accent)" : "var(--border)", color: sort === "popular" ? "var(--accent)" : "var(--muted)" }}>ยอดนิยม</button>
      </div>

      {error && <p className="mb-4 text-sm" style={{ color: "var(--danger)" }}>{error}</p>}
      {loading ? (
        <p className="text-sm text-[var(--muted)]">กำลังโหลด...</p>
      ) : images.length === 0 ? (
        <div className="rounded-2xl border p-10 text-center" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
          <p className="text-lg">ยังไม่มีรูปสาธารณะ</p>
          <p className="mt-2 text-sm text-[var(--muted)]">กลับไป Studio แล้วเลือก “สาธารณะ” ในภาพที่ต้องการแชร์</p>
        </div>
      ) : (
        <div className="columns-1 gap-5 sm:columns-2 lg:columns-3 xl:columns-4">
          {images.map((image) => (
            <article key={image.id} className="mb-5 break-inside-avoid overflow-hidden rounded-2xl border" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
              <button type="button" onClick={() => openImage(image)} className="block w-full text-left">
                <Image src={image.result_image_url} alt={image.prompt} width={700} height={900} className="h-auto w-full object-cover" unoptimized />
              </button>
              <div className="p-4">
                <p className="text-sm font-medium">{image.user_name}</p>
                <p className="mt-1 line-clamp-2 text-xs text-[var(--muted)]">{image.prompt}</p>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <button onClick={() => toggleLike(image.id)} className="flex items-center justify-center rounded-lg border px-3 py-2 text-xs transition-colors hover:text-[var(--accent)]" style={{ borderColor: image.liked ? "var(--accent)" : "var(--border)", color: image.liked ? "var(--accent)" : "var(--muted)" }}>
                    <span>{image.liked ? "♥" : "♡"}</span>
                    <span className="ml-1.5">{image.like_count}</span>
                  </button>
                  <button onClick={() => openImage(image)} className="flex items-center justify-center rounded-lg border px-3 py-2 text-xs text-[var(--muted)] transition-colors hover:text-[var(--accent)]" style={{ borderColor: "var(--border)" }}>
                    <span>💬</span>
                    <span className="ml-1.5">{image.comment_count}</span>
                  </button>
                  <button onClick={() => downloadImage(image)} className="flex items-center justify-center rounded-lg border px-3 py-2 text-xs text-[var(--muted)] transition-colors hover:text-[var(--accent)]" style={{ borderColor: "var(--border)" }}>
                    <span>↓</span>
                    <span className="ml-1.5">ดาวน์โหลด</span>
                  </button>
                  <button onClick={() => toggleSave(image.id)} className="flex items-center justify-center rounded-lg border px-3 py-2 text-xs transition-colors hover:text-[var(--accent)]" style={{ borderColor: image.saved ? "var(--accent)" : "var(--border)", color: image.saved ? "var(--accent)" : "var(--muted)" }}>
                    <span>{image.saved ? "✓" : "＋"}</span>
                    <span className="ml-1.5">{image.saved ? "บันทึกแล้ว" : "บันทึก"}</span>
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={() => setSelected(null)}>
          <div className="grid max-h-[92vh] w-full max-w-5xl overflow-hidden rounded-2xl border lg:grid-cols-[1.15fr_.85fr]" style={{ borderColor: "var(--border)", background: "var(--surface)" }} onClick={(e) => e.stopPropagation()}>
            <div className="flex min-h-0 items-center justify-center bg-black p-3">
              <Image src={selected.result_image_url} alt={selected.prompt} width={1200} height={1200} className="max-h-[88vh] w-auto object-contain" unoptimized />
            </div>
            <div className="flex min-h-0 flex-col p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium">{selected.user_name}</p>
                  <p className="mt-1 text-xs text-[var(--muted)]">{selected.prompt}</p>
                </div>
                <button onClick={() => setSelected(null)} className="text-xl text-[var(--muted)]">✕</button>
              </div>
              <div className="mt-4 flex gap-2">
                <button onClick={() => toggleLike(selected.id)} className="rounded-full border px-4 py-2 text-sm" style={{ borderColor: selected.liked ? "var(--accent)" : "var(--border)", color: selected.liked ? "var(--accent)" : "var(--muted)" }}>{selected.liked ? "♥ ถูกใจแล้ว" : "♡ ถูกใจ"} {selected.like_count}</button>
                <button onClick={() => downloadImage(selected)} className="rounded-full border px-4 py-2 text-sm text-[var(--muted)] hover:text-[var(--accent)]" style={{ borderColor: "var(--border)" }}>↓ ดาวน์โหลด</button>
                <button onClick={() => toggleSave(selected.id)} className="rounded-full border px-4 py-2 text-sm" style={{ borderColor: selected.saved ? "var(--accent)" : "var(--border)", color: selected.saved ? "var(--accent)" : "var(--muted)" }}>{selected.saved ? "✓ บันทึกแล้ว" : "＋ บันทึก"}</button>
              </div>
              <div className="mt-5 min-h-0 flex-1 overflow-y-auto border-t pt-4" style={{ borderColor: "var(--border)" }}>
                <p className="mb-3 text-sm font-medium">ความคิดเห็น ({comments.length})</p>
                <div className="space-y-3">
                  {comments.map((item) => (
                    <div key={item.id} className="rounded-lg p-3" style={{ background: "var(--surface-2)" }}>
                      <p className="text-xs font-medium">{item.user_name}</p>
                      <p className="mt-1 text-sm">{item.content}</p>
                    </div>
                  ))}
                  {comments.length === 0 && <p className="text-sm text-[var(--muted)]">ยังไม่มีความคิดเห็น</p>}
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <input value={comment} onChange={(e) => setComment(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addComment()} placeholder="เขียนความคิดเห็น..." className="min-w-0 flex-1 rounded-lg border bg-transparent px-3 py-2 text-sm outline-none focus:border-[var(--accent)]" style={{ borderColor: "var(--border)" }} />
                <button onClick={addComment} className="rounded-lg px-4 py-2 text-sm font-medium text-[#14130f]" style={{ background: "var(--accent)" }}>ส่ง</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default function CommunityPage() {
  return <RequireAuth><CommunityContent /></RequireAuth>;
}
