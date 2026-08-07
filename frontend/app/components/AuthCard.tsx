import type { ReactNode } from "react";

export function AuthCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <main className="relative flex flex-1 items-center justify-center overflow-hidden px-6 py-16">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 h-[420px] w-[420px] -translate-x-1/2 rounded-full opacity-50 blur-[100px]"
        style={{
          background:
            "radial-gradient(circle, var(--accent-dim) 0%, transparent 70%)",
        }}
      />
      <div
        className="relative z-10 w-full max-w-sm rounded-2xl border p-8"
        style={{ background: "var(--surface)", borderColor: "var(--border)" }}
      >
        <h1
          className="text-2xl"
          style={{ fontFamily: "var(--font-display)", fontWeight: 500 }}
        >
          {title}
        </h1>
        <p className="mt-1 text-sm text-[var(--muted)]">{subtitle}</p>
        <div className="mt-6">{children}</div>
      </div>
    </main>
  );
}

export function FormField({
  label,
  ...props
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block text-sm">
      <span className="text-[var(--muted)]">{label}</span>
      <input
        {...props}
        className="mt-1.5 w-full rounded-lg border bg-transparent px-3 py-2.5 text-[var(--foreground)] outline-none transition-colors focus:border-[var(--accent)]"
        style={{ borderColor: "var(--border)" }}
      />
    </label>
  );
}
