import { Plus, Search } from "lucide-react";
import React from "react";

function SearchAndAction({ setSearchTerm, openModal }) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4 lg:mb-8">
      <div className="flex-1 bg-gray-100 dark:bg-[#1e293b] p-3 lg:p-4 rounded-xl lg:rounded-2xl border border-gray-300 dark:border-slate-700 flex items-center gap-3">
        <Search
          className="text-gray-400 dark:text-slate-400 shrink-0"
          size={20}
        />
        <input
          type="text"
          placeholder="Search Fleet..."
          className="bg-transparent border-none outline-none text-gray-900 dark:text-white text-sm w-full placeholder-gray-500 dark:placeholder-slate-500"
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <button
        onClick={() => openModal()}
        className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 lg:px-6 py-3 lg:py-4 rounded-xl lg:rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg text-sm lg:text-base whitespace-nowrap"
      >
        <Plus size={18} /> Add Vehicle
      </button>
    </div>
  );
}

export default SearchAndAction;
