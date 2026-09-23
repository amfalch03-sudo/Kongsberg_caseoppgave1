import {
  BatteryCharging,
  CheckCircle2,
  LocateFixed,
  Save,
  Sparkles,
  Sun,
  Zap,
} from "lucide-react";
import { FormEvent, InputHTMLAttributes, SelectHTMLAttributes, useState } from "react";
import { useNavigate } from "react-router-dom";
import { trondheimCenter } from "../data/mockData";
import type {
  BatteryResource,
  Coordinates,
  EnergyResource,
  GeneratorResource,
  ResourceType,
  SolarResource,
  Voltage,
} from "../types/resources";
import { saveLocalResource } from "../utils/localStorage";

type FormState = {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  address: string;
  postalCode: string;
  city: string;
  authoritySharingAllowed: boolean;
  consent: boolean;
  generatorModel: string;
  generatorPowerKw: string;
  generatorKva: string;
  generatorVoltage: Voltage;
  generatorPhase: "1-fase" | "3-fase";
  generatorFuel: GeneratorResource["fuel"];
  generatorTransportable: boolean;
  generatorRuntimeHours: string;
  generatorFuelAvailable: string;
  generatorConnection: string;
  generatorLastService: string;
  generatorComment: string;
  solarInstalledKwp: string;
  solarInverterKw: string;
  solarHasBattery: boolean;
  solarBatteryKwh: string;
  solarOutageCapable: SolarResource["outageCapable"];
  solarBackupKw: string;
  solarInverterType: string;
  solarComment: string;
  batteryCapacityKwh: string;
  batteryMaxKw: string;
  batteryVoltage: Voltage;
  batteryInstallation: BatteryResource["installation"];
  batteryCanChargeFromSolar: boolean;
  batteryConnection: string;
  batteryComment: string;
};

const initialForm: FormState = {
  firstName: "",
  lastName: "",
  phone: "",
  email: "",
  address: "",
  postalCode: "",
  city: "Trondheim",
  authoritySharingAllowed: true,
  consent: false,
  generatorModel: "",
  generatorPowerKw: "",
  generatorKva: "",
  generatorVoltage: "230 V",
  generatorPhase: "1-fase",
  generatorFuel: "diesel",
  generatorTransportable: true,
  generatorRuntimeHours: "",
  generatorFuelAvailable: "",
  generatorConnection: "",
  generatorLastService: "",
  generatorComment: "",
  solarInstalledKwp: "",
  solarInverterKw: "",
  solarHasBattery: false,
  solarBatteryKwh: "",
  solarOutageCapable: "unknown",
  solarBackupKw: "",
  solarInverterType: "",
  solarComment: "",
  batteryCapacityKwh: "",
  batteryMaxKw: "",
  batteryVoltage: "230 V",
  batteryInstallation: "transportabel",
  batteryCanChargeFromSolar: true,
  batteryConnection: "",
  batteryComment: "",
};

const typeCards = [
  {
    type: "generator" as const,
    title: "Strømaggregat",
    text: "Diesel, bensin, gass eller annen lokal generator.",
    icon: Zap,
  },
  {
    type: "solar" as const,
    title: "Solcelleanlegg",
    text: "Anlegg med mulig backup- eller øydriftsfunksjon.",
    icon: Sun,
  },
  {
    type: "battery" as const,
    title: "Batteri",
    text: "Fastmontert eller transportabel energilagring.",
    icon: BatteryCharging,
  },
];

const knownCoordinates: Record<string, Coordinates> = {
  "høgskoleringen 1": { lat: 63.4197, lng: 10.4023 },
  "elgeseter gate 10": { lat: 63.4236, lng: 10.3955 },
  "innherredsveien 7": { lat: 63.4347, lng: 10.4102 },
  "munkegata 1": { lat: 63.4306, lng: 10.395 },
  "prinsens gate 1": { lat: 63.4295, lng: 10.3938 },
  "kongens gate 30": { lat: 63.4303, lng: 10.3914 },
  "klostergata 46": { lat: 63.425, lng: 10.3867 },
  "lade allé 40": { lat: 63.4433, lng: 10.448 },
  "lade alle 40": { lat: 63.4433, lng: 10.448 },
  "byåsveien 120": { lat: 63.4079, lng: 10.3505 },
  "ranheimsvegen 165": { lat: 63.4309, lng: 10.512 },
  "brøsetvegen 145": { lat: 63.4145, lng: 10.4542 },
  "haakon vii's gate 9": { lat: 63.4445, lng: 10.4485 },
};

