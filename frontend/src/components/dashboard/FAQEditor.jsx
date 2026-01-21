// FAQEditor.jsx
import React, { useState, useEffect } from "react";
import { Save, HelpCircle, Plus, Trash2 } from "lucide-react";
import supabase from "../../config/supabase-client";

const LANGUAGES = [
  { code: "eg", label: "EN" },
  { code: "ar", label: "AR" },
  { code: "fr", label: "FR" },
];

export default function FAQEditor() {
  const [content, setContent] = useState({
    ar: { title: "", faqs: [] },
    eg: { title: "", faqs: [] },
    fr: { title: "", faqs: [] },
  });
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState(
    () => localStorage.getItem("lang") || "eg",
  );

  useEffect(() => {
    const fetchFAQs = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("site_content")
        .select("content")
        .eq("section_key", "faq")
        .single();
      if (error || !data || !data.content) {
        setContent({
          ar: { title: "", faqs: [] },
          eg: { title: "", faqs: [] },
          fr: { title: "", faqs: [] },
        });
      } else {
        setContent(data.content);
      }
      setLoading(false);
    };
    fetchFAQs();
  }, []);

  const addItem = () => {
    setContent((prev) => ({
      ...prev,
      [language]: {
        ...prev[language],
        faqs: [...(prev[language].faqs || []), { question: "", answer: "" }],
      },
    }));
  };

  const removeItem = (index) => {
    setContent((prev) => ({
      ...prev,
      [language]: {
        ...prev[language],
        faqs: (prev[language].faqs || []).filter((_, i) => i !== index),
      },
    }));
  };

  const updateItem = (index, field, value) => {
    setContent((prev) => ({
      ...prev,
      [language]: {
        ...prev[language],
        faqs: (prev[language].faqs || []).map((item, i) =>
          i === index ? { ...item, [field]: value } : item,
        ),
      },
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    const { error } = await supabase.from("site_content").upsert(
      [
        {
          section_key: "faq",
          content,
        },
      ],
      { onConflict: ["section_key"] },
    );
    setLoading(false);
    if (!error) alert("FAQs updated!");
  };

  const handleLangChange = (lang) => {
    setLanguage(lang);
    localStorage.setItem("lang", lang);
  };

  if (loading)
    return (
      <div className="w-full flex items-center justify-center">Loading...</div>
    );

  return (
    <div className="bg-gray-100 dark:bg-[#1e293b] p-6 rounded-3xl border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white max-w-3xl mx-auto my-8">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <HelpCircle /> FAQ Section
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

      <div className="mb-6">
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

      <div className="space-y-4">
        {(content[language]?.faqs || []).map((item, index) => (
          <div
            key={index}
            className="bg-gray-50 dark:bg-slate-800/50 p-4 rounded-xl border border-gray-200 dark:border-slate-600 relative group"
          >
            <button
              onClick={() => removeItem(index)}
              className="absolute top-2 right-2 text-gray-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash2 size={16} />
            </button>
            <div className="space-y-3">
              <input
                className="w-full bg-transparent border-b border-gray-200 dark:border-slate-700 p-2 font-bold text-indigo-600 dark:text-indigo-300 outline-none focus:border-indigo-500"
                placeholder="Question?"
                value={item.question}
                onChange={(e) => updateItem(index, "question", e.target.value)}
              />
              <textarea
                className="w-full bg-transparent p-2 text-gray-700 dark:text-slate-300 text-sm outline-none resize-none"
                rows="2"
                placeholder="Answer..."
                value={item.answer}
                onChange={(e) => updateItem(index, "answer", e.target.value)}
              />
            </div>
          </div>
        ))}
        <button
          onClick={addItem}
          className="w-full py-3 bg-gray-200 dark:bg-slate-800 hover:bg-gray-300 dark:hover:bg-slate-700 text-gray-600 dark:text-slate-300 rounded-xl font-bold flex items-center justify-center gap-2"
        >
          <Plus size={18} /> Add New Question
        </button>
      </div>

      <button
        onClick={handleSave}
        className="w-full bg-indigo-600 hover:bg-indigo-500 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all mt-6"
      >
        <Save size={20} /> Save FAQs
      </button>
    </div>
  );
}
