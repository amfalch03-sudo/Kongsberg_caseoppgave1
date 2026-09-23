import type { ResourceStatus, VerificationStatus } from "../types/resources";
import { resourceStatusLabel, verificationLabel } from "../utils/format";

type StatusBadgeProps =
  | {
      kind: "status";
      value: ResourceStatus;
    }
  | {
      kind: "verification";
      value: VerificationStatus;
    }
  | {
      kind: "priority";
      value: "Høy" | "Middels" | "Lav";
    };

export default function StatusBadge(props: StatusBadgeProps) {
  const label =
    props.kind === "status"
      ? resourceStatusLabel(props.value)
      : props.kind === "verification"
        ? verificationLabel(props.value)
        : `${props.value} prioritet`;

  const className =
    props.kind === "status"
      ? {
          available: "bg-emerald-50 text-emerald-800 ring-emerald-200",
          unavailable: "bg-slate-100 text-slate-700 ring-slate-200",
          reserved: "bg-amber-50 text-amber-800 ring-amber-200",
        }[props.value]
      : props.kind === "verification"
        ? {
            verified: "bg-blue-50 text-blue-800 ring-blue-200",
            unverified: "bg-slate-100 text-slate-700 ring-slate-200",
          }[props.value]
        : {
            Høy: "bg-red-50 text-red-800 ring-red-200",
            Middels: "bg-amber-50 text-amber-800 ring-amber-200",
            Lav: "bg-emerald-50 text-emerald-800 ring-emerald-200",
          }[props.value];

  return (
    <span
      className={`inline-flex items-center rounded px-2 py-1 text-xs font-semibold ring-1 ${className}`}
    >
      {label}
    </span>
  );
}
