import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  ShoppingBag,
  Home,
  Car,
  Settings,
  ChevronLeft,
  ArrowLeft,
  Globe,
} from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { useCartStore } from "../../store/carStore";
import ThemeToggle from "./ThemeToggle";
import LanguageButton from "./LanguageButton";

const SharedHeader = ({
  title,
  subtitle,
  showBackButton = false,
  backTo = "/",
  showCart = true,
  showNav = true,
  transparent = false,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isScrolled, isAdmin, isEmailConfirmed } = useAuthStore();
  const { cart } = useCartStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const cartCount = cart ? 1 : 0;
  const isHomePage = location.pathname === "/";
  const isProfilePage = location.pathname === "/profile";
  const isConfigurePage = location.pathname === "/configuring";

  // Progress steps for configuring/checkout flow
  const getProgressStep = () => {
    if (location.pathname === "/configuring") return 1;
    if (location.pathname === "/checkout") return 2;
    return 0;
  };

  const progressStep = getProgressStep();

  return (
    <>
      <nav
        className={`fixed w-full z-50 top-0 transition-all  ${
          transparent && !isScrolled
            ? "bg-transparent py-4"
            : "bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl py-3 border-b border-gray-200 dark:border-white/5 shadow-lg shadow-black/5 dark:shadow-black/20"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            {/* Left Section */}
            <div className="flex items-center gap-4">
              {showBackButton ? (
                <button
                  onClick={() => navigate(backTo)}
                  className="flex items-center  cursor-pointer gap-2 text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white transition-all group"
                >
                  <div className="p-2 rounded-xl bg-gray-100 dark:bg-white/5 group-hover:bg-gray-200 dark:group-hover:bg-white/10 transition-all">
                    <ArrowLeft size={18} />
                  </div>
                  <span className="hidden sm:block text-sm font-medium">
                    Back
                  </span>
                </button>
              ) : (
                <Link to="/" className="flex items-center gap-2 cursor-pointer">
                  <div className="w-10 h-10 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/20">
                    R
                  </div>
                  <span className="text-xl font-bold tracking-wide text-gray-900 dark:text-white">
                    Rent
                    <span className="text-indigo-600 dark:text-indigo-400">
                      X
                    </span>
                  </span>
                </Link>
              )}

              {/* Title & Subtitle for booking flow */}
              {title && (
                <div className="hidden sm:block ml-4 pl-4 border-l border-gray-200 dark:border-white/10">
                  <h1 className="text-gray-900 dark:text-white font-bold text-sm">
                    {title}
                  </h1>
                  {subtitle && (
                    <p className="text-gray-500 dark:text-slate-400 text-xs">
                      {subtitle}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Center - Progress Indicator (for booking flow) */}
            {progressStep > 0 && (
              <div className="hidden sm:flex items-center gap-2 ">
                <div className="flex items-center gap-1 md:gap-2">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      progressStep >= 1
                        ? "bg-indigo-600 text-white"
                        : "bg-gray-100 dark:bg-white/10 text-gray-400 dark:text-slate-500"
                    }`}
                  >
                    1
                  </div>
                  <span
                    className={`text-sm ${
                      progressStep >= 1
                        ? "text-gray-900 dark:text-white"
                        : "text-gray-400 dark:text-slate-500"
                    }`}
                  >
                    Configure
                  </span>
                </div>
                <div
                  className={`w-5 md:w-12 h-0.5 ${
                    progressStep >= 2
                      ? "bg-indigo-600"
                      : "bg-gray-200 dark:bg-white/10"
                  }`}
                />
                <div className="flex items-center gap-1 md:gap-2">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      progressStep >= 2
                        ? "bg-indigo-600 text-white"
                        : "bg-gray-100 dark:bg-white/10 text-gray-400 dark:text-slate-500"
                    }`}
                  >
                    2
                  </div>
                  <span
                    className={`text-sm ${
                      progressStep >= 2
                        ? "text-gray-900 dark:text-white"
                        : "text-gray-400 dark:text-slate-500"
                    }`}
                  >
                    Checkout
                  </span>
                </div>
              </div>
            )}

            {/* Desktop Nav (only on home page) */}
            {showNav && isHomePage && (
              <div className="hidden md:flex space-x-8 bg-gray-100 dark:bg-white/5 px-6 py-2 rounded-full border border-gray-200 dark:border-white/5 backdrop-blur-sm">
                {["Home", "Fleet", "Services", "FAQ"].map((item) => (
                  <a
                    key={item}
                    href={`#${item.toLowerCase()}`}
                    className="text-sm font-medium text-gray-600 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white hover:scale-105 transition-all"
                  >
                    {item}
                  </a>
                ))}
              </div>
            )}

            {/* Right Section - Actions */}
            <div className="flex items-center gap-3">
              {/* Cart Button */}
              {!isConfigurePage && showCart && (
                <Link
                  to={cart ? "/configuring" : "#fleet"}
                  className="relative p-2.5 text-black dark:text-slate-300 hover:text-gray-900 dark:hover:text-white transition-colors group rounded-xl hover:bg-gray-100 dark:hover:bg-white/5"
                >
                  <ShoppingBag
                    size={20}
                    className="group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors"
                  />
                  {cartCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-indigo-500 rounded-full text-[10px] font-bold flex items-center justify-center text-white border-2 border-white dark:border-slate-950">
                      {cartCount}
                    </span>
                  )}
                </Link>
              )}

              <LanguageButton />

              {/* Theme Toggle */}
              <ThemeToggle />

              {/* Auth Button */}
              {isEmailConfirmed() ? (
                isAdmin() ? (
                  <Link
                    to="/dashboard"
                    className="hidden sm:flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-500 hover:to-purple-500 px-5 py-2.5 rounded-full text-sm font-bold transition-all shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40"
                  >
                    <Settings size={16} />
                    Admin
                  </Link>
                ) : (
                  !isProfilePage && (
                    <Link
                      to="/profile"
                      className="hidden sm:flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-500 hover:to-purple-500 px-5 py-2.5 rounded-full text-sm font-bold transition-all shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40"
                    >
                      Profile
                    </Link>
                  )
                )
              ) : (
                <Link
                  to="/auth"
                  className="hidden sm:block bg-gray-900 dark:bg-white text-white dark:text-slate-900 hover:bg-gray-800 dark:hover:bg-slate-100 px-5 py-2.5 rounded-full text-sm font-bold transition-all"
                >
                  Login
                </Link>
              )}

              {/* Mobile Menu Button - Hidden on Profile Page */}
              {!isProfilePage && (
                <button
                  className="sm:hidden cursor-pointer text-gray-900 dark:text-white p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                  {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="sm:hidden absolute top-full left-0 right-0 bg-white dark:bg-slate-950 border-b border-gray-200 dark:border-white/10 p-4 space-y-2 z-40">
            {isHomePage && (
              <>
                {["Home", "Fleet", "Services", "FAQ"].map((item) => (
                  <a
                    key={item}
                    href={`#${item.toLowerCase()}`}
                    className="block px-4 py-3 cursor-pointer text-gray-600 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl transition-all"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item}
                  </a>
                ))}
                <hr className="border-gray-200 dark:border-white/10 my-2" />
              </>
            )}
            {isEmailConfirmed() ? (
              isAdmin() ? (
                <Link
                  to="/dashboard"
                  className="block px-4 py-3 text-white bg-indigo-600 rounded-xl font-bold text-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Admin Panel
                </Link>
              ) : (
                !isProfilePage && (
                  <Link
                    to="/profile"
                    className="block px-4 py-3 text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl font-bold text-center shadow-lg shadow-indigo-500/25"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Profile
                  </Link>
                )
              )
            ) : (
              <Link
                to="/auth"
                className="block px-4 py-3 text-white bg-gray-900 dark:bg-white dark:text-black rounded-xl font-bold text-center"
                onClick={() => setMobileMenuOpen(false)}
              >
                Login
              </Link>
            )}
          </div>
        )}
      </nav>

      {/* Spacer for fixed header */}
      <div className={transparent ? "" : "h-16"} />
    </>
  );
};

export default SharedHeader;
