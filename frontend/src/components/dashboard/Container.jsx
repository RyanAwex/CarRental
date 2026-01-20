import React, { useState } from "react";
import {
  LayoutDashboard,
  Car,
  ImageIcon,
  List,
  HelpCircle,
  Type,
  Settings,
  LogOut,
  CircleQuestionMark,
  Gem,
  ClipboardList,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  MessageSquare,
} from "lucide-react";

// Import your sub-components
import FleetManager from "./FleetManager";
import BookingsManager from "./BookingsManager";
import HeroEditor from "./HeroEditor";
import HowItWorksEditor from "./HowItWorksEditor";
import FAQEditor from "./FAQEditor";
import FooterEditor from "./FooterEditor";
import WhyChooseUs from "./WhyChooseUs";
import ExclusiveServices from "./ExclusiveServices";
import PromotionsEditor from "./PromotionsEditor";
import ReviewsManager from "./ReviewsManager";
import supabase from "../../config/supabase-client";
import { Link, useNavigate } from "react-router-dom";

export default function Container() {
  const [activeTab, setActiveTab] = useState("bookings");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const navigate = useNavigate();

  const menuItems = [
    { id: "bookings", label: "Bookings", icon: <ClipboardList size={20} /> },
    { id: "fleet", label: "Fleet Management", icon: <Car size={20} /> },
    {
      id: "promotions",
      label: "Promotions & Add-ons",
      icon: <Sparkles size={20} />,
    },
    { id: "reviews", label: "Reviews", icon: <MessageSquare size={20} /> },
    { id: "hero", label: "Hero Section", icon: <ImageIcon size={20} /> },
    { id: "howitworks", label: "How It Works", icon: <List size={20} /> },
    {
      id: "whychooseus",
      label: "Why Choose Us",
      icon: <CircleQuestionMark size={20} />,
    },
    {
      id: "exclusiveservices",
      label: "Exclusive Services",
      icon: <Gem size={20} />,
    },
    { id: "faq", label: "FAQ Section", icon: <HelpCircle size={20} /> },
    { id: "footer", label: "Footer & Contact", icon: <Type size={20} /> },
  ];

  const handleLogout = () => {
    supabase.auth.signOut();
    navigate("/");
  };

  const handleTabChange = (id) => {
    setActiveTab(id);
    setSidebarOpen(false); // Close sidebar on mobile after selection
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f172a] text-gray-900 dark:text-slate-100 font-sans">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full bg-white dark:bg-gradient-to-b dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 border-r border-gray-200 dark:border-white/5 flex flex-col z-50 transition-all  shadow-2xl ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 ${sidebarCollapsed ? "lg:w-20" : "lg:w-64"} w-72`}
      >
        {/* Sidebar Header */}
        <div className="p-4 lg:p-6 border-b border-gray-200 dark:border-white/5 flex items-center justify-between bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-600/10 dark:to-purple-600/10">
          <div className={`${sidebarCollapsed ? "lg:hidden" : ""}`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/30">
                R
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
                  Rent
                  <span className="text-indigo-600 dark:text-indigo-400">
                    X
                  </span>
                </h1>
                <p className="text-[10px] text-gray-500 dark:text-slate-500 uppercase tracking-widest font-semibold">
                  Admin Panel
                </p>
              </div>
            </div>
          </div>
          {sidebarCollapsed && (
            <div className="hidden lg:flex w-full justify-center">
              <div className="w-10 h-10 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/30">
                R
              </div>
            </div>
          )}
          {/* Mobile Close Button */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 rounded-xl transition-all"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 lg:p-4 space-y-1 overflow-y-auto custom-scrollbar">
          <div
            className={`text-[10px] font-bold text-gray-400 dark:text-slate-600 uppercase px-3 mb-3 mt-2 tracking-widest ${
              sidebarCollapsed ? "lg:hidden" : ""
            }`}
          >
            Main Menu
          </div>
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleTabChange(item.id)}
              title={sidebarCollapsed ? item.label : ""}
              className={`group w-full flex text-left items-center gap-3 px-3 lg:px-4 py-3 rounded-xl transition-all  font-medium ${
                activeTab === item.id
                  ? "bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-lg shadow-indigo-600/30"
                  : "text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white"
              } ${sidebarCollapsed ? "lg:justify-center lg:px-2" : ""}`}
            >
              <span
                className={`shrink-0 transition-transform  text-left ${
                  activeTab !== item.id ? "group-hover:scale-110" : ""
                }`}
              >
                {item.icon}
              </span>
              <span className={`${sidebarCollapsed ? "lg:hidden" : ""}`}>
                {item.label}
              </span>
              {activeTab === item.id && !sidebarCollapsed && (
                <span className="ml-auto w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
              )}
            </button>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-3 lg:p-4 border-t border-gray-200 dark:border-slate-700 space-y-2">
          {/* Collapse Toggle (Desktop Only) - Styled like sign out */}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className={`hidden lg:flex w-full items-center gap-3 px-3 lg:px-4 py-3 text-gray-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-xl transition-all font-medium ${
              sidebarCollapsed ? "lg:justify-center lg:px-2" : ""
            }`}
            title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {sidebarCollapsed ? (
              <ChevronRight size={20} />
            ) : (
              <>
                <ChevronLeft size={20} />
                <span>Collapse</span>
              </>
            )}
          </button>
          <button
            className={`w-full flex items-center gap-3 px-3 lg:px-4 py-3 text-gray-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors font-medium ${
              sidebarCollapsed ? "lg:justify-center lg:px-2" : ""
            }`}
            onClick={handleLogout}
            title={sidebarCollapsed ? "Logout" : ""}
          >
            <LogOut size={20} />
            <span className={`${sidebarCollapsed ? "lg:hidden" : ""}`}>
              Logout
            </span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main
        className={`min-h-screen transition-all  ${
          sidebarCollapsed ? "lg:ml-20" : "lg:ml-64"
        }`}
      >
        {/* Top Header - Modern Design */}
        <header className="sticky top-0 z-30 bg-white/95 dark:bg-gradient-to-r dark:from-slate-900/95 dark:via-slate-900/90 dark:to-slate-950/95 backdrop-blur-xl border-b border-gray-200 dark:border-white/5 shadow-sm dark:shadow-lg dark:shadow-black/10">
          <div className="flex justify-between items-center p-4 lg:px-8 lg:py-5">
            <div className="flex items-center gap-4">
              {/* Hamburger Menu Button - Only on mobile */}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2.5 text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 rounded-xl transition-all border border-gray-200 dark:border-white/5"
              >
                <Menu size={22} />
              </button>
              <div>
                <h2 className="text-lg lg:text-2xl font-bold text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
                  <span className="hidden sm:flex w-10 h-10 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-xl items-center justify-center shadow-lg shadow-indigo-500/20">
                    {menuItems.find((i) => i.id === activeTab)?.icon}
                  </span>
                  {menuItems.find((i) => i.id === activeTab)?.label}
                </h2>
                <p className="text-gray-500 dark:text-slate-500 text-xs lg:text-sm hidden sm:block mt-0.5">
                  Manage your website content and inventory
                </p>
              </div>
            </div>
            <Link
              to={"/"}
              className="px-4 py-2.5 lg:px-5 lg:py-3 rounded-3xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 flex items-center justify-center gap-2 font-bold text-white text-sm shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all"
            >
              <span className="hidden sm:inline">Go to</span> Home
            </Link>
          </div>
        </header>

        {/* Dynamic Content */}
        <div className="p-4 lg:p-8 animate-in fade-in ">
          {activeTab === "bookings" && <BookingsManager />}
          {activeTab === "fleet" && <FleetManager />}
          {activeTab === "promotions" && <PromotionsEditor />}
          {activeTab === "reviews" && <ReviewsManager />}
          {activeTab === "hero" && <HeroEditor />}
          {activeTab === "howitworks" && <HowItWorksEditor />}
          {activeTab === "whychooseus" && <WhyChooseUs />}
          {activeTab === "exclusiveservices" && <ExclusiveServices />}
          {activeTab === "faq" && <FAQEditor />}
          {activeTab === "footer" && <FooterEditor />}
        </div>
      </main>
    </div>
  );
}
