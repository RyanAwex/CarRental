import React, { useState, useEffect } from "react";
import { Save, ImageIcon } from "lucide-react";
import supabase from "../../config/supabase-client";

const LANGUAGES = [
  { code: "eg", label: "EN" },
  { code: "ar", label: "AR" },
  { code: "fr", label: "FR" },
];

export default function HeroEditor() {
  const [content, setContent] = useState({
    ar: { title: "", subtitle: "", buttonText: "" },
    eg: { title: "", subtitle: "", buttonText: "" },
    fr: { title: "", subtitle: "", buttonText: "" },
    imageUrl: "",
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
        .eq("section_key", "hero")
        .single();
      if (data && data.content) setContent(data.content);
      setLoading(false);
    };
    fetchContent();
  }, []);

  const handleSave = async () => {
    const { error } = await supabase
      .from("site_content")
      .upsert([{ section_key: "hero", content }], {
        onConflict: ["section_key"],
      });
    if (!error) alert("Hero section updated!");
  };

  if (loading)
    return (
      <div className="w-full flex items-center justify-center">Loading...</div>
    );

  const handleLangChange = (lang) => {
    setLanguage(lang);
    localStorage.setItem("lang", lang);
  };

  const handleInputChange = (field, value) => {
    setContent((prev) => ({
      ...prev,
      [language]: {
        ...prev[language],
        [field]: value,
      },
    }));
  };

  const handleImageChange = (value) => {
    setContent((prev) => ({ ...prev, imageUrl: value }));
  };

  return (
    <div className="bg-gray-100 dark:bg-[#1e293b] p-6 rounded-3xl border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <ImageIcon /> Edit Hero Section
      </h2>
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
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-bold mb-2 text-gray-500 dark:text-slate-400">
            Main Title
          </label>
          <input
            className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-lg p-3 focus:border-indigo-500 outline-none text-gray-900 dark:text-white"
            value={content[language]?.title || ""}
            onChange={(e) => handleInputChange("title", e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-bold mb-2 text-gray-500 dark:text-slate-400">
            Subtitle
          </label>
          <textarea
            className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-lg p-3 focus:border-indigo-500 outline-none text-gray-900 dark:text-white"
            rows="3"
            value={content[language]?.subtitle || ""}
            onChange={(e) => handleInputChange("subtitle", e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-bold mb-2 text-gray-500 dark:text-slate-400">
            Car Name
          </label>
          <input
            className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-lg p-3 focus:border-indigo-500 outline-none text-gray-900 dark:text-white"
            value={content[language]?.buttonText || ""}
            onChange={(e) => handleInputChange("buttonText", e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-bold mb-2 text-gray-500 dark:text-slate-400">
            Hero Image URL
          </label>
          <input
            className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-lg p-3 focus:border-indigo-500 outline-none text-gray-900 dark:text-white"
            value={content.imageUrl || ""}
            onChange={(e) => handleImageChange(e.target.value)}
          />
          {content.imageUrl && (
            <img
              src={content.imageUrl}
              alt="Hero Preview"
              className="mt-4 h-40 w-full object-cover rounded-xl"
            />
          )}
        </div>
        <button
          onClick={handleSave}
          className="w-full bg-indigo-600 hover:bg-indigo-500 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all mt-4"
        >
          <Save size={20} /> Save Changes
        </button>
      </div>
    </div>
  );
}
