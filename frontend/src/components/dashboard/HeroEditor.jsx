import React, { useState, useEffect } from "react";
import { Save, ImageIcon } from "lucide-react";
import supabase from "../../config/supabase-client";

export default function HeroEditor() {
  const [content, setContent] = useState({
    title: "",
    subtitle: "",
    buttonText: "",
    imageUrl: "",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      const { data } = await supabase
        .from("site_content")
        .select("content")
        .eq("section_key", "hero")
        .single();
      if (data) setContent(data.content);
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

  return (
    <div className="bg-gray-100 dark:bg-[#1e293b] p-6 rounded-3xl border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <ImageIcon /> Edit Hero Section
      </h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-bold mb-2 text-gray-500 dark:text-slate-400">
            Main Title
          </label>
          <input
            className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-lg p-3 focus:border-indigo-500 outline-none text-gray-900 dark:text-white"
            value={content.title}
            onChange={(e) => setContent({ ...content, title: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-bold mb-2 text-gray-500 dark:text-slate-400">
            Subtitle
          </label>
          <textarea
            className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-lg p-3 focus:border-indigo-500 outline-none text-gray-900 dark:text-white"
            rows="3"
            value={content.subtitle}
            onChange={(e) =>
              setContent({ ...content, subtitle: e.target.value })
            }
          />
        </div>
        <div>
          <label className="block text-sm font-bold mb-2 text-gray-500 dark:text-slate-400">
            Car Name
          </label>
          <input
            className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-lg p-3 focus:border-indigo-500 outline-none text-gray-900 dark:text-white"
            value={content.buttonText}
            onChange={(e) =>
              setContent({ ...content, buttonText: e.target.value })
            }
          />
        </div>
        <div>
          <label className="block text-sm font-bold mb-2 text-gray-500 dark:text-slate-400">
            Hero Image URL
          </label>
          <input
            className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-lg p-3 focus:border-indigo-500 outline-none text-gray-900 dark:text-white"
            value={content.imageUrl}
            onChange={(e) =>
              setContent({ ...content, imageUrl: e.target.value })
            }
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
