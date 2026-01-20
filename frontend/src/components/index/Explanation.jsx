import React from "react";
import {
  MapPin,
  Calendar,
  Wallet,
  CheckCircle2,
  Clock,
  Car,
} from "lucide-react";

function Explanation({ appData, loading }) {
  if (!appData) return <div className="h-screen bg-slate-900 animate-pulse" />;

  const { steps, title, subtitle } = appData;

  const lastSpaceIndex = title.lastIndexOf(" ");
  const firstPart = title.substring(0, lastSpaceIndex);
  const lastPart = title.substring(lastSpaceIndex + 1);

  const ICON_MAP = {
    Location: MapPin,
    Calendar: Calendar,
    Wallet: Wallet,
    Check: CheckCircle2,
    Clock: Clock,
    Car: Car,
  };

  function ServiceIcon({ iconName }) {
    // Get the component from the map
    const IconComponent = ICON_MAP[iconName];

    // If the icon doesn't exist, return null to avoid crashes
    if (!IconComponent) return null;

    return <IconComponent className="w-6 h-6" />;
  }

  return (
    <section
      id="howitworks"
      className="py-16 sm:py-24 bg-gray-50 dark:bg-slate-950 relative"
    >
      {loading && (
        <div className="col-span-full text-center text-indigo-600 dark:text-indigo-400 text-lg py-40">
          Loading section...
        </div>
      )}
      {!loading && (
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
              {firstPart}{" "}
              <span className="text-indigo-600 dark:text-indigo-500">
                {" "}
                {lastPart}{" "}
              </span>
            </h2>
            <p className="text-gray-500 dark:text-slate-400 max-w-2xl mx-auto text-sm sm:text-base">
              {subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 relative">
            {/* Connecting Line (Desktop) */}
            <div className="hidden md:block absolute top-12 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-indigo-300/20 dark:via-indigo-500/20 to-transparent" />

            {steps.map((step, idx) => (
              <div
                key={idx}
                className="relative p-6 sm:p-8 rounded-2xl sm:rounded-3xl bg-white border border-gray-100 dark:bg-white/5 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/10 transition-all transform hover:scale-105 duration-300 group z-10 shadow-md hover:shadow-lg dark:shadow-none"
              >
                <div
                  className="w-12 h-12 sm:w-14 sm:h-14 bg-indigo-50 text-indigo-600 border border-indigo-200 dark:bg-slate-900 dark:border-indigo-500/30 dark:text-indigo-400 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-[0_0_15px_rgba(79,70,229,0.15)] group-hover:scale-110 group-hover:bg-indigo-600/90
                 group-hover:text-white group-hover:border-indigo-600 transition-all "
                >
                  <ServiceIcon iconName={step.icon} />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-3 text-center">
                  {step.title}
                </h3>
                <p className="text-gray-500 dark:text-slate-400 text-xs sm:text-sm leading-relaxed text-center">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
export default Explanation;
