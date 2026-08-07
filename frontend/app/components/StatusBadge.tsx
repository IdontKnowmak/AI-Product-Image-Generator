import type { Generation } from "../lib/api";

const LABELS: Record<Generation["status"], string> = {
  pending: "กำลังสร้าง",
  completed: "เสร็จแล้ว",
  failed: "ล้มเหลว",
};

const COLORS: Record<Generation["status"], string> = {
  pending: "var(--muted)",
  completed: "var(--success)",
  failed: "var(--danger)",
};

export function StatusBadge({ status }: { status: Generation["status"] }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs"
      style={{ borderColor: COLORS[status], color: COLORS[status] }}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ background: COLORS[status] }}
      />
      {LABELS[status]}
    </span>
  );
}
