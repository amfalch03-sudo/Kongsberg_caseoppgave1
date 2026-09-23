export type ResourceType = "generator" | "solar" | "battery";

export type ResourceStatus = "available" | "unavailable" | "reserved";

export type VerificationStatus = "verified" | "unverified";

export type Voltage = "230 V" | "400 V";

export type Coordinates = {
  lat: number;
  lng: number;
};

export interface Owner {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  organization?: string;
}

interface BaseEnergyResource {
  id: string;
  type: ResourceType;
  name: string;
  description: string;
  address: string;
  postalCode: string;
  city: string;
  coordinates: Coordinates;
  powerKw: number;
  voltage: Voltage;
  owner: Owner;
  status: ResourceStatus;
  verification: VerificationStatus;
  lastVerified?: string;
  comment?: string;
}

export interface GeneratorResource extends BaseEnergyResource {
  type: "generator";
  manufacturerModel: string;
  kVa?: number;
  phase: "1-fase" | "3-fase";
  fuel: "diesel" | "bensin" | "gass" | "annet";
  transportable: boolean;
  runtimeHours: number;
  fuelAvailable: string;
  connectionType: string;
  lastService: string;
}

export interface SolarResource extends BaseEnergyResource {
  type: "solar";
  installedCapacityKwp: number;
  inverterPowerKw: number;
  hasBattery: boolean;
  batteryCapacityKwh?: number;
  outageCapable: "yes" | "no" | "unknown";
  backupPowerKw?: number;
  inverterType: string;
}

export interface BatteryResource extends BaseEnergyResource {
  type: "battery";
  capacityKwh: number;
  maxPowerKw: number;
  installation: "fast installasjon" | "transportabel";
  canChargeFromSolar: boolean;
  connectionType: string;
}

export type EnergyResource = GeneratorResource | SolarResource | BatteryResource;

export interface PowerNeed {
  id: string;
  title: string;
  priority: "Høy" | "Middels" | "Lav";
  requiredPowerKw: number;
  voltage: Voltage;
  durationHours: number;
  purposes: string[];
  address: string;
  postalCode: string;
  city: string;
  coordinates: Coordinates;
  description: string;
}

export type ResourceFilters = {
  search: string;
  types: Record<ResourceType, boolean>;
  statuses: Record<ResourceStatus, boolean>;
  verification: Record<VerificationStatus, boolean>;
  minPowerKw: number;
  maxDistanceKm: number;
  fuels: Record<GeneratorResource["fuel"], boolean>;
  transportableOnly: boolean;
  solarOutageOnly: boolean;
  solarWithBatteryOnly: boolean;
};
