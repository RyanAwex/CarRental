import { create } from "zustand";
import supabase from "../config/supabase-client";

export const useDataStore = create((set, get) => ({
  // Cars data
  cars: [],
  carsLoading: false,
  carsError: null,

  // Site content data
  siteContent: [],
  contentLoading: false,
  contentError: null,

  // Free days tiers data
  freeDaysTiers: [],
  freeDaysTiersLoading: false,
  freeDaysTiersError: null,

  // Insurance options data
  insuranceOptions: [],
  insuranceOptionsLoading: false,
  insuranceOptionsError: null,

  // Combined loading state
  isLoading: () =>
    get().carsLoading ||
    get().contentLoading ||
    get().freeDaysTiersLoading ||
    get().insuranceOptionsLoading,

  // Fetch cars from Supabase
  fetchCars: async () => {
    // Don't refetch if we already have data
    if (get().cars.length > 0 && !get().carsError) return;

    set({ carsLoading: true, carsError: null });
    try {
      const { data, error } = await supabase
        .from("cars")
        .select("*")
        .order("created_at", { ascending: true });

      if (error) throw error;
      set({ cars: data || [], carsLoading: false });
    } catch (error) {
      set({ carsError: error, carsLoading: false });
    }
  },

  // Fetch site content from Supabase
  fetchSiteContent: async () => {
    // Don't refetch if we already have data
    if (get().siteContent.length > 0 && !get().contentError) return;

    set({ contentLoading: true, contentError: null });
    try {
      const { data, error } = await supabase.from("site_content").select("*");

      if (error) throw error;
      set({ siteContent: data || [], contentLoading: false });
    } catch (error) {
      set({ contentError: error, contentLoading: false });
    }
  },

  // Fetch free days tiers from Supabase
  fetchFreeDaysTiers: async () => {
    // Don't refetch if we already have data
    if (get().freeDaysTiers.length > 0 && !get().freeDaysTiersError) return;

    set({ freeDaysTiersLoading: true, freeDaysTiersError: null });
    try {
      const { data, error } = await supabase
        .from("free_days_tiers")
        .select("*")
        .order("min_days", { ascending: true });

      if (error) throw error;
      set({ freeDaysTiers: data || [], freeDaysTiersLoading: false });
    } catch (error) {
      set({ freeDaysTiersError: error, freeDaysTiersLoading: false });
    }
  },

  // Calculate free days based on rental duration
  calculateFreeDays: (rentalDays) => {
    const tiers = get().freeDaysTiers;
    if (!tiers.length || rentalDays < 1) return 0;

    // Find the highest tier that applies (sorted ascending, so iterate backwards)
    let freeDays = 0;
    for (const tier of tiers) {
      if (rentalDays >= tier.min_days) {
        freeDays = tier.free_days;
      }
    }
    return freeDays;
  },

  // Fetch insurance options from Supabase
  fetchInsuranceOptions: async () => {
    // Don't refetch if we already have data
    if (get().insuranceOptions.length > 0 && !get().insuranceOptionsError)
      return;

    set({ insuranceOptionsLoading: true, insuranceOptionsError: null });
    try {
      const { data, error } = await supabase
        .from("insurance_options")
        .select("*")
        .order("price_per_day", { ascending: true });

      if (error) throw error;
      set({ insuranceOptions: data || [], insuranceOptionsLoading: false });
    } catch (error) {
      set({ insuranceOptionsError: error, insuranceOptionsLoading: false });
    }
  },

  // Refresh insurance options (force refetch)
  refreshInsuranceOptions: async () => {
    set({ insuranceOptions: [], insuranceOptionsError: null });
    await get().fetchInsuranceOptions();
  },

  // Fetch all data
  fetchAll: async () => {
    await Promise.all([
      get().fetchCars(),
      get().fetchSiteContent(),
      get().fetchFreeDaysTiers(),
      get().fetchInsuranceOptions(),
    ]);
  },

  // Get content by section key and language
  getSection: (sectionKey) => {
    const content = get().siteContent.find(
      (item) => item.section_key === sectionKey,
    );
    if (!content?.content) return null;

    // Footer is a special case (flat, not per-language)
    if (sectionKey === "footer") {
      const lang = localStorage.getItem("lang") || "eg";
      let description =
        content.content[`${lang}_description`] ||
        content.content["eg_description"] ||
        "";
      return { ...content.content, description };
    }

    // For all other sections, return the language-specific object, but always include shared image fields
    const lang = localStorage.getItem("lang") || "eg";
    const langObj = content.content[lang] || content.content["eg"] || {};
    // Find all shared fields (e.g., imageUrl, etc.)
    const sharedFields = {};
    Object.keys(content.content).forEach((key) => {
      if (!["ar", "eg", "fr"].includes(key)) {
        sharedFields[key] = content.content[key];
      }
    });
    return { ...langObj, ...sharedFields };
  },

  // Refresh cars (force refetch)
  refreshCars: async () => {
    set({ cars: [], carsError: null });
    await get().fetchCars();
  },

  // Refresh site content (force refetch)
  refreshSiteContent: async () => {
    set({ siteContent: [], contentError: null });
    await get().fetchSiteContent();
  },

  // Refresh free days tiers (force refetch)
  refreshFreeDaysTiers: async () => {
    set({ freeDaysTiers: [], freeDaysTiersError: null });
    await get().fetchFreeDaysTiers();
  },
}));
