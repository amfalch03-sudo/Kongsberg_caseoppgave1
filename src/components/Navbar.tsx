import { BatteryCharging, MapPinned, ShieldCheck, Zap } from "lucide-react";
import { Link, NavLink } from "react-router-dom";

const navItems = [
  { label: "Konseptet", href: "/" },
  { label: "Registrer ressurs", href: "/registrer" },
  { label: "Beredskapskart", href: "/kart" },
];

export default function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-md bg-navy-900 text-white">
            <Zap className="h-5 w-5" aria-hidden="true" />
          </span>
          <span>
            <span className="block text-base font-bold tracking-normal text-navy-950">
              Kraftberedskap
            </span>
            <span className="hidden text-xs text-slate-500 sm:block">
              Lokale energiressurser
            </span>
          </span>
        </Link>

        <div className="hidden items-center gap-1 rounded-md bg-slate-100 p-1 md:flex">
          {navItems.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              className={({ isActive }) =>
                [
                  "rounded px-3 py-2 text-sm font-medium transition",
                  isActive
                    ? "bg-white text-navy-900 shadow-sm"
                    : "text-slate-600 hover:text-navy-900",
                ].join(" ")
              }
            >
              {item.label}
            </NavLink>
          ))}
        </div>

        <Link
          to="/kart"
          className="inline-flex items-center gap-2 rounded-md bg-navy-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-navy-800"
        >
          <ShieldCheck className="h-4 w-4" aria-hidden="true" />
          <span className="hidden sm:inline">Myndighetsportal</span>
          <MapPinned className="h-4 w-4 sm:hidden" aria-hidden="true" />
        </Link>
      </nav>
      <div className="flex gap-1 overflow-x-auto border-t border-slate-100 px-4 py-2 md:hidden">
        {navItems.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            className={({ isActive }) =>
              [
                "whitespace-nowrap rounded px-3 py-2 text-sm font-medium",
                isActive ? "bg-navy-900 text-white" : "text-slate-600",
              ].join(" ")
            }
          >
            {item.label}
          </NavLink>
        ))}
        <BatteryCharging className="ml-auto h-5 w-5 shrink-0 self-center text-preparedness-green" />
      </div>
    </header>
  );
}
