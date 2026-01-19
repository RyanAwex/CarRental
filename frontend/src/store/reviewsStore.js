import { create } from "zustand";
import supabase from "../config/supabase-client";

export const useReviewsStore = create((set, get) => ({
  // Reviews data
  reviews: [],
  reviewsLoading: false,
  reviewsError: null,

  // Fetch all reviews
  fetchReviews: async () => {
    set({ reviewsLoading: true, reviewsError: null });
    try {
      // First fetch reviews
      const { data: reviewsData, error: reviewsError } = await supabase
        .from("reviews")
        .select("*")
        .order("created_at", { ascending: false });

      if (reviewsError) throw reviewsError;

      // Format the data to match the expected structure
      const reviewsWithUsers = (reviewsData || []).map((review) => ({
        ...review,
        user: {
          email: review.user_email || `User ${review.user_id.slice(0, 8)}...`,
        },
      }));

      set({ reviews: reviewsWithUsers, reviewsLoading: false });
    } catch (error) {
      set({ reviewsError: error.message, reviewsLoading: false });
    }
  },

  // Add a new review
  addReview: async (reviewData) => {
    try {
      // Get current user email to store with the review
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError) throw userError;

      const reviewWithUser = {
        ...reviewData,
        user_email: user?.email || "Anonymous",
      };

      const { data, error } = await supabase
        .from("reviews")
        .insert([reviewWithUser])
        .select()
        .single();

      if (error) throw error;

      // Refresh reviews
      await get().fetchReviews();
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Update a review
  updateReview: async (reviewId, updateData) => {
    try {
      const { data, error } = await supabase
        .from("reviews")
        .update(updateData)
        .eq("id", reviewId)
        .select()
        .single();

      if (error) throw error;

      // Refresh reviews
      await get().fetchReviews();
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Delete a review
  deleteReview: async (reviewId) => {
    try {
      const { error } = await supabase
        .from("reviews")
        .delete()
        .eq("id", reviewId);

      if (error) throw error;

      // Refresh reviews
      await get().fetchReviews();
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Get reviews for a specific user
  getUserReviews: (userId) => {
    return get().reviews.filter((review) => review.user_id === userId);
  },

  // Check if user can review a rental
  canReviewRental: async (userId, rentalId) => {
    try {
      // Check if rental is completed and user hasn't reviewed it yet
      const { data: rental, error: rentalError } = await supabase
        .from("rentals")
        .select("status")
        .eq("id", rentalId)
        .eq("user_id", userId)
        .single();

      if (rentalError) throw rentalError;

      if (rental.status !== "completed") {
        return { canReview: false, reason: "Rental is not completed yet" };
      }

      // Check if review already exists
      const { data: existingReview, error: reviewError } = await supabase
        .from("reviews")
        .select("id")
        .eq("user_id", userId)
        .eq("rental_id", rentalId);

      if (reviewError) {
        throw reviewError;
      }

      if (existingReview && existingReview.length > 0) {
        return {
          canReview: false,
          reason: "You have already reviewed this rental",
        };
      }

      return { canReview: true };
    } catch (error) {
      return { canReview: false, reason: error.message };
    }
  },

  // Refresh reviews
  refreshReviews: async () => {
    set({ reviews: [], reviewsError: null });
    await get().fetchReviews();
  },
}));
