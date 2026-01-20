import React from "react";

const Services = ({ appData }) => {
  if (!appData) return <div className="h-screen bg-slate-900 animate-pulse" />;

  const { title, services, loading } = appData;

  const lastSpaceIndex = title.lastIndexOf(" ");
  const firstPart = title.substring(0, lastSpaceIndex);
  const lastPart = title.substring(lastSpaceIndex + 1);

  return (
    <section
      id="services"
      className="py-16 sm:py-24 bg-gray-100 dark:bg-slate-950/50"
    >
      {loading && (
        <div className="col-span-full text-center text-indigo-600 dark:text-indigo-400 text-lg py-40">
          Loading section...
        </div>
      )}

      {!loading && (
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-3xl font-bold text-gray-900 dark:text-white mb-10 sm:mb-16">
            {firstPart}{" "}
            <span className="text-indigo-600 dark:text-indigo-500">
              {" "}
              {lastPart}{" "}
            </span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            {services.map((srv, i) => (
              <div
                key={i}
                className="p-6 sm:p-10 bg-white dark:bg-[#151925] border border-gray-100 rounded-2xl sm:rounded-3xl dark:border-white/5 hover:border-indigo-500/30  group shadow-sm dark:shadow-none transform hover:scale-105 transition-all duration-300"
              >
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {srv.title}
                </h3>
                <p className="text-gray-500 dark:text-slate-400 text-xs sm:text-sm leading-relaxed">
                  {srv.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};

export default Services;
