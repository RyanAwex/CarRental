import React, { useEffect } from "react";
import Index from "./pages";
import Dashboard from "./pages/Dashboard";
import Fleet from "./pages/Fleet";
import { Route, Routes, useLocation } from "react-router-dom";
import Auth from "./pages/Auth";
import UserProfile from "./pages/UserProfile";
import Configuring from "./pages/Configuring";
import Checkout from "./pages/Checkout";
import { useAuthStore } from "./store/authStore";
import { useDataStore } from "./store/dataStore";
import { useReviewsStore } from "./store/reviewsStore";

// Scroll to top on route change
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function App() {
  const { initialize, setIsScrolled } = useAuthStore();
  const { fetchAll } = useDataStore();
  const { fetchReviews } = useReviewsStore();

  useEffect(() => {
    // Initialize auth and fetch data on app load
    initialize();
    fetchAll();
    fetchReviews();
  }, [initialize, fetchAll, fetchReviews]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [setIsScrolled]);

  return (
    <div className="bg-slate-950 min-h-screen text-slate-200 font-sans selection:bg-indigo-500 selection:text-white scroll-smooth">
      <ScrollToTop />
      <Routes>
        <Route index element={<Index />} />
        <Route path="/fleet" element={<Fleet />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/configuring" element={<Configuring />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/auth" element={<Auth />} />
      </Routes>
    </div>
  );
}

export default App;
