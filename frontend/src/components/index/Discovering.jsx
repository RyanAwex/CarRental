import React, { useState } from "react";
import { ArrowRight, Calendar, Cog, Fuel, Package } from "lucide-react";
import { getPrice } from "../../store/days";
import { useNavigate } from "react-router-dom";
import { useCartStore } from "../../store/carStore";
import supabase from "../../config/supabase-client";

function Discovering({ loading, error, cars }) {
  const [popup, setPopup] = useState(null);
  const navigate = useNavigate();

  const { addToCart } = useCartStore();

  // Get current language
  const currentLanguage = localStorage.getItem("lang") || "eg";
  const isArabic = currentLanguage === "ar";
  const isFrench = currentLanguage === "fr";

  // Show popup for 2 seconds
  const showPopup = (type, message) => {
    setPopup({ type, message });
    setTimeout(() => setPopup(null), 2000);
  };

  const handleRent = async (car) => {
    if (car.status !== "Available") {
      showPopup("not-available", "Car is not available");
      return;
    }

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      navigate("/auth");
    } else {
      addToCart(car);
      navigate("/configuring");
    }
  };

  return (
    <>
      {popup && (
        <div
          className={`fixed bottom-5 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-xl font-bold shadow-lg transition-all
            ${
              popup.type === "not-available"
                ? "bg-red-600 text-white"
                : "flex-none"
            }`}
        >
          {popup.message}
        </div>
      )}
      <section
        id="fleet"
        className="py-16 sm:py-24 bg-gray-50 dark:bg-slate-950"
      >
        <div className="max-w-7xl mx-auto px-4">
          <div
            className={`flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 sm:mb-12 gap-4 ${isArabic ? "sm:flex-row-reverse" : ""}`}
          >
            <div className={`${isArabic ? "text-right" : ""}`}>
              <h2 className="text-2xl sm:text-3xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {isFrench
                  ? "Notre Premium"
                  : !isArabic
                    ? "Our Premium"
                    : "أسطولنا"}{" "}
                <span className="text-indigo-600 dark:text-indigo-500">
                  {isFrench ? "Flotte" : !isArabic ? "Fleet" : "المميز"}
                </span>
              </h2>
              <p className="text-gray-500 dark:text-slate-400 text-sm sm:text-base">
                {isFrench
                  ? "Choisissez parmi notre large gamme de véhicules de luxe."
                  : !isArabic
                    ? "Choose from our wide range of premium vehicles."
                    : "اختر من بين مجموعتنا الواسعة من المركبات المميزة"}
              </p>
            </div>
            <button
              onClick={() => navigate("/fleet")}
              className={`flex items-center text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium transition-colors text-sm sm:text-base ${isArabic ? "flex-row-reverse" : ""}`}
            >
              {isFrench
                ? "Voir Tous les Véhicules"
                : !isArabic
                  ? "View All Vehicles"
                  : "عرض جميع المركبات"}
              <ArrowRight
                size={16}
                className={`${isArabic ? "mr-2 rotate-180" : "ml-2"}`}
              />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {loading && (
              <div className="col-span-full text-center text-indigo-600 dark:text-indigo-400 text-lg py-40">
                Loading cars...
              </div>
            )}
            {error && (
              <div className="col-span-full text-center text-red-500 text-lg py-8">
                Error: {error.message || error.toString()}
              </div>
            )}
            {!loading && !error && cars.length === 0 && (
              <div className="col-span-full text-center text-gray-500 dark:text-slate-400 text-lg py-8">
                No cars available.
              </div>
            )}
            {!loading &&
              !error &&
              cars.map((c) => (
                <div
                  key={c.id}
                  className="bg-white border border-gray-100 shadow-sm hover:shadow-md dark:bg-slate-900 dark:border-white/5 dark:shadow-none rounded-3xl overflow-hidden hover:border-indigo-500/40 transition-all hover:-translate-y-1 group"
                >
                  {/* Image Section */}
                  <div className="h-52 overflow-hidden relative">
                    <img
                      src={c.image_urls[0] || "placeholder-car.jpg"}
                      alt={`${c.make} ${c.model}`}
                      className="w-full h-full object-contain transform group-hover:scale-105 transition-transform "
                    />
                    {/* Category Badge */}
                    <div className="absolute top-4 left-4 bg-indigo-600 px-3 py-1 rounded-full text-[10px] uppercase tracking-widest font-black text-white shadow-lg">
                      {c.category}
                    </div>
                    {/* Transmission Badge */}
                    <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs font-medium text-white border border-white/10">
                      {c.transmission}
                    </div>
                  </div>

                  {/* Content Section */}
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-1">
                      <h3 className="text-xl font-bold text-gray-900 group-hover:text-indigo-600 dark:text-white dark:group-hover:text-indigo-400 transition-colors">
                        {c.make} {c.model}
                      </h3>
                      <span className="text-indigo-600 dark:text-indigo-400 font-bold text-xl">
                        {getPrice(c)}{" "}
                        <span className="text-sm text-gray-500 dark:text-slate-400 font-medium">
                          MAD
                        </span>
                      </span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-gray-500 dark:text-slate-400 text-sm flex gap-1 items-center">
                        <Calendar size={14} className="text-indigo-400/60" />
                        {c.year}
                      </p>
                      <span className="text-gray-400 dark:text-slate-500 text-xs font-medium">
                        {isFrench
                          ? "Par Jour"
                          : !isArabic
                            ? "Per Day"
                            : "لكل يوم"}
                      </span>
                    </div>

                    {/* Car Specs Grid */}
                    <div className="grid grid-cols-2 gap-3 my-5 border-y border-gray-100 dark:border-white/5 py-4">
                      <div className="flex items-center gap-2 text-gray-600 dark:text-slate-300 text-sm">
                        <span className="opacity-50 text-indigo-600 dark:text-indigo-400">
                          <Fuel size={16} />
                        </span>{" "}
                        {c.fuel_type}
                      </div>
                      <div className="flex items-center gap-2 text-gray-600 dark:text-slate-300 text-sm">
                        <span className="opacity-50 text-indigo-600 dark:text-indigo-400">
                          <Cog size={16} />
                        </span>{" "}
                        {c.transmission === "Automatic" ? "Auto" : "Manual"}
                      </div>
                      <div className="col-span-2 flex items-center gap-2 text-gray-600 dark:text-slate-300 text-sm">
                        <span className="opacity-50 text-indigo-600 dark:text-indigo-400">
                          <Package size={16} />
                        </span>{" "}
                        {c.kits || "Standard Kit"}
                      </div>
                    </div>

                    <button
                      onClick={() => handleRent(c)}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 dark:hover:bg-indigo-500 text-white py-3 rounded-2xl text-sm font-bold transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {isFrench
                        ? "Louer Maintenant"
                        : !isArabic
                          ? "Rent Now"
                          : "استئجار الآن"}
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </section>
    </>
  );
}

export default Discovering;