function toNumber(value: string, fallback = 0) {
  const parsed = Number(value.replace(",", "."));
  return Number.isFinite(parsed) ? parsed : fallback;
}

function withUnit(value: string, unit: string) {
  const trimmed = value.trim();
  if (!trimmed) {
    return "";
  }
  return trimmed.toLowerCase().includes(unit.toLowerCase()) ? trimmed : `${trimmed} ${unit}`;
}

function createId(type: ResourceType) {
  const prefix = { generator: "G", solar: "S", battery: "B" }[type];
  return `KB-${prefix}-${Date.now().toString().slice(-6)}`;
}

function resolveCoordinates(address: string, provided?: Coordinates | null) {
  if (provided) {
    return provided;
  }

  const normalized = address.trim().toLowerCase();
  const directHit = knownCoordinates[normalized];
  if (directHit) {
    return directHit;
  }

  const seed = [...normalized].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const latOffset = ((seed % 17) - 8) / 1000;
  const lngOffset = (((seed * 7) % 21) - 10) / 1000;
  return {
    lat: trondheimCenter.lat + latOffset,
    lng: trondheimCenter.lng + lngOffset,
  };
}

function Field({
  label,
  className = "",
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className={`block ${className}`}>
      <span className="text-sm font-semibold text-navy-950">{label}</span>
      <input
        {...props}
        className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-preparedness-green focus:ring-2 focus:ring-emerald-100"
      />
    </label>
  );
}

function UnitField({
  label,
  unit,
  className = "",
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label: string; unit: string }) {
  return (
    <label className={`block ${className}`}>
      <span className="text-sm font-semibold text-navy-950">{label}</span>
      <span className="relative mt-2 block">
        <input
          {...props}
          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 pr-16 text-sm outline-none transition placeholder:text-slate-400 focus:border-preparedness-green focus:ring-2 focus:ring-emerald-100"
        />
        <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm font-semibold text-slate-500">
          {unit}
        </span>
      </span>
    </label>
  );
}

