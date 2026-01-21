import { Globe } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

const LANGUAGES = [
  { code: "eg", label: "EN" },
  { code: "ar", label: "AR" },
  { code: "fr", label: "FR" },
];

function LanguageButton() {
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const dropdownRef = useRef();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setLangDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setLangDropdownOpen(!langDropdownOpen)}
        className="relative p-2.5 text-gray-700 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-white transition-all  rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 group"
        aria-label="Select language"
      >
        <Globe
          size={20}
          className="group-hover:text-indigo-400 transition-colors"
        />
      </button>
      {langDropdownOpen && (
        <div className="absolute top-full right-0 mt-1 bg-white dark:bg-slate-800 border border-gray-200 dark:border-white/10 rounded-lg shadow-lg p-1 z-50 flex gap-1">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                localStorage.setItem("lang", lang.code);
                window.location.reload();
                setLangDropdownOpen(false);
              }}
              className={`px-3 py-2 text-sm rounded transition-all ${
                (localStorage.getItem("lang") || "eg") === lang.code
                  ? "bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300"
                  : "hover:bg-gray-100 dark:hover:bg-white/10 text-gray-700 dark:text-slate-200"
              }`}
            >
              {lang.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default LanguageButton;
