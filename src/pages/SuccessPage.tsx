import { ArrowRight, CheckCircle2, MapPinned } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import DetailRow from "../components/DetailRow";
import StatusBadge from "../components/StatusBadge";
import { mockResources } from "../data/mockData";
import type { EnergyResource } from "../types/resources";
import { formatKw, resourceTypeLabel } from "../utils/format";
import { loadLocalResources } from "../utils/localStorage";

function findResource(resourceId: string | undefined): EnergyResource | undefined {
  if (!resourceId) {
    return undefined;
  }
  return [...mockResources, ...loadLocalResources()].find((resource) => resource.id === resourceId);
}

export default function SuccessPage() {
  const { resourceId } = useParams();
  const resource = findResource(resourceId);

  if (!resource) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-lg border border-slate-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-bold text-navy-950">Ressursen ble ikke funnet.</h1>
          <Link
            to="/registrer"
            className="mt-6 inline-flex items-center gap-2 rounded-md bg-navy-900 px-4 py-2.5 text-sm font-bold text-white"
          >
            Registrer ny ressurs
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50">
      <section className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="rounded-lg border border-slate-200 bg-white p-8 shadow-panel">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-preparedness-green">
            <CheckCircle2 className="h-8 w-8" aria-hidden="true" />
          </div>
          <h1 className="mt-6 text-3xl font-bold tracking-normal text-navy-950">
            Takk. Ressursen din er nå registrert i Kraftberedskap.
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Ressursen vises i kartet med statusen ikke verifisert, slik at den kan
            inngå i demoen av myndighetsportalen.
          </p>

          <dl className="mt-8 rounded-lg border border-slate-200 p-4">
            <DetailRow label="Ressurs-ID" value={resource.id} />
            <DetailRow label="Type" value={resourceTypeLabel(resource.type)} />
            <DetailRow
              label="Lokasjon"
              value={`${resource.address}, ${resource.postalCode} ${resource.city}`}
            />
            <DetailRow label="Kapasitet" value={formatKw(resource.powerKw)} />
            <DetailRow
              label="Status"
              value={<StatusBadge kind="verification" value={resource.verification} />}
            />
          </dl>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              to={`/kart?ressurs=${resource.id}`}
              className="inline-flex items-center justify-center gap-2 rounded-md bg-navy-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-navy-800"
            >
              <MapPinned className="h-4 w-4" aria-hidden="true" />
              Se ressursen på kartet
            </Link>
            <Link
              to="/registrer"
              className="inline-flex items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-navy-900 transition hover:bg-slate-50"
            >
              Registrer en til
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
