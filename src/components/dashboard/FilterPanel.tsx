import { Filter, Search } from "lucide-react";
import type { ReactNode } from "react";
import type {
  GeneratorResource,
  ResourceFilters,
  ResourceStatus,
  ResourceType,
  VerificationStatus,
} from "../../types/resources";

type FilterPanelProps = {
  filters: ResourceFilters;
  onChange: (filters: ResourceFilters) => void;
};

const resourceTypes: Array<{ key: ResourceType; label: string }> = [
  { key: "generator", label: "Aggregat" },
  { key: "solar", label: "Solenergi" },
  { key: "battery", label: "Batteri" },
];

const statuses: Array<{ key: ResourceStatus; label: string }> = [
  { key: "available", label: "Tilgjengelig" },
  { key: "unavailable", label: "Utilgjengelig" },
  { key: "reserved", label: "Reservert" },
];

const verifications: Array<{ key: VerificationStatus; label: string }> = [
  { key: "verified", label: "Verifisert" },
  { key: "unverified", label: "Ikke verifisert" },
];

const fuels: Array<{ key: GeneratorResource["fuel"]; label: string }> = [
  { key: "diesel", label: "Diesel" },
  { key: "bensin", label: "Bensin" },
  { key: "gass", label: "Gass" },
];

function PanelCheckbox({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-4 w-4 rounded border-slate-300 text-preparedness-green focus:ring-preparedness-green"
      />
      <span>{label}</span>
    </label>
  );
}

function FilterGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset className="border-t border-slate-200 pt-4">
      <legend className="mb-3 text-xs font-bold uppercase text-slate-500">{title}</legend>
      <div className="space-y-2">{children}</div>
    </fieldset>
  );
}

export default function FilterPanel({ filters, onChange }: FilterPanelProps) {
  return (
    <aside className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded bg-navy-50 text-navy-800">
          <Filter className="h-4 w-4" aria-hidden="true" />
        </span>
        <h2 className="text-base font-bold text-navy-950">Filter</h2>
      </div>

      <label className="relative block">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
          aria-hidden="true"
        />
        <input
          value={filters.search}
          onChange={(event) => onChange({ ...filters, search: event.target.value })}
          placeholder="Søk adresse, ressurs eller eier"
          className="w-full rounded-md border border-slate-300 bg-white py-2.5 pl-9 pr-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-preparedness-green focus:ring-2 focus:ring-emerald-100"
        />
      </label>

      <div className="mt-5 space-y-5">
        <FilterGroup title="Ressurstype">
          {resourceTypes.map(({ key, label }) => (
            <PanelCheckbox
              key={key}
              label={label}
              checked={filters.types[key]}
              onChange={(checked) =>
                onChange({ ...filters, types: { ...filters.types, [key]: checked } })
              }
            />
          ))}
        </FilterGroup>

        <FilterGroup title="Status">
          {statuses.map(({ key, label }) => (
            <PanelCheckbox
              key={key}
              label={label}
              checked={filters.statuses[key]}
              onChange={(checked) =>
                onChange({ ...filters, statuses: { ...filters.statuses, [key]: checked } })
              }
            />
          ))}
        </FilterGroup>

        <FilterGroup title="Verifisering">
          {verifications.map(({ key, label }) => (
            <PanelCheckbox
              key={key}
              label={label}
              checked={filters.verification[key]}
              onChange={(checked) =>
                onChange({
                  ...filters,
                  verification: { ...filters.verification, [key]: checked },
                })
              }
            />
          ))}
        </FilterGroup>

        <FilterGroup title="Minimum effekt">
          <div className="flex items-center justify-between text-sm font-semibold text-navy-950">
            <span>0 kW</span>
            <span>{filters.minPowerKw >= 50 ? "50+ kW" : `${filters.minPowerKw} kW`}</span>
          </div>
          <input
            type="range"
            min="0"
            max="50"
            value={filters.minPowerKw}
            onChange={(event) =>
              onChange({ ...filters, minPowerKw: Number(event.target.value) })
            }
            className="w-full accent-preparedness-green"
          />
        </FilterGroup>

        <FilterGroup title="Avstand">
          <div className="flex items-center justify-between text-sm font-semibold text-navy-950">
            <span>1 km</span>
            <span>{filters.maxDistanceKm} km</span>
          </div>
          <input
            type="range"
            min="1"
            max="50"
            value={filters.maxDistanceKm}
            onChange={(event) =>
              onChange({ ...filters, maxDistanceKm: Number(event.target.value) })
            }
            className="w-full accent-preparedness-green"
          />
        </FilterGroup>

        <FilterGroup title="Drivstoff">
          {fuels.map(({ key, label }) => (
            <PanelCheckbox
              key={key}
              label={label}
              checked={filters.fuels[key]}
              onChange={(checked) =>
                onChange({ ...filters, fuels: { ...filters.fuels, [key]: checked } })
              }
            />
          ))}
          <PanelCheckbox
            label="Transportabel"
            checked={filters.transportableOnly}
            onChange={(checked) => onChange({ ...filters, transportableOnly: checked })}
          />
        </FilterGroup>

        <FilterGroup title="Sol">
          <PanelCheckbox
            label="Fungerer under strømbrudd"
            checked={filters.solarOutageOnly}
            onChange={(checked) => onChange({ ...filters, solarOutageOnly: checked })}
          />
          <PanelCheckbox
            label="Har batteri"
            checked={filters.solarWithBatteryOnly}
            onChange={(checked) => onChange({ ...filters, solarWithBatteryOnly: checked })}
          />
        </FilterGroup>
      </div>
    </aside>
  );
}
