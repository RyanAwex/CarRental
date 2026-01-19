import React, { useState, useEffect } from "react";
import { Save, ShieldCheck, Plus, Trash2, ImageIcon } from "lucide-react";
import supabase from "../../config/supabase-client";

export default function WhyChooseUsEditor() {
  const [content, setContent] = useState({
    title: "",
    subtitle: "",
    imageUrl: "",
    benefits: [],
  });
  const [loading, setLoading] = useState(true);

  const fetchContent = async () => {
    const { data } = await supabase
      .from("site_content")
      .select("content")
      .eq("section_key", "why_choose_us")
      .single();
    if (data) setContent(data.content);
    setLoading(false);
  };
  useEffect(() => {
    const fetchData = async () => {
      await fetchContent();
    };
    fetchData();
  }, []);

  const handleSave = async () => {
    await supabase
      .from("site_content")
      .upsert([{ section_key: "why_choose_us", content }], {
        onConflict: ["section_key"],
      });
    alert("Section saved successfully!");
  };

  const updateBenefit = (index, field, value) => {
    const newBenefits = [...content.benefits];
    newBenefits[index][field] = value;
    setContent({ ...content, benefits: newBenefits });
  };

  const addBenefit = () => {
    setContent({
      ...content,
      benefits: [...content.benefits, { title: "New Benefit", desc: "" }],
    });
  };

  const removeBenefit = (index) => {
    setContent({
      ...content,
      benefits: content.benefits.filter((_, i) => i !== index),
    });
  };

  if (loading)
    return (
      <div className="w-full flex items-center justify-center">Loading...</div>
    );

  return (
    <div className="bg-gray-100 dark:bg-[#1e293b] p-6 rounded-3xl border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white max-w-3xl mx-auto my-8">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <ShieldCheck /> Edit "Why Choose Us"
      </h2>

      {/* Main Section Info */}
      <div className="space-y-4 mb-8">
        <div>
          <label className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase">
            Main Title
          </label>
          <input
            className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-lg p-3 outline-none focus:border-indigo-500 transition-colors text-gray-900 dark:text-white"
            value={content.title}
            onChange={(e) => setContent({ ...content, title: e.target.value })}
          />
        </div>
        <div>
          <label className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase">
            Subtitle
          </label>
          <textarea
            className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-lg p-3 outline-none focus:border-indigo-500 transition-colors text-gray-900 dark:text-white"
            rows="2"
            value={content.subtitle}
            onChange={(e) =>
              setContent({ ...content, subtitle: e.target.value })
            }
          />
        </div>
        <div>
          <label className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase flex items-center gap-2">
            <ImageIcon size={14} /> Image URL
          </label>
          <input
            className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-lg p-3 outline-none focus:border-indigo-500 transition-colors text-gray-900 dark:text-white"
            value={content.imageUrl}
            onChange={(e) =>
              setContent({ ...content, imageUrl: e.target.value })
            }
          />
        </div>
      </div>

      {/* Benefits List */}
      <div className="space-y-4">
        <label className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase block">
          Benefit Points
        </label>
        {content.benefits.map((item, index) => (
          <div
            key={index}
            className="bg-gray-50 dark:bg-slate-800/50 p-4 rounded-xl border border-gray-200 dark:border-slate-600 flex gap-4 relative group"
          >
            <div className="flex-1 space-y-2">
              <input
                className="w-full bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded p-2 text-sm font-bold text-indigo-600 dark:text-indigo-300 outline-none focus:border-indigo-500"
                placeholder="Title (e.g. Best Price)"
                value={item.title}
                onChange={(e) => updateBenefit(index, "title", e.target.value)}
              />
              <input
                className="w-full bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded p-2 text-sm text-gray-700 dark:text-slate-300 outline-none focus:border-indigo-500"
                placeholder="Description"
                value={item.desc}
                onChange={(e) => updateBenefit(index, "desc", e.target.value)}
              />
            </div>
            <button
              onClick={() => removeBenefit(index)}
              className="self-center p-2 text-gray-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
            >
              <Trash2 size={18} />
            </button>
          </div>
        ))}

        <button
          onClick={addBenefit}
          className="w-full py-3 border-2 border-dashed border-gray-300 dark:border-slate-600 text-gray-500 dark:text-slate-400 rounded-xl hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all flex items-center justify-center gap-2 font-bold"
        >
          <Plus size={18} /> Add Benefit
        </button>
      </div>

      <button
        onClick={handleSave}
        className="w-full bg-indigo-600 hover:bg-indigo-500 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all mt-8 shadow-lg shadow-indigo-500/20"
      >
        <Save size={20} /> Save Changes
      </button>
    </div>
  );
}
