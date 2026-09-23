import type { ReactNode } from "react";

type DetailRowProps = {
  label: string;
  value: ReactNode;
};

export default function DetailRow({ label, value }: DetailRowProps) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-slate-100 py-2 last:border-0">
      <dt className="text-sm text-slate-500">{label}</dt>
      <dd className="text-right text-sm font-semibold text-navy-950">{value}</dd>
    </div>
  );
}
