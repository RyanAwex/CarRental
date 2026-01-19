import React, { useState, useEffect } from "react";
import { Sun, Moon } from "lucide-react";

const ThemeToggle = ({ className = "" }) => {
  const [isDark, setIsDark] = useState(() => {
    // Check localStorage first, then fall back to DOM class
    const saved = localStorage.getItem("theme");
    if (saved) {
      return saved === "dark";
    }
    return document.documentElement.classList.contains("dark");
  });

  // Apply theme on initial load and when isDark changes
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  return (
    <button
      onClick={toggleTheme}
      className={`relative p-2.5 rounded-xl transition-all  cursor-pointer group overflow-hidden ${className}`}
      aria-label="Toggle theme"
    >
      {/* Background glow effect */}
      <div className={`absolute inset-0 transition-opacity  `} />

      {/* Icons container */}
      <div className="relative w-5 h-5 hover:cursor-pointer">
        {/* Sun icon */}
        <Sun
          size={20}
          className={`absolute inset-0 transition-all hover:cursor-pointer  ${
            isDark ? "opacity-0 scale-0" : "opacity-100 text-black scale-100"
          }`}
        />
        {/* Moon icon */}
        <Moon
          size={20}
          className={`absolute inset-0 transition-all  ${
            isDark ? "opacity-100 scale-100" : "opacity-0  scale-0"
          }`}
        />
      </div>

      {/* Animated ring on hover */}
      <div className={`absolute inset-0 rounded-xl transition-all `} />
    </button>
  );
};

export default ThemeToggle;
