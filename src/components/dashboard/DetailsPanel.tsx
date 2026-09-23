import {
  BatteryCharging,
  CheckCircle2,
  ExternalLink,
  MapPin,
  Phone,
  Route,
  ShieldAlert,
  Sun,
  Zap,
} from "lucide-react";
import DetailRow from "../DetailRow";
import StatusBadge from "../StatusBadge";
import type { EnergyResource, PowerNeed } from "../../types/resources";
import {
  formatKw,
  formatKwh,
  ownerName,
  resourceStatusLabel,
  resourceTypeLabel,
  verificationLabel,
} from "../../utils/format";

export type MatchedResource = {
  resource: EnergyResource;
  distanceKm: number;
  sufficient: boolean;
};

const fallbackRouteStart = {
  lat: 63.4305,
  lng: 10.3951,
};

type DetailsPanelProps = {
  selectedResource?: EnergyResource;
  selectedNeed?: PowerNeed;
  matchingResources: MatchedResource[];
  onResourceSelect: (resource: EnergyResource, keepNeedContext?: boolean) => void;
  onReserve: (resource: EnergyResource) => void;
};

function ResourceIcon({ resource }: { resource: EnergyResource }) {
  const Icon =
    resource.type === "generator"
      ? Zap
      : resource.type === "solar"
        ? Sun
        : BatteryCharging;

  return (
    <span className="flex h-11 w-11 items-center justify-center rounded bg-navy-50 text-navy-800">
      <Icon className="h-5 w-5" aria-hidden="true" />
    </span>
  );
}

function routeUrl(resource: EnergyResource, need?: PowerNeed) {
  const start = need ? resource.coordinates : fallbackRouteStart;
  const end = need?.coordinates ?? resource.coordinates;
  const midpointLat = (start.lat + end.lat) / 2;
  const midpointLng = (start.lng + end.lng) / 2;
  const route = encodeURIComponent(`${start.lat},${start.lng};${end.lat},${end.lng}`);

  return `https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=${route}#map=13/${midpointLat}/${midpointLng}`;
}

function TypeSpecificDetails({ resource }: { resource: EnergyResource }) {
  if (resource.type === "generator") {
    return (
      <>
        <DetailRow label="Spenning" value={resource.voltage} />
        <DetailRow label="Fase" value={resource.phase} />
        <DetailRow label="Drivstoff" value={resource.fuel} />
        <DetailRow label="Transportabel" value={resource.transportable ? "Ja" : "Nei"} />
        <DetailRow label="Estimert driftstid" value={`${resource.runtimeHours} timer`} />
        <DetailRow label="Kapasitet på tank" value={resource.fuelAvailable} />
        <DetailRow label="Tilkoblingstype" value={resource.connectionType} />
        <DetailRow label="Sist service" value={resource.lastService} />
      </>
    );
  }

  if (resource.type === "solar") {
    return (
      <>
        <DetailRow label="Installert kapasitet" value={`${resource.installedCapacityKwp} kWp`} />
        <DetailRow label="Invertereffekt" value={formatKw(resource.inverterPowerKw)} />
        <DetailRow
          label="Strøm ved nettutfall"
          value={
            resource.outageCapable === "yes"
              ? "Ja"
              : resource.outageCapable === "unknown"
                ? "Usikker"
                : "Nei"
          }
        />
        <DetailRow
          label="Backup-effekt"
          value={resource.backupPowerKw ? formatKw(resource.backupPowerKw) : "Ikke oppgitt"}
        />
        <DetailRow label="Har batteri" value={resource.hasBattery ? "Ja" : "Nei"} />
        {resource.batteryCapacityKwh && (
          <DetailRow label="Batterikapasitet" value={formatKwh(resource.batteryCapacityKwh)} />
        )}
        <DetailRow label="Invertertype" value={resource.inverterType} />
      </>
    );
  }

  return (
    <>
      <DetailRow label="Batterikapasitet" value={formatKwh(resource.capacityKwh)} />
      <DetailRow label="Maksimal effekt" value={formatKw(resource.maxPowerKw)} />
      <DetailRow label="Spenning" value={resource.voltage} />
      <DetailRow label="Installasjon" value={resource.installation} />
      <DetailRow label="Kan lades fra solceller" value={resource.canChargeFromSolar ? "Ja" : "Nei"} />
      <DetailRow label="Tilkoblingstype" value={resource.connectionType} />
    </>
  );
}

