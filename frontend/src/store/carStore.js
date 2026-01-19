import { create } from "zustand";
import supabase from "../config/supabase-client";

// Cart store: holds only one car and its related data, synced with Supabase per user
export const useCartStore = create((set, get) => ({
  cart: null, // Holds the selected car object or null
  data: null, // Holds additional data (e.g., configuration, user info, etc.)
  loading: false,
  userId: null, // Track current user

  // Load cart from Supabase for the current user
  loadCart: async (userId) => {
    if (!userId) {
      set({ cart: null, data: null, userId: null });
      return;
    }

    // If same user, don't reload
    if (get().userId === userId) return;

    set({ loading: true });
    try {
      const { data, error } = await supabase
        .from("user_carts")
        .select("cart_data")
        .eq("user_id", userId)
        .maybeSingle();

      if (error) {
        console.error("Error loading cart:", error);
      }

      set({
        cart: data?.cart_data?.cart || null,
        data: data?.cart_data?.data || null,
        userId,
        loading: false,
      });
    } catch (err) {
      console.error("Error loading cart:", err);
      set({ loading: false });
    }
  },

  // Add a car and its data to the cart (replaces any existing car)
  addToCart: async (car, data = null) => {
    const userId = get().userId;
    set({ cart: car, data });

    if (userId) {
      try {
        await supabase.from("user_carts").upsert(
          {
            user_id: userId,
            cart_data: { cart: car, data },
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id" }
        );
      } catch (err) {
        console.error("Error saving cart:", err);
      }
    }
  },

  // Remove the car and its data from the cart
  removeFromCart: async () => {
    const userId = get().userId;
    set({ cart: null, data: null });

    if (userId) {
      try {
        await supabase.from("user_carts").delete().eq("user_id", userId);
      } catch (err) {
        console.error("Error removing cart:", err);
      }
    }
  },

  // Update cart data only
  updateCartData: async (newData) => {
    const { cart, userId } = get();
    set({ data: newData });

    if (userId) {
      try {
        await supabase.from("user_carts").upsert(
          {
            user_id: userId,
            cart_data: { cart, data: newData },
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id" }
        );
      } catch (err) {
        console.error("Error updating cart data:", err);
      }
    }
  },

  // Clear cart when user logs out
  clearCart: () => set({ cart: null, data: null, userId: null }),
}));
