import {
  Activity,
  AlertTriangle,
  BatteryCharging,
  CheckCircle2,
  Gauge,
  MapPinned,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import DetailsPanel, { type MatchedResource } from "../components/dashboard/DetailsPanel";
import FilterPanel from "../components/dashboard/FilterPanel";
import KpiCard from "../components/dashboard/KpiCard";
import PreparednessMap from "../components/dashboard/PreparednessMap";
import { mockPowerNeeds, mockResources, trondheimCenter } from "../data/mockData";
import type { Coordinates, EnergyResource, ResourceFilters } from "../types/resources";
import { distanceKm } from "../utils/distance";
import { formatKw, ownerName, resourceTypeLabel } from "../utils/format";
import {
  loadLocalResources,
  replaceLocalResources,
} from "../utils/localStorage";

const defaultFilters: ResourceFilters = {
  search: "",
  types: {
    generator: true,
    solar: true,
    battery: true,
  },
  statuses: {
    available: true,
    unavailable: true,
    reserved: true,
  },
  verification: {
    verified: true,
    unverified: true,
  },
  minPowerKw: 0,
  maxDistanceKm: 50,
  fuels: {
    diesel: false,
    bensin: false,
    gass: false,
    annet: false,
  },
  transportableOnly: false,
  solarOutageOnly: false,
  solarWithBatteryOnly: false,
};

const crisisStatuses = {
  available: true,
  unavailable: false,
  reserved: false,
};

function includesSearch(resource: EnergyResource, search: string) {
  if (!search.trim()) {
    return true;
  }

  const query = search.trim().toLowerCase();
  const text = [
    resource.id,
    resource.name,
    resource.description,
    resource.address,
    resource.postalCode,
    resource.city,
    ownerName(resource),
    resource.owner.organization,
    resourceTypeLabel(resource.type),
    resource.type === "generator" ? resource.fuel : "",
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return text.includes(query);
}

function filterResources(
  resources: EnergyResource[],
  filters: ResourceFilters,
  referencePoint: Coordinates,
) {
  const selectedFuels = Object.entries(filters.fuels)
    .filter(([, selected]) => selected)
    .map(([fuel]) => fuel);

  return resources.filter((resource) => {
    if (!filters.types[resource.type]) {
      return false;
    }
    if (!filters.statuses[resource.status]) {
      return false;
    }
    if (!filters.verification[resource.verification]) {
      return false;
    }
    if (resource.powerKw < filters.minPowerKw) {
      return false;
    }
    if (distanceKm(referencePoint, resource.coordinates) > filters.maxDistanceKm) {
      return false;
    }
    if (!includesSearch(resource, filters.search)) {
      return false;
    }
    if (selectedFuels.length > 0) {
      if (resource.type !== "generator" || !selectedFuels.includes(resource.fuel)) {
        return false;
      }
    }
    if (filters.transportableOnly) {
      if (resource.type !== "generator" || !resource.transportable) {
        return false;
      }
    }
    if (filters.solarOutageOnly) {
      if (resource.type !== "solar" || resource.outageCapable !== "yes") {
        return false;
      }
    }
    if (filters.solarWithBatteryOnly) {
      if (resource.type !== "solar" || !resource.hasBattery) {
        return false;
      }
    }
    return true;
  });
}

function statusRank(resource: EnergyResource) {
  return {
    available: 0,
    reserved: 1,
    unavailable: 2,
  }[resource.status];
}

function sortMatches(needPowerKw: number) {
  return (a: MatchedResource, b: MatchedResource) => {
    const sufficient = Number(b.sufficient) - Number(a.sufficient);
    if (sufficient !== 0) {
      return sufficient;
    }

    const distance = a.distanceKm - b.distanceKm;
    if (Math.abs(distance) > 0.01) {
      return distance;
    }

    const availability = statusRank(a.resource) - statusRank(b.resource);
    if (availability !== 0) {
      return availability;
    }

    const verification =
      Number(b.resource.verification === "verified") -
      Number(a.resource.verification === "verified");
    if (verification !== 0) {
      return verification;
    }

    return b.resource.powerKw - needPowerKw - (a.resource.powerKw - needPowerKw);
  };
}

function formatKpiPower(value: number) {
  return `${value.toLocaleString("nb-NO", { maximumFractionDigits: 1 })} kW`;
}

export default function DashboardPage() {
  const [searchParams] = useSearchParams();
  const [resources, setResources] = useState<EnergyResource[]>(() => [
    ...mockResources,
    ...loadLocalResources(),
  ]);
  const [filters, setFilters] = useState<ResourceFilters>(defaultFilters);
  const [crisisMode, setCrisisMode] = useState(false);
  const [selectedResourceId, setSelectedResourceId] = useState<string | undefined>();
  const [selectedNeedId, setSelectedNeedId] = useState<string | undefined>();

  const selectedResource = resources.find((resource) => resource.id === selectedResourceId);
  const selectedNeed = mockPowerNeeds.find((need) => need.id === selectedNeedId);
  const filterReferencePoint = selectedNeed?.coordinates ?? trondheimCenter;

  useEffect(() => {
    const requestedResource = searchParams.get("ressurs");
    if (requestedResource) {
      setSelectedResourceId(requestedResource);
      setSelectedNeedId(undefined);
    }
  }, [searchParams]);

  const filteredResources = useMemo(
    () => filterResources(resources, filters, filterReferencePoint),
    [filterReferencePoint, filters, resources],
  );

  const visibleResources = useMemo(() => {
    if (
      selectedResource &&
      !filteredResources.some((resource) => resource.id === selectedResource.id)
    ) {
      return [...filteredResources, selectedResource];
    }
    return filteredResources;
  }, [filteredResources, selectedResource]);

  const matchingResources = useMemo<MatchedResource[]>(() => {
    if (!selectedNeed) {
      return [];
    }

    return resources
      .map((resource) => ({
        resource,
        distanceKm: distanceKm(selectedNeed.coordinates, resource.coordinates),
        sufficient: resource.powerKw >= selectedNeed.requiredPowerKw,
      }))
      .filter(({ distanceKm: distance }) => distance <= 5)
      .sort(sortMatches(selectedNeed.requiredPowerKw));
  }, [resources, selectedNeed]);

  const localResources = resources.slice(mockResources.length);
  const registeredCount = 32 + localResources.length;
  const localAvailablePower = localResources
    .filter((resource) => resource.status === "available")
    .reduce((sum, resource) => sum + resource.powerKw, 0);

  function toggleCrisisMode(active: boolean) {
    setCrisisMode(active);
    setFilters((current) => ({
      ...current,
      statuses: active ? crisisStatuses : defaultFilters.statuses,
    }));
  }

  function handleResourceSelect(resource: EnergyResource, keepNeedContext = false) {
    setSelectedResourceId(resource.id);
    if (!keepNeedContext) {
      setSelectedNeedId(undefined);
    }
  }

  function handleNeedSelect(needId: string) {
    setSelectedNeedId(needId);
    setSelectedResourceId(undefined);
  }

  function reserveResource(resourceToReserve: EnergyResource) {
    setResources((current) =>
      current.map((resource) =>
        resource.id === resourceToReserve.id ? { ...resource, status: "reserved" } : resource,
      ),
    );

    const localResourceIds = new Set(loadLocalResources().map((resource) => resource.id));
    if (localResourceIds.has(resourceToReserve.id)) {
      replaceLocalResources(
        loadLocalResources().map((resource) =>
          resource.id === resourceToReserve.id ? { ...resource, status: "reserved" } : resource,
        ),
      );
    }
  }

  return (
    <div className={crisisMode ? "bg-orange-50/50" : "bg-slate-50"}>
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-[1540px] px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="text-sm font-bold uppercase text-preparedness-green">
                Myndighetsportal
              </p>
              <h1 className="mt-2 text-3xl font-bold tracking-normal text-navy-950">
                Beredskapsoversikt - Trondheim
              </h1>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Oversikt over frivillig registrerte energikilder og aktive strømbehov.
              </p>
            </div>
            <div className="inline-flex w-fit rounded-md bg-slate-100 p-1">
              <button
                type="button"
                onClick={() => toggleCrisisMode(false)}
                className={`rounded px-4 py-2 text-sm font-bold transition ${
                  !crisisMode ? "bg-white text-navy-950 shadow-sm" : "text-slate-600"
                }`}
              >
                Normalvisning
              </button>
              <button
                type="button"
                onClick={() => toggleCrisisMode(true)}
                className={`rounded px-4 py-2 text-sm font-bold transition ${
                  crisisMode ? "bg-red-700 text-white shadow-sm" : "text-slate-600"
                }`}
              >
                Krisemodus
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1540px] px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <KpiCard
            label="Registrerte ressurser"
            value={registeredCount.toString()}
            icon={MapPinned}
            tone="blue"
          />
          <KpiCard
            label="Tilgjengelig effekt"
            value={formatKpiPower(186 + localAvailablePower)}
            icon={Gauge}
            tone="green"
          />
          <KpiCard label="Verifiserte" value="21" icon={CheckCircle2} tone="amber" />
          <KpiCard
            label="Aktive strømbehov"
            value={mockPowerNeeds.length.toString()}
            icon={Activity}
            tone="red"
          />
        </div>

        {crisisMode && (
          <div className="mt-5 rounded-lg border border-orange-200 bg-orange-50 p-4 text-orange-950">
            <div className="flex gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-700" aria-hidden="true" />
              <div>
                <p className="font-bold">
                  KRISEMODUS AKTIVERT - Omfattende strømbrudd i Trondheim
                </p>
                <p className="mt-1 text-sm leading-6">
                  Kommunalt strømnett ustabilt. Prioriter lokale energiressurser
                  til kritiske samfunnsfunksjoner.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="mt-5 grid gap-4 xl:grid-cols-[300px_minmax(0,1fr)_390px]">
          <FilterPanel filters={filters} onChange={setFilters} />

          <section>
            <div className="mb-3 flex flex-col justify-between gap-3 rounded-lg border border-slate-200 bg-white p-3 shadow-sm sm:flex-row sm:items-center">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <BatteryCharging className="h-4 w-4 text-preparedness-green" aria-hidden="true" />
                <span>{visibleResources.length} ressurser vises i kartet</span>
              </div>
              <div className="flex flex-wrap gap-2 text-xs font-semibold">
                <span className="rounded bg-navy-50 px-2 py-1 text-navy-800">G Aggregat</span>
                <span className="rounded bg-amber-50 px-2 py-1 text-amber-800">S Solenergi</span>
                <span className="rounded bg-emerald-50 px-2 py-1 text-emerald-800">
                  B Batteri
                </span>
                <span className="rounded bg-red-50 px-2 py-1 text-red-800">! Strømbehov</span>
              </div>
            </div>
            <PreparednessMap
              resources={visibleResources}
              needs={mockPowerNeeds}
              selectedResource={selectedResource}
              selectedNeed={selectedNeed}
              crisisMode={crisisMode}
              onResourceSelect={handleResourceSelect}
              onNeedSelect={(need) => handleNeedSelect(need.id)}
            />
          </section>

          <DetailsPanel
            selectedResource={selectedResource}
            selectedNeed={selectedNeed}
            matchingResources={matchingResources}
            onResourceSelect={handleResourceSelect}
            onReserve={reserveResource}
          />
        </div>
      </section>
    </div>
  );
}
