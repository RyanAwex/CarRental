// FAQEditor.jsx
import React, { useState, useEffect } from "react";
import supabase from "../../config/supabase-client";
import { Save, HelpCircle, Plus, Trash2 } from "lucide-react";

export default function FAQEditor() {
  const [content, setContent] = useState({ title: "", faqs: [] });
  const [loading, setLoading] = useState(false);

  // Fetch FAQs from Supabase on mount
  useEffect(() => {
    const fetchFAQs = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("site_content")
        .select("content")
        .eq("section_key", "faq")
        .single();
      if (error) {
        setContent({ title: "", faqs: [] });
      } else if (data && data.content) {
        // content is a JSON object with faqs array
        setContent({
          title: data.content.title || "",
          faqs: data.content.faqs || [],
        });
      }
      setLoading(false);
    };
    fetchFAQs();
  }, []);

  // Add FAQ item
  const addItem = () => {
    setContent((prev) => ({
      ...prev,
      faqs: prev.faqs
        ? [...prev.faqs, { question: "", answer: "" }]
        : [{ question: "", answer: "" }],
    }));
  };

  // Remove FAQ item
  const removeItem = (index) => {
    setContent((prev) => ({
      ...prev,
      faqs: prev.faqs.filter((_, i) => i !== index),
    }));
  };

  // Update FAQ item
  const updateItem = (index, field, value) => {
    setContent((prev) => ({
      ...prev,
      faqs: prev.faqs.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  // Save FAQs to Supabase
  const handleSave = async () => {
    setLoading(true);
    // Only update the faqs array inside the content JSON, preserving other fields
    // Fetch the current content first
    const { data, error: fetchError } = await supabase
      .from("site_content")
      .select("content")
      .eq("section_key", "faq")
      .single();
    let newContent = { title: content.title, faqs: content.faqs };
    if (!fetchError && data && data.content) {
      newContent = { ...data.content, faqs: content.faqs };
    }
    // Use upsert to insert or update the row
    const { error } = await supabase.from("site_content").upsert(
      [
        {
          section_key: "faq",
          content: newContent,
        },
      ],
      { onConflict: ["section_key"] }
    );
    if (error) {
      throw error.message;
    }
    setLoading(false);
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

      <div className="mb-6">
        <label className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase">
          Section Title
        </label>
        <input
          className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-lg p-3 outline-none focus:border-indigo-500 text-gray-900 dark:text-white"
          value={content.title}
          onChange={(e) => setContent({ ...content, title: e.target.value })}
        />
      </div>

      <div className="space-y-4">
        {content.faqs?.map((item, index) => (
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
