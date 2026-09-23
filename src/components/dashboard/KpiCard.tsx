import type { LucideIcon } from "lucide-react";

type KpiCardProps = {
  label: string;
  value: string;
  icon: LucideIcon;
  tone?: "blue" | "green" | "amber" | "red";
};

const tones = {
  blue: "bg-blue-50 text-blue-800",
  green: "bg-emerald-50 text-emerald-800",
  amber: "bg-amber-50 text-amber-800",
  red: "bg-red-50 text-red-800",
};

export default function KpiCard({ label, value, icon: Icon, tone = "blue" }: KpiCardProps) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-bold tracking-normal text-navy-950">{value}</p>
        </div>
        <span className={`flex h-10 w-10 items-center justify-center rounded ${tones[tone]}`}>
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
      </div>
    </article>
  );
}