function ResourceDetails({
  resource,
  activeNeed,
  onReserve,
}: {
  resource: EnergyResource;
  activeNeed?: PowerNeed;
  onReserve: (resource: EnergyResource) => void;
}) {
  const phoneHref = `tel:${resource.owner.phone.replace(/\s/g, "")}`;

  return (
    <div>
      <div className="flex items-start gap-3">
        <ResourceIcon resource={resource} />
        <div>
          <p className="text-xs font-bold uppercase text-slate-500">
            {resourceTypeLabel(resource.type)}
          </p>
          <h2 className="mt-1 text-xl font-bold tracking-normal text-navy-950">
            {resource.description}
          </h2>
          <div className="mt-3 flex flex-wrap gap-2">
            <StatusBadge kind="status" value={resource.status} />
            <StatusBadge kind="verification" value={resource.verification} />
          </div>
        </div>
      </div>

      <dl className="mt-6 rounded-lg border border-slate-200 p-4">
        <DetailRow label="Effekt" value={formatKw(resource.powerKw)} />
        <TypeSpecificDetails resource={resource} />
        <DetailRow
          label="Sist verifisert"
          value={resource.lastVerified ?? verificationLabel(resource.verification)}
        />
      </dl>

      <section className="mt-6 rounded-lg border border-slate-200 p-4">
        <h3 className="text-sm font-bold uppercase text-slate-500">Lokasjon</h3>
        <div className="mt-3 flex gap-3 text-sm text-slate-700">
          <MapPin className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
          <p>
            {resource.address}
            <br />
            {resource.postalCode} {resource.city}
          </p>
        </div>
      </section>

      <section className="mt-4 rounded-lg border border-slate-200 p-4">
        <h3 className="text-sm font-bold uppercase text-slate-500">Eier</h3>
        <div className="mt-3 text-sm leading-6 text-slate-700">
          <p className="font-bold text-navy-950">{ownerName(resource)}</p>
          {resource.owner.organization && <p>{resource.owner.organization}</p>}
          <p>{resource.owner.phone}</p>
          <p>{resource.owner.email}</p>
        </div>
      </section>

      {resource.comment && (
        <p className="mt-4 rounded-md bg-slate-50 p-3 text-sm leading-6 text-slate-600">
          {resource.comment}
        </p>
      )}

      <div className="mt-6 grid gap-3">
        <a
          href={phoneHref}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-navy-900 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-navy-800"
        >
          <Phone className="h-4 w-4" aria-hidden="true" />
          Kontakt eier
        </a>
        <button
          type="button"
          onClick={() => onReserve(resource)}
          disabled={resource.status === "reserved"}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-preparedness-green px-4 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
          {resource.status === "reserved" ? "Ressurs reservert" : "Reserver ressurs"}
        </button>
        <a
          href={routeUrl(resource, activeNeed)}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-navy-900 transition hover:bg-slate-50"
        >
          <Route className="h-4 w-4" aria-hidden="true" />
          Vis rute
          <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
        </a>
      </div>
    </div>
  );
}

