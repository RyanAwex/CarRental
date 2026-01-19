import { create } from "zustand";
import { persist } from "zustand/middleware";
import supabase from "../config/supabase-client";
import { useCartStore } from "./carStore";

export const useAuthStore = create(
  persist(
    (set, get) => ({
      session: null,
      user: null,
      loading: true,
      isScrolled: false,

      // Initialize auth state
      initialize: async () => {
        try {
          const { data } = await supabase.auth.getSession();
          set({
            session: data.session,
            user: data.session?.user || null,
            loading: false,
          });

          // Load cart for current user
          if (data.session?.user?.id) {
            useCartStore.getState().loadCart(data.session.user.id);
          }

          // Listen for auth changes
          supabase.auth.onAuthStateChange((_event, session) => {
            set({
              session,
              user: session?.user || null,
            });

            // Load or clear cart based on auth state
            if (session?.user?.id) {
              useCartStore.getState().loadCart(session.user.id);
            } else {
              useCartStore.getState().clearCart();
            }
          });
        } catch (error) {
          console.error("Auth initialization error:", error);
          set({ loading: false });
        }
      },

      // Set scroll state
      setIsScrolled: (isScrolled) => set({ isScrolled }),

      // Sign out
      signOut: async () => {
        await supabase.auth.signOut();
        useCartStore.getState().clearCart();
        set({ session: null, user: null });
      },

      // Check if user is admin
      isAdmin: () => {
        const { user } = get();
        return user?.id === import.meta.env.VITE_ADMIN;
      },

      // Check if email is confirmed
      isEmailConfirmed: () => {
        const { session } = get();
        return !!session?.user?.email_confirmed_at;
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({ session: state.session, user: state.user }),
    }
  )
);
