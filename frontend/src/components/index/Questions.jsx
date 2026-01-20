import { ChevronDown, ChevronUp } from "lucide-react";
import React, { useState } from "react";

const Questions = ({ appData, loading }) => {
  const [active, setActive] = useState(null);
  if (!appData) return <div className="h-screen bg-slate-900 animate-pulse" />;

  const { title, faqs } = appData;

  const lastSpaceIndex = title.lastIndexOf(" ");
  const firstPart = title.substring(0, lastSpaceIndex);
  const lastPart = title.substring(lastSpaceIndex + 1);

  return (
    <section
      id="faq"
      className="py-16 sm:py-24 bg-gray-100 dark:bg-slate-950/50"
    >
      {loading && (
        <div className="col-span-full text-center text-indigo-600 dark:text-indigo-400 text-lg py-40">
          Loading section...
        </div>
      )}

      {!loading && (
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl md:text-3xl font-bold text-gray-900 dark:text-white mb-8 sm:mb-12 text-center">
            {firstPart}{" "}
            <span className="text-indigo-600 dark:text-indigo-500">
              {lastPart}
            </span>
          </h2>
          <div className="space-y-3 sm:space-y-4">
            {faqs.map((item, idx) => (
              <div
                key={idx}
                className={`bg-gray-50 dark:bg-white/5 rounded-xl sm:rounded-2xl overflow-hidden border transition-colors hover:cursor-pointer ${
                  active === idx
                    ? "border-indigo-500/30 bg-indigo-50 dark:bg-white/10"
                    : "border-gray-200 dark:border-white/5"
                }`}
              >
                <button
                  onClick={() => setActive(active === idx ? null : idx)}
                  className="w-full flex justify-between items-center p-4 sm:p-6 text-left text-gray-900 dark:text-white text-sm sm:text-base font-medium focus:outline-none gap-3"
                >
                  <span>{item.question}</span>
                  {active === idx ? (
                    <ChevronUp
                      size={18}
                      className="text-indigo-600 dark:text-indigo-400 shrink-0"
                    />
                  ) : (
                    <ChevronDown
                      size={18}
                      className="text-gray-400 dark:text-slate-500 shrink-0"
                    />
                  )}
                </button>
                <div
                  className={`px-4 sm:px-6 text-gray-500 dark:text-slate-400 text-xs sm:text-sm leading-relaxed overflow-hidden transition-all  ${
                    active === idx
                      ? "max-h-40 pb-4 sm:pb-6 opacity-100"
                      : "max-h-0 opacity-0"
                  }`}
                >
                  {item.answer}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};
export default Questions;
