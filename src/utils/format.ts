import type {
  EnergyResource,
  ResourceStatus,
  ResourceType,
  VerificationStatus,
} from "../types/resources";

export function resourceTypeLabel(type: ResourceType) {
  return {
    generator: "Aggregat",
    solar: "Solenergi",
    battery: "Batteri",
  }[type];
}

export function resourceStatusLabel(status: ResourceStatus) {
  return {
    available: "Tilgjengelig",
    unavailable: "Utilgjengelig",
    reserved: "Reservert",
  }[status];
}

export function verificationLabel(status: VerificationStatus) {
  return status === "verified" ? "Verifisert" : "Ikke verifisert";
}

export function ownerName(resource: EnergyResource) {
  return `${resource.owner.firstName} ${resource.owner.lastName}`;
}

export function formatKw(value: number) {
  return `${value.toLocaleString("nb-NO", { maximumFractionDigits: 1 })} kW`;
}

export function formatKwh(value: number) {
  return `${value.toLocaleString("nb-NO", { maximumFractionDigits: 1 })} kWh`;
}
