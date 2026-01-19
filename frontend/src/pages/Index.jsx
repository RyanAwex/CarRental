import React, { useEffect } from "react";
import Header from "../components/index/Header";
import Hero from "../components/index/Hero";
import Explanation from "../components/index/Explanation";
import WhyUs from "../components/index/WhyUs";
import Discovering from "../components/index/Discovering";
import Services from "../components/index/Services";
import Questions from "../components/index/Questions";
import Reviews from "../components/index/Reviews";
import Footer from "../components/index/Footer";
import { useCartStore } from "../store/carStore";
import { useAuthStore } from "../store/authStore";
import { useDataStore } from "../store/dataStore";
import ChatIcon from "../components/index/ChatIcon";

export default function Index() {
  const { cart } = useCartStore();
  const { session, isScrolled } = useAuthStore();
  const { cars, carsLoading, carsError, getSection } = useDataStore();

  const loading = carsLoading;
  const error = carsError;

  useEffect(() => {
    document.documentElement.classList.add("no-scrollbar");
    document.body.classList.add("no-scrollbar");
    return () => {
      document.documentElement.classList.remove("no-scrollbar");
      document.body.classList.remove("no-scrollbar");
    };
  }, []);

  return (
    <div className="relative bg-white text-gray-900 dark:bg-[#0B0E14] dark:text-white">
      <Header
        cartCount={cart ? 1 : 0}
        isScrolled={isScrolled}
        session={session}
      />

      <ChatIcon />

      <main>
        <Hero appData={getSection("hero")} />
        <Explanation appData={getSection("how_it_works")} loading={loading} />
        <WhyUs appData={getSection("why_choose_us")} loading={loading} />
        <Discovering cars={cars} error={error} loading={loading} />
        <Services
          appData={getSection("exclusive_services")}
          loading={loading}
        />
        <Reviews />
        <Questions appData={getSection("faq")} />
      </main>

      <Footer appData={getSection("footer")} />
    </div>
  );
}
