import { Cog, Edit, Fuel, Trash2, Car } from "lucide-react";
import React from "react";

function MainData({ loading, filteredCars, openModal, handleDelete }) {
  return (
    <div className="bg-gray-100 dark:bg-[#1e293b] rounded-2xl lg:rounded-3xl border border-gray-200 dark:border-slate-700 overflow-hidden">
      {/* Mobile Card View */}
      <div className="lg:hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500 dark:text-slate-500">
            Loading fleet data...
          </div>
        ) : filteredCars.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-slate-500">
            No vehicles found
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-slate-700">
            {filteredCars.map((car) => (
              <div
                key={car.id}
                className="p-4 hover:bg-gray-50 dark:hover:bg-slate-800/30 transition-colors"
              >
                <div className="flex gap-3">
                  <div className="w-16 h-12 rounded-lg bg-gray-200 dark:bg-slate-700 overflow-hidden shrink-0">
                    {car.image_urls?.[0] ? (
                      <img
                        src={car.image_urls[0]}
                        alt=""
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Car
                          size={20}
                          className="text-gray-400 dark:text-slate-500"
                        />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white text-sm truncate text-wrap">
                          {car.make} {car.model}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-slate-500">
                          {car.year} • {car.license_plate}
                        </p>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold border shrink-0 ${
                          (car.effectiveStatus || car.status) === "Available"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : (car.effectiveStatus || car.status) === "Rented"
                              ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                              : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                        }`}
                      >
                        {car.effectiveStatus || car.status}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-slate-700/50 flex items-center justify-between">
                  <div className="flex gap-4 text-xs text-gray-500 dark:text-slate-400">
                    <span className="flex items-center gap-1">
                      <Cog size={12} />
                      {car.transmission === "Automatic" ? "Auto" : "Manual"}
                    </span>
                    <span className="flex items-center gap-1">
                      <Fuel size={12} />
                      {car.fuel_type}
                    </span>
                    <span className="text-gray-900 dark:text-white font-bold">
                      {car.base_price_per_day} MAD
                    </span>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => openModal(car)}
                      className="p-2 hover:bg-indigo-500/20 text-indigo-400 rounded-lg transition-colors"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(car.id)}
                      className="p-2 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 dark:bg-slate-800/50 text-gray-500 dark:text-slate-400 text-sm uppercase tracking-wider">
              <th className="p-6 font-medium">Car Details</th>
              <th className="p-6 font-medium">Status</th>
              <th className="p-6 font-medium">Specs</th>
              <th className="p-6 font-medium">Pricing (Day/Wknd)</th>
              <th className="p-6 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
            {loading ? (
              <tr>
                <td
                  colSpan="5"
                  className="p-8 text-center text-gray-500 dark:text-slate-500"
                >
                  Loading fleet data...
                </td>
              </tr>
            ) : (
              filteredCars.map((car) => (
                <tr
                  key={car.id}
                  className="hover:bg-gray-50 dark:hover:bg-slate-800/30 transition-colors"
                >
                  <td className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-gray-200 dark:bg-slate-700 overflow-hidden">
                        <img
                          src={
                            car.image_urls?.[0] ||
                            "https://via.placeholder.com/100"
                          }
                          alt=""
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div>
                        <div className="font-bold text-gray-900 dark:text-white">
                          {car.make} {car.model}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-slate-500">
                          {car.year} • {car.license_plate}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-6">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold border ${
                        (car.effectiveStatus || car.status) === "Available"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : (car.effectiveStatus || car.status) === "Rented"
                            ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                            : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                      }`}
                    >
                      {car.effectiveStatus || car.status}
                    </span>
                  </td>
                  <td className="p-6">
                    <div className="flex gap-3 text-gray-500 dark:text-slate-400">
                      <div title="Transmission">
                        <Cog size={16} />{" "}
                        <span className="text-xs">
                          {car.transmission === "Automatic" ? "Auto" : "Man"}
                        </span>
                      </div>
                      <div title="Fuel">
                        <Fuel size={16} />{" "}
                        <span className="text-xs">{car.fuel_type}</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-6 text-sm">
                    <div className="text-gray-900 dark:text-white font-bold">
                      {car.base_price_per_day} MAD
                    </div>
                    <div className="text-xs text-gray-500 dark:text-slate-500">
                      {car.weekend_price_per_day} MAD (Wknd)
                    </div>
                  </td>
                  <td className="p-6 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => openModal(car)}
                        className="p-2 hover:bg-indigo-500/20 text-indigo-400 rounded-lg transition-colors"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(car.id)}
                        className="p-2 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default MainData;
