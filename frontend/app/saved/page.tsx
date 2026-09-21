"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { RequireAuth } from "../components/RequireAuth";
import { api, type CommunityImage } from "../lib/api";

function SavedContent() {
  const [images, setImages] = useState<CommunityImage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.savedImages().then(setImages).finally(() => setLoading(false));
  }, []);

  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-5 py-8">
      <header className="mb-8 flex items-center justify-between">
        <div><p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">SAVED</p><h1 className="mt-1 text-3xl" style={{ fontFamily: "var(--font-display)", fontWeight: 500 }}>รูปที่บันทึก</h1></div>
        <a href="/community" className="text-sm text-[var(--muted)] hover:text-[var(--accent)]">← กลับ Community</a>
      </header>
      {loading ? <p className="text-sm text-[var(--muted)]">กำลังโหลด...</p> : images.length === 0 ? <p className="text-sm text-[var(--muted)]">ยังไม่มีรูปที่บันทึก</p> : (
        <div className="columns-1 gap-5 sm:columns-2 lg:columns-3 xl:columns-4">
          {images.map((image) => <article key={image.id} className="mb-5 break-inside-avoid overflow-hidden rounded-2xl border" style={{ borderColor: "var(--border)", background: "var(--surface)" }}><Image src={image.result_image_url} alt={image.prompt} width={700} height={900} className="h-auto w-full object-cover" unoptimized /><div className="p-4"><p className="text-sm font-medium">{image.user_name}</p><p className="mt-1 line-clamp-2 text-xs text-[var(--muted)]">{image.prompt}</p></div></article>)}
        </div>
      )}
    </main>
  );
}

export default function SavedPage() { return <RequireAuth><SavedContent /></RequireAuth>; }