function NeedDetails({
  need,
  matchingResources,
  onResourceSelect,
}: {
  need: PowerNeed;
  matchingResources: MatchedResource[];
  onResourceSelect: (resource: EnergyResource, keepNeedContext?: boolean) => void;
}) {
  const availableCount = matchingResources.filter(
    ({ resource }) => resource.status === "available",
  ).length;

  return (
    <div>
      <div className="flex items-start gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded bg-red-50 text-red-700">
          <ShieldAlert className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <p className="text-xs font-bold uppercase text-red-700">Strømbehov</p>
          <h2 className="mt-1 text-xl font-bold tracking-normal text-navy-950">{need.title}</h2>
          <div className="mt-3">
            <StatusBadge kind="priority" value={need.priority} />
          </div>
        </div>
      </div>

      <dl className="mt-6 rounded-lg border border-slate-200 p-4">
        <DetailRow label="Behov" value={formatKw(need.requiredPowerKw)} />
        <DetailRow label="Spenning" value={need.voltage} />
        <DetailRow label="Varighet" value={`${need.durationHours} timer`} />
        <DetailRow label="Lokasjon" value={`${need.address}, ${need.city}`} />
      </dl>

      <section className="mt-5">
        <h3 className="text-sm font-bold uppercase text-slate-500">Formål</h3>
        <div className="mt-3 flex flex-wrap gap-2">
          {need.purposes.map((purpose) => (
            <span
              key={purpose}
              className="rounded bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700"
            >
              {purpose}
            </span>
          ))}
        </div>
        <p className="mt-4 text-sm leading-6 text-slate-600">{need.description}</p>
      </section>

      <section className="mt-6 border-t border-slate-200 pt-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold uppercase text-slate-500">Matchende ressurser</h3>
            <p className="mt-1 text-sm text-slate-600">
              {availableCount} tilgjengelige ressurser innen 5 km.
            </p>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          {matchingResources.slice(0, 5).map(({ resource, distanceKm, sufficient }) => (
            <article
              key={resource.id}
              className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-bold text-navy-950">{resource.description}</p>
                  <p className="mt-1 text-xs font-semibold text-slate-500">
                    {formatKw(resource.powerKw)} · {distanceKm.toFixed(1)} km ·{" "}
                    {resourceStatusLabel(resource.status)}
                  </p>
                </div>
                <span
                  className={`rounded px-2 py-1 text-xs font-bold ${
                    sufficient
                      ? "bg-emerald-50 text-emerald-800"
                      : "bg-amber-50 text-amber-800"
                  }`}
                >
                  {sufficient ? "Nok effekt" : "Delvis"}
                </span>
              </div>
              <div className="mt-3 flex items-center justify-between gap-3">
                <span className="text-xs font-semibold text-slate-500">
                  {verificationLabel(resource.verification)}
                </span>
                <button
                  type="button"
                  onClick={() => onResourceSelect(resource, true)}
                  className="rounded bg-navy-900 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-navy-800"
                >
                  Se ressurs
                </button>
              </div>
            </article>
          ))}
          {matchingResources.length === 0 && (
            <p className="rounded-md bg-slate-50 p-3 text-sm text-slate-600">
              Ingen ressurser innen 5 km matcher gjeldende filtrering.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}

export default function DetailsPanel({
  selectedResource,
  selectedNeed,
  matchingResources,
  onResourceSelect,
  onReserve,
}: DetailsPanelProps) {
  return (
    <aside className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      {selectedResource ? (
        <ResourceDetails
          resource={selectedResource}
          activeNeed={selectedNeed}
          onReserve={onReserve}
        />
      ) : selectedNeed ? (
        <NeedDetails
          need={selectedNeed}
          matchingResources={matchingResources}
          onResourceSelect={onResourceSelect}
        />
      ) : (
        <div className="flex min-h-[560px] flex-col items-center justify-center text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-navy-50 text-navy-800">
            <MapPin className="h-7 w-7" aria-hidden="true" />
          </span>
          <h2 className="mt-5 text-lg font-bold text-navy-950">Velg et punkt i kartet</h2>
          <p className="mt-2 max-w-xs text-sm leading-6 text-slate-600">
            Ressurser viser kapasitet og kontaktinformasjon. Strømbehov viser
            prioritet og matchende energikilder.
          </p>
        </div>
      )}
    </aside>
  );
}