function SelectField({
  label,
  className = "",
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & { label: string }) {
  return (
    <label className={`block ${className}`}>
      <span className="text-sm font-semibold text-navy-950">{label}</span>
      <select
        {...props}
        className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-preparedness-green focus:ring-2 focus:ring-emerald-100"
      >
        {children}
      </select>
    </label>
  );
}

function VoltageSegment({
  label,
  value,
  onChange,
  className = "",
}: {
  label: string;
  value: Voltage;
  onChange: (value: Voltage) => void;
  className?: string;
}) {
  return (
    <div className={className}>
      <span className="text-sm font-semibold text-navy-950">{label}</span>
      <div className="mt-2 grid grid-cols-2 gap-2">
        {(["230 V", "400 V"] as Voltage[]).map((option) => {
          const selected = value === option;
          return (
            <button
              key={option}
              type="button"
              onClick={() => onChange(option)}
              className={`rounded-md border px-3 py-2.5 text-sm font-bold transition ${
                selected
                  ? "border-preparedness-green bg-emerald-50 text-emerald-800 ring-2 ring-emerald-100"
                  : "border-slate-300 bg-white text-navy-900 hover:bg-slate-50"
              }`}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function CheckboxField({
  label,
  checked,
  onChange,
  required,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  required?: boolean;
}) {
  return (
    <label className="flex gap-3 rounded-md border border-slate-200 bg-white p-3 text-sm font-medium text-slate-700">
      <input
        type="checkbox"
        checked={checked}
        required={required}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-0.5 h-4 w-4 rounded border-slate-300 text-preparedness-green focus:ring-preparedness-green"
      />
      <span>{label}</span>
    </label>
  );
}

export default function RegisterPage() {
  const navigate = useNavigate();
  const [resourceType, setResourceType] = useState<ResourceType>("generator");
  const [form, setForm] = useState<FormState>(initialForm);
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const [locationMessage, setLocationMessage] = useState("");

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function useCurrentPosition() {
    if (!navigator.geolocation) {
      setLocationMessage("Posisjon er ikke tilgjengelig i denne nettleseren.");
      return;
    }

    setLocationMessage("Henter posisjon...");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoordinates({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setLocationMessage("Posisjon lagret for registreringen.");
      },
      () => setLocationMessage("Kunne ikke hente posisjon."),
      { enableHighAccuracy: true, timeout: 8000 },
    );
  }

  function fillDemo() {
    setResourceType("generator");
    setForm({
      ...initialForm,
      firstName: "Demo",
      lastName: "Aggregatseier",
      phone: "900 00 099",
      email: "aggregat.demo@example.no",
      address: "Høgskoleringen 1",
      postalCode: "7034",
      city: "Trondheim",
      consent: true,
      generatorModel: "Honda EU70is",
      generatorPowerKw: "5,5",
      generatorKva: "7",
      generatorVoltage: "230 V",
      generatorPhase: "1-fase",
      generatorFuel: "bensin",
      generatorTransportable: true,
      generatorRuntimeHours: "6",
      generatorFuelAvailable: "25",
      generatorConnection: "Schuko / CEE 16A",
      generatorLastService: "2026-09-12",
      generatorComment: "Kan hentes med varebil ved avtale.",
    });
    setCoordinates(null);
    setLocationMessage("");
  }

  function buildResource(): EnergyResource {
    const id = createId(resourceType);
    const addressCoordinates = resolveCoordinates(form.address, coordinates);
    const owner = {
      firstName: form.firstName,
      lastName: form.lastName,
      phone: form.phone,
      email: form.email,
    };

    const common = {
      id,
      address: form.address,
      postalCode: form.postalCode,
      city: form.city,
      coordinates: addressCoordinates,
      owner,
      status: "available" as const,
      verification: "unverified" as const,
    };

    if (resourceType === "generator") {
      return {
        ...common,
        type: "generator",
        name: "Strømaggregat",
        description: form.generatorModel || "Registrert aggregat",
        manufacturerModel: form.generatorModel,
        powerKw: toNumber(form.generatorPowerKw),
        kVa: form.generatorKva ? toNumber(form.generatorKva) : undefined,
        voltage: form.generatorVoltage,
        phase: form.generatorPhase,
        fuel: form.generatorFuel,
        transportable: form.generatorTransportable,
        runtimeHours: toNumber(form.generatorRuntimeHours),
        fuelAvailable: withUnit(form.generatorFuelAvailable, "liter"),
        connectionType: form.generatorConnection,
        lastService: form.generatorLastService,
        comment: form.generatorComment,
      };
    }

    if (resourceType === "solar") {
      const outageCapable = form.solarOutageCapable === "yes";
      return {
        ...common,
        type: "solar",
        name: "Solcelleanlegg",
        description: `${form.solarInstalledKwp || "0"} kWp registrert anlegg`,
        powerKw: outageCapable ? toNumber(form.solarBackupKw) : 0,
        voltage: "230 V",
        installedCapacityKwp: toNumber(form.solarInstalledKwp),
        inverterPowerKw: toNumber(form.solarInverterKw),
        hasBattery: form.solarHasBattery,
        batteryCapacityKwh: form.solarHasBattery
          ? toNumber(form.solarBatteryKwh)
          : undefined,
        outageCapable: form.solarOutageCapable,
        backupPowerKw: outageCapable ? toNumber(form.solarBackupKw) : undefined,
        inverterType: form.solarInverterType,
        comment: form.solarComment,
      };
    }

    return {
      ...common,
      type: "battery",
      name: "Batterisystem",
      description: `${form.batteryCapacityKwh || "0"} kWh batteri`,
      powerKw: toNumber(form.batteryMaxKw),
      voltage: form.batteryVoltage,
      capacityKwh: toNumber(form.batteryCapacityKwh),
      maxPowerKw: toNumber(form.batteryMaxKw),
      installation: form.batteryInstallation,
      canChargeFromSolar: form.batteryCanChargeFromSolar,
      connectionType: form.batteryConnection,
      comment: form.batteryComment,
    };
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const resource = buildResource();
    saveLocalResource(resource);
    navigate(`/registrert/${resource.id}`);
  }

  return (
    <div className="bg-slate-50">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <p className="text-sm font-bold uppercase text-preparedness-green">
                Registrer ressurs
              </p>
              <h1 className="mt-3 text-3xl font-bold tracking-normal text-navy-950">
                Gjør en lokal energikilde synlig for beredskap.
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
                Registreringen lagres lokalt i denne demoen og vises umiddelbart
                i beredskapskartet som ikke verifisert.
              </p>
            </div>
            <button
              type="button"
              onClick={fillDemo}
              className="inline-flex w-fit items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-bold text-emerald-800 transition hover:bg-emerald-100"
            >
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              Fyll eksempel
            </button>
          </div>
        </div>
      </section>

      <form onSubmit={handleSubmit} className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-navy-950">Hva ønsker du å registrere?</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {typeCards.map(({ type, title, text, icon: Icon }) => {
              const selected = resourceType === type;
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => setResourceType(type)}
                  className={`rounded-lg border p-5 text-left transition ${
                    selected
                      ? "border-preparedness-green bg-emerald-50 ring-2 ring-emerald-100"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <span
                    className={`flex h-11 w-11 items-center justify-center rounded ${
                      selected ? "bg-preparedness-green text-white" : "bg-slate-100 text-navy-800"
                    }`}
                  >
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span className="mt-5 block text-base font-bold text-navy-950">
                    {title}
                  </span>
                  <span className="mt-2 block text-sm leading-6 text-slate-600">{text}</span>
                </button>
              );
            })}
          </div>
        </section>

        <div className="mt-6 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <section className="space-y-6 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div>
              <h2 className="text-lg font-bold text-navy-950">Eier</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <Field
                  label="Fornavn"
                  required
                  value={form.firstName}
                  onChange={(event) => update("firstName", event.target.value)}
                />
                <Field
                  label="Etternavn"
                  required
                  value={form.lastName}
                  onChange={(event) => update("lastName", event.target.value)}
                />
                <Field
                  label="Telefon"
                  required
                  value={form.phone}
                  onChange={(event) => update("phone", event.target.value)}
                />
                <Field
                  label="E-post"
                  type="email"
                  required
                  value={form.email}
                  onChange={(event) => update("email", event.target.value)}
                />
              </div>
            </div>

            <div>
              <h2 className="text-lg font-bold text-navy-950">Lokasjon</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <Field
                  label="Adresse"
                  required
                  className="sm:col-span-2"
                  value={form.address}
                  onChange={(event) => update("address", event.target.value)}
                />
                <Field
                  label="Postnummer"
                  required
                  value={form.postalCode}
                  onChange={(event) => update("postalCode", event.target.value)}
                />
                <Field
                  label="Sted"
                  required
                  value={form.city}
                  onChange={(event) => update("city", event.target.value)}
                />
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={useCurrentPosition}
                  className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-navy-900 transition hover:bg-slate-50"
                >
                  <LocateFixed className="h-4 w-4" aria-hidden="true" />
                  Bruk min posisjon
                </button>
                {locationMessage && (
                  <span className="text-sm font-medium text-slate-600">{locationMessage}</span>
                )}
              </div>
            </div>

            <div>
              <h2 className="text-lg font-bold text-navy-950">Tilgjengelighet</h2>
              <div className="mt-4 space-y-3">
                <CheckboxField
                  label="Tillat at informasjonen deles med godkjente beredskapsmyndigheter"
                  checked={form.authoritySharingAllowed}
                  onChange={(value) => update("authoritySharingAllowed", value)}
                />
                <CheckboxField
                  label="Jeg samtykker til at myndighetene kan kontakte meg dersom ressursen kan være relevant under en alvorlig hendelse."
                  checked={form.consent}
                  required
                  onChange={(value) => update("consent", value)}
                />
              </div>
            </div>
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            {resourceType === "generator" && (
              <div>
                <h2 className="text-lg font-bold text-navy-950">Aggregat</h2>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <Field
                    label="Produsent/modell"
                    required
                    className="sm:col-span-2"
                    value={form.generatorModel}
                    onChange={(event) => update("generatorModel", event.target.value)}
                  />
                  <SelectField
                    label="Transportabelt"
                    value={form.generatorTransportable ? "ja" : "nei"}
                    onChange={(event) =>
                      update("generatorTransportable", event.target.value === "ja")
                    }
                  >
                    <option value="ja">Ja</option>
                    <option value="nei">Nei</option>
                  </SelectField>
                  <Field
                    label="Nominell effekt i kW"
                    required
                    inputMode="decimal"
                    value={form.generatorPowerKw}
                    onChange={(event) => update("generatorPowerKw", event.target.value)}
                  />
                  <Field
                    label="Effekt i kVA, valgfritt"
                    inputMode="decimal"
                    value={form.generatorKva}
                    onChange={(event) => update("generatorKva", event.target.value)}
                  />
                  <VoltageSegment
                    label="Spenning"
                    value={form.generatorVoltage}
                    onChange={(value) => update("generatorVoltage", value)}
                  />
                  <SelectField
                    label="Fase"
                    value={form.generatorPhase}
                    onChange={(event) =>
                      update("generatorPhase", event.target.value as "1-fase" | "3-fase")
                    }
                  >
                    <option>1-fase</option>
                    <option>3-fase</option>
                  </SelectField>
                  <SelectField
                    label="Drivstoff"
                    value={form.generatorFuel}
                    onChange={(event) =>
                      update("generatorFuel", event.target.value as GeneratorResource["fuel"])
                    }
                  >
                    <option value="bensin">Bensin</option>
                    <option value="diesel">Diesel</option>
                    <option value="gass">Gass</option>
                    <option value="annet">Annet</option>
                  </SelectField>
                  <UnitField
                    label="Estimert driftstid på full tank"
                    required
                    inputMode="decimal"
                    unit="timer"
                    value={form.generatorRuntimeHours}
                    onChange={(event) => update("generatorRuntimeHours", event.target.value)}
                  />
                  <UnitField
                    label="Kapasitet på tank i liter"
                    required
                    inputMode="decimal"
                    unit="liter"
                    value={form.generatorFuelAvailable}
                    onChange={(event) => update("generatorFuelAvailable", event.target.value)}
                  />
                  <Field
                    label="Tilkoblingstype"
                    required
                    value={form.generatorConnection}
                    onChange={(event) => update("generatorConnection", event.target.value)}
                  />
                  <Field
                    label="Sist service"
                    type="date"
                    required
                    value={form.generatorLastService}
                    onChange={(event) => update("generatorLastService", event.target.value)}
                  />
                  <Field
                    label="Kommentar"
                    className="sm:col-span-2"
                    value={form.generatorComment}
                    onChange={(event) => update("generatorComment", event.target.value)}
                  />
                </div>
              </div>
            )}

            {resourceType === "solar" && (
              <div>
                <h2 className="text-lg font-bold text-navy-950">Solcelleanlegg</h2>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <Field
                    label="Installert kapasitet, kWp"
                    required
                    inputMode="decimal"
                    value={form.solarInstalledKwp}
                    onChange={(event) => update("solarInstalledKwp", event.target.value)}
                  />
                  <Field
                    label="Invertereffekt, kW"
                    required
                    inputMode="decimal"
                    value={form.solarInverterKw}
                    onChange={(event) => update("solarInverterKw", event.target.value)}
                  />
                  <SelectField
                    label="Har batteri"
                    value={form.solarHasBattery ? "ja" : "nei"}
                    onChange={(event) => update("solarHasBattery", event.target.value === "ja")}
                  >
                    <option value="ja">Ja</option>
                    <option value="nei">Nei</option>
                  </SelectField>
                  {form.solarHasBattery && (
                    <Field
                      label="Batterikapasitet, kWh"
                      inputMode="decimal"
                      value={form.solarBatteryKwh}
                      onChange={(event) => update("solarBatteryKwh", event.target.value)}
                    />
                  )}
                  <SelectField
                    label="Kan anlegget levere strøm når strømnettet er nede?"
                    className="sm:col-span-2"
                    value={form.solarOutageCapable}
                    onChange={(event) =>
                      update("solarOutageCapable", event.target.value as SolarResource["outageCapable"])
                    }
                  >
                    <option value="yes">Ja, anlegget støtter øydrift / backup</option>
                    <option value="no">Nei</option>
                    <option value="unknown">Usikker</option>
                  </SelectField>
                  <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950 sm:col-span-2">
                    De fleste vanlige nettilknyttede solcelleanlegg kobler seg
                    automatisk ut ved strømbrudd. Backup- eller øydriftsfunksjon
                    er derfor nødvendig for at anlegget skal kunne brukes lokalt.
                  </div>
                  <Field
                    label="Tilgjengelig backup-effekt"
                    inputMode="decimal"
                    value={form.solarBackupKw}
                    onChange={(event) => update("solarBackupKw", event.target.value)}
                  />
                  <Field
                    label="Type inverter"
                    required
                    value={form.solarInverterType}
                    onChange={(event) => update("solarInverterType", event.target.value)}
                  />
                  <Field
                    label="Kommentar"
                    className="sm:col-span-2"
                    value={form.solarComment}
                    onChange={(event) => update("solarComment", event.target.value)}
                  />
                </div>
              </div>
            )}

            {resourceType === "battery" && (
              <div>
                <h2 className="text-lg font-bold text-navy-950">Batteri</h2>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <Field
                    label="Batterikapasitet i kWh"
                    required
                    inputMode="decimal"
                    value={form.batteryCapacityKwh}
                    onChange={(event) => update("batteryCapacityKwh", event.target.value)}
                  />
                  <Field
                    label="Maksimal effekt i kW"
                    required
                    inputMode="decimal"
                    value={form.batteryMaxKw}
                    onChange={(event) => update("batteryMaxKw", event.target.value)}
                  />
                  <VoltageSegment
                    label="Spenning"
                    value={form.batteryVoltage}
                    onChange={(value) => update("batteryVoltage", value)}
                  />
                  <SelectField
                    label="Installasjon"
                    value={form.batteryInstallation}
                    onChange={(event) =>
                      update(
                        "batteryInstallation",
                        event.target.value as BatteryResource["installation"],
                      )
                    }
                  >
                    <option>fast installasjon</option>
                    <option>transportabel</option>
                  </SelectField>
                  <SelectField
                    label="Kan lades fra solceller"
                    value={form.batteryCanChargeFromSolar ? "ja" : "nei"}
                    onChange={(event) =>
                      update("batteryCanChargeFromSolar", event.target.value === "ja")
                    }
                  >
                    <option value="ja">Ja</option>
                    <option value="nei">Nei</option>
                  </SelectField>
                  <Field
                    label="Tilkoblingstype"
                    required
                    value={form.batteryConnection}
                    onChange={(event) => update("batteryConnection", event.target.value)}
                  />
                  <Field
                    label="Kommentar"
                    className="sm:col-span-2"
                    value={form.batteryComment}
                    onChange={(event) => update("batteryComment", event.target.value)}
                  />
                </div>
              </div>
            )}

            <div className="mt-8 flex justify-end border-t border-slate-200 pt-5">
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-md bg-navy-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-navy-800"
              >
                <Save className="h-4 w-4" aria-hidden="true" />
                Send registrering
              </button>
            </div>
          </section>
        </div>
      </form>

      <div className="mx-auto flex max-w-7xl items-center gap-2 px-4 pb-10 text-sm text-slate-500 sm:px-6 lg:px-8">
        <CheckCircle2 className="h-4 w-4 text-preparedness-green" aria-hidden="true" />
        Nye ressurser lagres bare i nettleseren for denne demoen.
      </div>
    </div>
  );
}
