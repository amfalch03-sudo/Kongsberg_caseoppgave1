import {
  BatteryCharging,
  ChevronDown,
  Droplets,
  Lightbulb,
  MapPinned,
  Monitor,
  PlaneTakeoff,
  Radio,
  Router,
  ShieldCheck,
  Snowflake,
  Sun,
  Zap,
} from "lucide-react";
import { Link } from "react-router-dom";

const flow = [
  "Strømbrudd",
  "Lokalt strømbehov",
  "Kraftberedskap finner tilgjengelige ressurser",
  "Eier kontaktes",
  "Energikilden mobiliseres",
];

const networkCards = [
  {
    title: "Aggregater",
    text: "Transportable energikilder som raskt kan flyttes dit behovet er størst.",
    icon: Zap,
  },
  {
    title: "Solenergi",
    text: "Eksisterende solcelleanlegg kan gi lokal strøm under langvarige strømbrudd.",
    icon: Sun,
  },
  {
    title: "Batterier",
    text: "Batterilagring kan sikre strøm til kommunikasjon, medisinsk utstyr og andre mindre kritiske funksjoner.",
    icon: BatteryCharging,
  },
];

const kilowattUses = [
  { text: "Lade telefoner og nødnett-radioer", icon: Radio },
  { text: "Drive nødlys", icon: Lightbulb },
  { text: "Holde medisinkjøleskap i gang", icon: Snowflake },
  { text: "Drive rutere og kommunikasjonsutstyr", icon: Router },
  { text: "Drive mindre vannpumper", icon: Droplets },
  { text: "Drive PC-er og lokale beredskapsstasjoner", icon: Monitor },
  { text: "Lade droner og annet beredskapsutstyr", icon: PlaneTakeoff },
];

const steps = [
  "Eier registrerer ressurs",
  "Ressursen kvalitetssikres",
  "Krise oppstår",
  "Myndighetene søker i kartet",
  "Eier kontaktes",
  "Ressurs mobiliseres",
];

export default function HomePage() {
  return (
    <div className="bg-white">
      <section className="relative overflow-hidden border-b border-slate-200 bg-navy-950 text-white">
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(4,26,44,0.96),rgba(4,26,44,0.86),rgba(4,26,44,0.74))]" />
        <div className="absolute right-0 top-0 h-full w-1/2 opacity-40">
          <div className="grid h-full grid-cols-6 gap-px">
            {Array.from({ length: 48 }).map((_, index) => (
              <div
                key={index}
                className="bg-white/10"
                style={{ opacity: index % 3 === 0 ? 0.55 : 0.2 }}
              />
            ))}
          </div>
        </div>
        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-20">
          <div className="flex flex-col justify-center">
            <div className="mb-6 inline-flex w-fit items-center gap-2 rounded border border-white/20 bg-white/10 px-3 py-2 text-sm font-semibold text-emerald-100">
              <ShieldCheck className="h-4 w-4" aria-hidden="true" />
              KONGSBERG Your Extreme 2026
            </div>
            <h1 className="max-w-3xl text-4xl font-bold leading-tight tracking-normal sm:text-5xl lg:text-6xl">
              Når strømnettet svikter, bruker vi ressursene som allerede finnes.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-200">
              Kraftberedskap gjør private aggregater, solcelleanlegg og batterier
              synlige og tilgjengelige for lokal beredskap når strømnettet faller ut.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/registrer"
                className="inline-flex items-center justify-center gap-2 rounded-md bg-preparedness-green px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-700"
              >
                <Zap className="h-4 w-4" aria-hidden="true" />
                Registrer energikilde
              </Link>
              <Link
                to="/kart"
                className="inline-flex items-center justify-center gap-2 rounded-md border border-white/25 bg-white/10 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/15"
              >
                <MapPinned className="h-4 w-4" aria-hidden="true" />
                Se beredskapskart
              </Link>
            </div>
          </div>

          <div className="min-h-[420px] rounded-lg border border-white/15 bg-white/10 p-4 shadow-2xl backdrop-blur">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <p className="text-sm font-semibold text-emerald-100">Operativ flyt</p>
                <p className="text-xs text-slate-300">Trondheim kommune</p>
              </div>
              <span className="rounded bg-emerald-400/15 px-2 py-1 text-xs font-bold text-emerald-100">
                DEMO
              </span>
            </div>
            <div className="mt-6 space-y-3">
              {flow.map((item, index) => (
                <div key={item}>
                  <div className="flex items-center gap-3 rounded-md border border-white/10 bg-white/10 p-4">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded bg-white text-navy-900">
                      {index + 1}
                    </span>
                    <span className="text-sm font-bold uppercase tracking-normal text-white">
                      {item}
                    </span>
                  </div>
                  {index < flow.length - 1 && (
                    <ChevronDown className="mx-auto mt-3 h-5 w-5 text-emerald-200" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div>
            <p className="text-sm font-bold uppercase text-preparedness-green">
              Et uutnyttet beredskapsnettverk
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-normal text-navy-950">
              Energiressurser finnes allerede i lokalsamfunnet.
            </h2>
            <p className="mt-4 text-base leading-7 text-slate-600">
              Tusenvis av aggregater, solcelleanlegg og batterier finnes hos
              privatpersoner og bedrifter. Utfordringen er at myndighetene i dag
              ikke nødvendigvis vet hvor de finnes, hvilken kapasitet de har, om
              de fungerer under strømbrudd eller hvem som kan kontaktes.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {networkCards.map(({ title, text, icon: Icon }) => (
              <article
                key={title}
                className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
              >
                <span className="mb-5 flex h-11 w-11 items-center justify-center rounded bg-emerald-50 text-preparedness-green">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <h3 className="text-base font-bold uppercase text-navy-950">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-col justify-between gap-3 md:flex-row md:items-end">
            <div>
              <p className="text-sm font-bold uppercase text-preparedness-green">
                Praktisk effekt
              </p>
              <h2 className="mt-3 text-3xl font-bold tracking-normal text-navy-950">
                Hva kan noen få kilowatt faktisk gjøre?
              </h2>
            </div>
            <p className="max-w-xl text-sm leading-6 text-slate-600">
              I en langvarig hendelse kan små energimengder gjøre stor forskjell
              for kommunikasjon, helse og lokal koordinering.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {kilowattUses.map(({ text, icon: Icon }) => (
              <article
                key={text}
                className="flex min-h-32 items-start gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-navy-50 text-navy-800">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <p className="text-sm font-semibold leading-6 text-navy-950">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-10 max-w-3xl">
          <p className="text-sm font-bold uppercase text-preparedness-green">
            Fra privat ressurs til samfunnsressurs
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-normal text-navy-950">
            En strukturert vei fra registrering til mobilisering.
          </h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
          {steps.map((step, index) => (
            <article key={step} className="rounded-lg border border-slate-200 bg-white p-5">
              <span className="flex h-9 w-9 items-center justify-center rounded bg-navy-900 text-sm font-bold text-white">
                {index + 1}
              </span>
              <p className="mt-5 text-sm font-bold leading-6 text-navy-950">{step}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-t border-slate-200 bg-navy-950 px-4 py-6 text-center text-sm text-slate-300 sm:px-6 lg:px-8">
        Kraftberedskap er et konsept utviklet av Magnus Bruvik-Oll, Adrian Falch,
        Vetle Sollie, Magnus Kalvenes og Kasper Engeseth. KI brukt til utforming
        av nettside, konsept og beskrivelser er utformet og skrevet av oss. Valgt
        oppgave: Oppgavealternativ 1: Når vi må bruke det vi har.
      </section>
    </div>
  );
}
