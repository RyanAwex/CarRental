import { CheckCircle2 } from "lucide-react";
import React from "react";

const WhyUs = ({ appData, loading }) => {
  if (!appData) return <div className="h-screen bg-slate-900 animate-pulse" />;

  const { title, benefits, imageUrl, subtitle } = appData;

  // Get current language
  const currentLanguage = localStorage.getItem("lang") || "eg";
  const isArabic = currentLanguage === "ar";

  const lastSpaceIndex = title.lastIndexOf(" ");
  const firstPart = title.substring(0, lastSpaceIndex);
  const lastPart = title.substring(lastSpaceIndex + 1);

  return (
    <section className="py-24 bg-gray-100 dark:bg-slate-950/50">
      {loading && (
        <div className="col-span-full text-center text-indigo-600 dark:text-indigo-400 text-lg py-40">
          Loading section...
        </div>
      )}
      {!loading && (
        <div className="max-w-7xl px-4 grid lg:grid-cols-2 gap-8 lg:gap-12 items-center mx-auto">
          <div
            className={`relative flex items-center justify-center ${isArabic ? "lg:order-2" : "order-2 lg:order-1"}`}
          >
            <div className="absolute -inset-4 bg-indigo-400/20 dark:bg-indigo-600/20 rounded-3xl lg:rounded-3xl blur-xl -z-10"></div>
            <img
              src={imageUrl}
              alt="Why Us"
              className="rounded-3xl lg:rounded-3xl shadow-2xl border border-gray-200 dark:border-white/10 w-full max-h-80 sm:max-h-96 lg:max-h-112 object-cover object-center"
            />
          </div>
          <div className={`${isArabic ? "lg:order-1" : "order-1 lg:order-2"}`}>
            <h2
              className={`text-2xl sm:text-3xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6 ${isArabic ? "text-right" : ""}`}
              dir={isArabic ? "rtl" : "ltr"}
            >
              {isArabic ? (
                <>
                  {firstPart}{" "}
                  <span className="text-indigo-600 dark:text-indigo-500">
                    {lastPart}
                  </span>
                </>
              ) : (
                <>
                  {firstPart}{" "}
                  <span className="text-indigo-600 dark:text-indigo-500">
                    {" "}
                    {lastPart}{" "}
                  </span>
                </>
              )}
            </h2>
            <p
              className={`text-gray-500 dark:text-slate-400 mb-6 sm:mb-8 text-base sm:text-lg ${isArabic ? "text-right" : ""}`}
            >
              {subtitle}
            </p>
            <div className="space-y-4 sm:space-y-6">
              {benefits.map((item, i) => (
                <div
                  key={i}
                  className={`flex gap-3 sm:gap-4 ${isArabic ? "flex-row-reverse text-right" : ""}`}
                >
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400 shrink-0 flex items-center justify-center border border-indigo-200 dark:border-indigo-500/20">
                    <CheckCircle2 size={18} className="sm:w-5 sm:h-5" />
                  </div>
                  <div>
                    <h4 className="text-gray-900 dark:text-white font-bold text-base sm:text-lg">
                      {item.title}
                    </h4>
                    <p className="text-gray-500 dark:text-slate-500 text-xs sm:text-sm">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default WhyUs;
