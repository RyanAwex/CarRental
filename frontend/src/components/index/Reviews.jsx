import React, { useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, Star, User } from "lucide-react";
import { useReviewsStore } from "../../store/reviewsStore";

function Reviews() {
  const { reviews, reviewsLoading, reviewsError, fetchReviews } =
    useReviewsStore();
  const scrollRef = useRef(null);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 320; // Width of one review card + gap
      const newScrollLeft =
        scrollRef.current.scrollLeft +
        (direction === "left" ? -scrollAmount : scrollAmount);
      scrollRef.current.scrollTo({
        left: newScrollLeft,
        behavior: "smooth",
      });
    }
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={16}
        className={`${
          i < rating
            ? "text-yellow-400 fill-yellow-400"
            : "text-gray-300 dark:text-gray-600"
        }`}
      />
    ));
  };

  if (reviewsLoading) {
    return (
      <div className="py-16 bg-gray-50 dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-500 dark:text-slate-400">
              Loading reviews...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (reviewsError) {
    return (
      <div className="py-16 bg-gray-50 dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-red-600 dark:text-red-400">
              Error loading reviews: {reviewsError}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!reviews || reviews.length === 0) {
    return (
      <div className="py-16 bg-gray-50 dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Customer Reviews
            </h2>
            <p className="text-gray-500 dark:text-slate-400">
              No reviews yet. Be the first to share your experience!
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-16 bg-gray-50 dark:bg-slate-900/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            What Our Customers Say
          </h2>
          <p className="text-gray-500 dark:text-slate-400 max-w-2xl mx-auto">
            Read genuine reviews from our satisfied customers who have
            experienced our premium car rental service.
          </p>
        </div>

        <div className="relative">
          {/* Left Navigation Button */}
          <button
            onClick={() => scroll("left")}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white dark:bg-slate-800 shadow-lg hover:shadow-xl border border-gray-200 dark:border-slate-700 rounded-full p-3 text-gray-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all duration-200 hover:scale-105"
          >
            <ChevronLeft size={24} />
          </button>

          {/* Reviews Container */}
          <div
            ref={scrollRef}
            className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth px-12"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {reviews.map((review) => (
              <div
                key={review.id}
                className="shrink-0 w-80 bg-white dark:bg-slate-800 rounded-2xl shadow-lg hover:shadow-xl border border-gray-200 dark:border-slate-700 p-6"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-linear-to-tr from-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                    {review.user?.email?.charAt(0).toUpperCase() || (
                      <User size={20} />
                    )}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      {review.user?.email?.split("@")[0] || "Anonymous"}
                    </h4>
                    <div className="flex items-center gap-1">
                      {renderStars(review.rating)}
                    </div>
                  </div>
                </div>

                <p className="text-gray-600 dark:text-slate-300 leading-relaxed mb-4">
                  "{review.comment}"
                </p>

                <div className="text-sm text-gray-500 dark:text-slate-400">
                  {new Date(review.created_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Right Navigation Button */}
          <button
            onClick={() => scroll("right")}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white dark:bg-slate-800 shadow-lg hover:shadow-xl border border-gray-200 dark:border-slate-700 rounded-full p-3 text-gray-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all duration-200 hover:scale-105"
          >
            <ChevronRight size={24} />
          </button>
        </div>

        {/* View All Reviews Button */}
        {/* <div className="text-center mt-8">
          <button className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors duration-200">
            View All Reviews
          </button>
        </div> */}
      </div>
    </div>
  );
}

export default Reviews;
