// HowItWorksEditor.jsx
import React, { useState, useEffect } from "react";
import { Save, List, Plus, Trash2, LayoutGrid } from "lucide-react";
import supabase from "../../config/supabase-client";

const LANGUAGES = [
  { code: "eg", label: "EN" },
  { code: "ar", label: "AR" },
  { code: "fr", label: "FR" },
];

export default function HowItWorksEditor() {
  const [content, setContent] = useState({
    ar: { title: "", subtitle: "", steps: [] },
    eg: { title: "", subtitle: "", steps: [] },
    fr: { title: "", subtitle: "", steps: [] },
  });
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState(
    () => localStorage.getItem("lang") || "eg",
  );

  useEffect(() => {
    const fetchContent = async () => {
      const { data } = await supabase
        .from("site_content")
        .select("content")
        .eq("section_key", "how_it_works")
        .single();
      if (data && data.content) setContent(data.content);
      setLoading(false);
    };
    fetchContent();
  }, []);

  const handleSave = async () => {
    await supabase
      .from("site_content")
      .upsert([{ section_key: "how_it_works", content }], {
        onConflict: ["section_key"],
      });
    alert("Section updated!");
  };

  const addStep = () => {
    setContent((prev) => ({
      ...prev,
      [language]: {
        ...prev[language],
        steps: [
          ...(prev[language].steps || []),
          {
            title: "New Step",
            desc: "",
            icon: ICON_OPTIONS[0],
          },
        ],
      },
    }));
  };

  const removeStep = (index) => {
    setContent((prev) => ({
      ...prev,
      [language]: {
        ...prev[language],
        steps: (prev[language].steps || []).filter((_, i) => i !== index),
      },
    }));
  };

  const updateStep = (index, field, value) => {
    setContent((prev) => ({
      ...prev,
      [language]: {
        ...prev[language],
        steps: (prev[language].steps || []).map((step, i) =>
          i === index ? { ...step, [field]: value } : step,
        ),
      },
    }));
  };

  const handleLangChange = (lang) => {
    setLanguage(lang);
    localStorage.setItem("lang", lang);
  };

  const ICON_OPTIONS = [
    "Location",
    "Calendar",
    "Wallet",
    "Check",
    "Clock",
    "Car",
  ];

  if (loading)
    return (
      <div className="w-full flex items-center justify-center">Loading...</div>
    );

  return (
    <div className="bg-gray-100 dark:bg-[#1e293b] p-6 rounded-3xl border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white max-w-3xl mx-auto my-8">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <List /> How It Works Section
      </h2>

      {/* Language Toggle */}
      <div className="flex gap-2 mb-4">
        {LANGUAGES.map((lang) => (
          <button
            key={lang.code}
            onClick={() => handleLangChange(lang.code)}
            className={`px-3 py-1 rounded font-bold text-xs border transition-all focus:outline-none focus:ring-2 focus:ring-indigo-400/50 ${
              language === lang.code
                ? "bg-indigo-600 text-white border-indigo-600"
                : "bg-gray-200 dark:bg-slate-800 text-gray-700 dark:text-slate-200 border-gray-300 dark:border-slate-600"
            }`}
          >
            {lang.label}
          </button>
        ))}
      </div>

      {/* Main Headers */}
      <div className="grid gap-4 mb-6">
        <div>
          <label className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase">
            Section Title
          </label>
          <input
            className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-lg p-3 outline-none focus:border-indigo-500 text-gray-900 dark:text-white"
            value={content[language]?.title || ""}
            onChange={(e) =>
              setContent((prev) => ({
                ...prev,
                [language]: { ...prev[language], title: e.target.value },
              }))
            }
          />
        </div>
        <div>
          <label className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase">
            Subtitle
          </label>
          <input
            className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-lg p-3 outline-none focus:border-indigo-500 text-gray-900 dark:text-white"
            value={content[language]?.subtitle || ""}
            onChange={(e) =>
              setContent((prev) => ({
                ...prev,
                [language]: { ...prev[language], subtitle: e.target.value },
              }))
            }
          />
        </div>
      </div>

      {/* Dynamic Steps List */}
      <div className="space-y-4">
        <label className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase block">
          Steps
        </label>
        {(content[language]?.steps || []).map((step, index) => (
          <div
            key={index}
            className="bg-gray-50 dark:bg-slate-800/50 p-4 rounded-xl border border-gray-200 dark:border-slate-600 flex gap-4 items-start"
          >
            <span className="bg-gray-200 dark:bg-slate-700 w-8 h-8 flex items-center justify-center rounded-full font-bold text-gray-500 dark:text-slate-400 shrink-0">
              {index + 1}
            </span>
            <div className="flex-1 space-y-2">
              <div>
                <label className="text-[10px] uppercase font-bold text-gray-400 dark:text-slate-500">
                  Icon
                </label>
                <div className="flex items-center gap-2">
                  <LayoutGrid
                    size={16}
                    className="text-indigo-500 dark:text-indigo-400"
                  />
                  <select
                    className="bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded p-2 text-sm text-gray-900 dark:text-white outline-none focus:border-indigo-500 w-full"
                    value={step.icon}
                    onChange={(e) => updateStep(index, "icon", e.target.value)}
                  >
                    {ICON_OPTIONS.map((icon) => (
                      <option key={icon} value={icon}>
                        {icon}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <input
                className="w-full bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded p-2 text-sm outline-none focus:border-indigo-500 text-gray-900 dark:text-white"
                placeholder="Step Title"
                value={step.title}
                onChange={(e) => updateStep(index, "title", e.target.value)}
              />
              <textarea
                className="w-full bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded p-2 text-sm outline-none focus:border-indigo-500 text-gray-900 dark:text-white"
                rows="2"
                placeholder="Description"
                value={step.desc}
                onChange={(e) => updateStep(index, "desc", e.target.value)}
              />
            </div>
            <button
              onClick={() => removeStep(index)}
              className="text-red-500 dark:text-red-400 hover:text-red-400 dark:hover:text-red-300 p-2"
            >
              <Trash2 size={18} />
            </button>
          </div>
        ))}
        <button
          onClick={addStep}
          className="w-full py-3 border-2 border-dashed border-gray-300 dark:border-slate-600 text-gray-500 dark:text-slate-400 rounded-xl hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center justify-center gap-2"
        >
          <Plus size={18} /> Add Step
        </button>
      </div>

      <button
        onClick={handleSave}
        className="w-full bg-indigo-600 hover:bg-indigo-500 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all mt-6"
      >
        <Save size={20} /> Save Changes
      </button>
    </div>
  );
}
