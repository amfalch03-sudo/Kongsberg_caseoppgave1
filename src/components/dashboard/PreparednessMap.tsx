import L from "leaflet";
import { useEffect } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import type { EnergyResource, PowerNeed } from "../../types/resources";
import { formatKw, resourceStatusLabel, resourceTypeLabel } from "../../utils/format";

type PreparednessMapProps = {
  resources: EnergyResource[];
  needs: PowerNeed[];
  selectedResource?: EnergyResource;
  selectedNeed?: PowerNeed;
  crisisMode: boolean;
  onResourceSelect: (resource: EnergyResource) => void;
  onNeedSelect: (need: PowerNeed) => void;
};

const resourceMarkerLabel = {
  generator: "G",
  solar: "S",
  battery: "B",
};

function createResourceIcon(resource: EnergyResource, selected: boolean, crisisMode: boolean) {
  const classNames = [
    "kb-marker",
    "kb-marker-resource",
    `kb-marker-${resource.type}`,
    `kb-marker-${resource.status}`,
    selected ? "kb-marker-selected" : "",
    crisisMode ? "kb-marker-crisis" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return L.divIcon({
    className: "kb-marker-shell",
    html: `<div class="${classNames}">${resourceMarkerLabel[resource.type]}</div>`,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    popupAnchor: [0, -18],
  });
}

function createNeedIcon(selected: boolean, crisisMode: boolean) {
  const classNames = [
    "kb-marker",
    "kb-marker-need",
    selected ? "kb-marker-selected" : "",
    crisisMode ? "kb-marker-need-crisis" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return L.divIcon({
    className: "kb-marker-shell",
    html: `<div class="${classNames}">!</div>`,
    iconSize: [crisisMode ? 42 : 36, crisisMode ? 42 : 36],
    iconAnchor: [crisisMode ? 21 : 18, crisisMode ? 21 : 18],
    popupAnchor: [0, -20],
  });
}

function MapFocus({
  selectedResource,
  selectedNeed,
}: {
  selectedResource?: EnergyResource;
  selectedNeed?: PowerNeed;
}) {
  const map = useMap();

  useEffect(() => {
    const target = selectedResource?.coordinates ?? selectedNeed?.coordinates;
    if (target) {
      map.flyTo([target.lat, target.lng], 14, { duration: 0.8 });
    }
  }, [map, selectedNeed?.id, selectedResource?.id]);

  return null;
}

export default function PreparednessMap({
  resources,
  needs,
  selectedResource,
  selectedNeed,
  crisisMode,
  onResourceSelect,
  onNeedSelect,
}: PreparednessMapProps) {
  return (
    <div className={`map-frame ${crisisMode ? "map-frame-crisis" : ""}`}>
      <MapContainer
        center={[63.4305, 10.3951]}
        zoom={12}
        minZoom={10}
        scrollWheelZoom
        className="h-full min-h-[620px] w-full rounded-lg"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapFocus selectedResource={selectedResource} selectedNeed={selectedNeed} />

        {resources.map((resource) => (
          <Marker
            key={resource.id}
            position={[resource.coordinates.lat, resource.coordinates.lng]}
            icon={createResourceIcon(resource, selectedResource?.id === resource.id, crisisMode)}
            eventHandlers={{
              click: () => onResourceSelect(resource),
            }}
          >
            <Popup>
              <div className="min-w-52">
                <p className="text-xs font-bold uppercase text-slate-500">
                  {resourceTypeLabel(resource.type)}
                </p>
                <p className="mt-1 text-sm font-bold text-navy-950">{resource.description}</p>
                <p className="mt-2 text-sm text-slate-600">
                  {formatKw(resource.powerKw)} · {resourceStatusLabel(resource.status)}
                </p>
                <button
                  type="button"
                  onClick={() => onResourceSelect(resource)}
                  className="mt-3 rounded bg-navy-900 px-3 py-1.5 text-xs font-bold text-white"
                >
                  Åpne detaljer
                </button>
              </div>
            </Popup>
          </Marker>
        ))}

        {needs.map((need) => (
          <Marker
            key={need.id}
            position={[need.coordinates.lat, need.coordinates.lng]}
            icon={createNeedIcon(selectedNeed?.id === need.id, crisisMode)}
            eventHandlers={{
              click: () => onNeedSelect(need),
            }}
          >
            <Popup>
              <div className="min-w-56">
                <p className="text-xs font-bold uppercase text-red-700">Strømbehov</p>
                <p className="mt-1 text-sm font-bold text-navy-950">{need.title}</p>
                <p className="mt-2 text-sm text-slate-600">
                  {formatKw(need.requiredPowerKw)} · {need.durationHours} timer
                </p>
                <button
                  type="button"
                  onClick={() => onNeedSelect(need)}
                  className="mt-3 rounded bg-red-700 px-3 py-1.5 text-xs font-bold text-white"
                >
                  Se matchende ressurser
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
