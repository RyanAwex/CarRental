import { Menu, ShoppingBag, X } from "lucide-react";
import React, { useState } from "react";
import { Link } from "react-router-dom";
import ThemeToggle from "../shared/ThemeToggle";

const Header = ({ cartCount, isScrolled, session }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = ["Home", "Fleet", "Services", "FAQ"];

  const toggleMobileMenu = () => {
    setMobileMenuOpen((prev) => !prev);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <>
      <nav
        className={`fixed w-full z-40 top-0 transition-all  ${
          isScrolled
            ? "bg-white/80 border-b border-gray-200 dark:bg-slate-950/90 backdrop-blur-xl py-2 shadow-2xl shadow-black/20 dark:border-white/5"
            : "bg-linear-to-b from-white/80 to-transparent dark:from-slate-950/80 dark:to-transparent py-4"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <Link
              to="/"
              className="flex items-center gap-3 cursor-pointer group"
            >
              <div className="w-10 h-10 bg-linear-to-tr from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/30 group-hover:shadow-indigo-500/50 transition-all  group-hover:scale-105">
                R
              </div>
              <span className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                Rent
                <span className="text-transparent bg-clip-text bg-linear-to-r from-indigo-400 to-purple-400">
                  X
                </span>
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center space-x-1 bg-gray-100 dark:bg-white/5 px-2 py-1.5 rounded-full border border-gray-200 dark:border-white/10 backdrop-blur-md">
              {navItems.map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-white/10 rounded-full transition-all "
                >
                  {item}
                </a>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <Link
                to="/configuring"
                className="relative p-2.5 text-gray-700 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-white transition-all  rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 group"
              >
                <ShoppingBag
                  size={20}
                  className="group-hover:text-indigo-400 transition-colors"
                />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-linear-to-r from-indigo-500 to-purple-500 rounded-full text-[10px] font-bold flex items-center justify-center text-white border-2 border-slate-950 animate-pulse">
                    {cartCount}
                  </span>
                )}
              </Link>
              <ThemeToggle />
              {session?.user?.email_confirmed_at ? (
                session.user.id === import.meta.env.VITE_ADMIN ? (
                  <Link
                    to="/dashboard"
                    className="hidden md:flex items-center gap-2 bg-linear-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-500 hover:to-purple-500 px-5 py-2.5 rounded-full text-sm font-bold transition-all shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40"
                  >
                    Admin Panel
                  </Link>
                ) : (
                  <Link
                    to="/profile"
                    className="hidden md:flex items-center gap-2 bg-linear-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-500 hover:to-purple-500 px-5 py-2.5 rounded-full text-sm font-bold transition-all shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40"
                  >
                    Profile
                  </Link>
                )
              ) : (
                <Link
                  to="/auth"
                  className="hidden md:flex items-center gap-2 bg-indigo-600 text-white hover:bg-indigo-700 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 px-5 py-2.5 rounded-full text-sm font-bold transition-all shadow-lg shadow-indigo-500/25 dark:shadow-white/10"
                >
                  Login
                </Link>
              )}
              {/* Hamburger Menu Button */}
              <button
                type="button"
                onClick={toggleMobileMenu}
                className="md:hidden text-gray-900 dark:text-white p-2.5 hover:bg-gray-100 dark:hover:bg-white/10 rounded-xl transition-all  relative z-50"
                aria-label="Toggle menu"
              >
                <div className="relative w-5 h-5 flex items-center justify-center">
                  <Menu
                    size={22}
                    className={`absolute transition-all  ${
                      mobileMenuOpen
                        ? "opacity-0 rotate-90 scale-50"
                        : "opacity-100 rotate-0 scale-100"
                    }`}
                  />
                  <X
                    size={22}
                    className={`absolute transition-all  ${
                      mobileMenuOpen
                        ? "opacity-100 rotate-0 scale-100"
                        : "opacity-0 -rotate-90 scale-50"
                    }`}
                  />
                </div>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden transition-opacity  ${
          mobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={closeMobileMenu}
      />

      {/* Mobile Menu Slide-in */}
      <div
        className={`fixed top-0 right-0 h-full w-72 bg-linear-to-b from-white to-gray-50 dark:from-slate-900 dark:to-slate-950 z-50 transform transition-transform  ease-out md:hidden border-l border-gray-200 dark:border-white/10 shadow-2xl ${
          mobileMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-8">
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              Rent
              <span className="text-transparent bg-clip-text bg-linear-to-r from-indigo-400 to-purple-400">
                X
              </span>
            </span>
            <button
              type="button"
              onClick={closeMobileMenu}
              className="text-gray-500 hover:text-gray-900 dark:text-slate-400 dark:hover:text-white p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-xl transition-all"
              aria-label="Close menu"
            >
              <X size={22} />
            </button>
          </div>

          <div className="space-y-1">
            {navItems.map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                onClick={closeMobileMenu}
                className="flex items-center gap-3 text-base font-medium text-gray-700 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 py-3 px-4 rounded-xl transition-all"
              >
                <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full" />
                {item}
              </a>
            ))}
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-white/10 space-y-3">
            <Link
              to="/configuring"
              onClick={closeMobileMenu}
              className="flex items-center justify-between w-full bg-gray-100 text-gray-900 dark:bg-white/5 dark:text-white px-4 py-3 rounded-xl text-sm font-medium hover:bg-gray-200 dark:hover:bg-white/10 transition-all border border-gray-200 dark:border-white/5"
            >
              <span className="flex items-center gap-3">
                <ShoppingBag size={18} />
                Cart
              </span>
              {cartCount > 0 && (
                <span className="w-6 h-6 bg-linear-to-r from-indigo-500 to-purple-500 rounded-full text-[10px] font-bold flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
            {session?.user?.email_confirmed_at ? (
              session.user.id === import.meta.env.VITE_ADMIN ? (
                <Link
                  to="/dashboard"
                  onClick={closeMobileMenu}
                  className="block w-full bg-linear-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-500 hover:to-purple-500 px-4 py-3 rounded-xl text-center text-sm font-bold transition-all shadow-lg shadow-indigo-500/25"
                >
                  Admin Panel
                </Link>
              ) : (
                <Link
                  to="/profile"
                  onClick={closeMobileMenu}
                  className="block w-full bg-linear-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-500 hover:to-purple-500 px-4 py-3 rounded-xl text-center text-sm font-bold transition-all shadow-lg shadow-indigo-500/25"
                >
                  Profile
                </Link>
              )
            ) : (
              <Link
                to="/auth"
                onClick={closeMobileMenu}
                className="block w-full bg-indigo-600 text-white hover:bg-indigo-700 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 px-4 py-3 rounded-xl text-center text-sm font-bold transition-all"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Header;
