import React, { useState, useEffect } from "react";
import { Save, Gem, Plus, Trash2 } from "lucide-react";
import supabase from "../../config/supabase-client";

export default function ExclusiveServicesEditor() {
  const [content, setContent] = useState({ title: "", services: [] });
  const [loading, setLoading] = useState(true);

  const fetchContent = async () => {
    const { data } = await supabase
      .from("site_content")
      .select("content")
      .eq("section_key", "exclusive_services")
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
      .upsert([{ section_key: "exclusive_services", content }], {
        onConflict: ["section_key"],
      });
    alert("Services saved successfully!");
  };

  const updateService = (index, field, value) => {
    const newServices = [...content.services];
    newServices[index][field] = value;
    setContent({ ...content, services: newServices });
  };

  const addService = () => {
    setContent({
      ...content,
      services: [...content.services, { title: "New Service", desc: "" }],
    });
  };

  const removeService = (index) => {
    setContent({
      ...content,
      services: content.services.filter((_, i) => i !== index),
    });
  };

  if (loading)
    return (
      <div className="w-full flex items-center justify-center">Loading...</div>
    );

  return (
    <div className="bg-gray-100 dark:bg-[#1e293b] p-6 rounded-3xl border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white max-w-3xl mx-auto my-8">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Gem /> Edit "Exclusive Services"
      </h2>

      <div className="mb-8">
        <label className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase">
          Section Title
        </label>
        <input
          className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-lg p-3 outline-none focus:border-indigo-500 transition-colors text-gray-900 dark:text-white"
          value={content.title}
          onChange={(e) => setContent({ ...content, title: e.target.value })}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {content.services.map((service, index) => (
          <div
            key={index}
            className="bg-gray-50 dark:bg-slate-800/50 p-5 rounded-2xl border border-gray-200 dark:border-slate-600 relative group hover:border-indigo-500/30 transition-colors"
          >
            <button
              onClick={() => removeService(index)}
              className="absolute top-3 right-3 text-gray-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
            >
              <Trash2 size={16} />
            </button>

            <div className="space-y-3">
              {/* Text Inputs */}
              <div>
                <label className="text-[10px] uppercase font-bold text-gray-400 dark:text-slate-500">
                  Service Title
                </label>
                <input
                  className="w-full bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded p-2 text-sm font-bold text-gray-900 dark:text-white outline-none focus:border-indigo-500"
                  value={service.title}
                  onChange={(e) =>
                    updateService(index, "title", e.target.value)
                  }
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-gray-400 dark:text-slate-500">
                  Description
                </label>
                <textarea
                  className="w-full bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded p-2 text-sm text-gray-700 dark:text-slate-300 outline-none focus:border-indigo-500 resize-none"
                  rows="2"
                  value={service.desc}
                  onChange={(e) => updateService(index, "desc", e.target.value)}
                />
              </div>
            </div>
          </div>
        ))}

        {/* Add Button (renders as a dashed card) */}
        <button
          onClick={addService}
          className="border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-2xl flex flex-col items-center justify-center gap-2 text-gray-500 dark:text-slate-400 hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all min-h-50"
        >
          <Plus size={32} />
          <span className="font-bold">Add Service</span>
        </button>
      </div>

      <button
        onClick={handleSave}
        className="w-full bg-indigo-600 hover:bg-indigo-500 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all mt-8 shadow-lg shadow-indigo-500/20"
      >
        <Save size={20} /> Save Services
      </button>
    </div>
  );
}
