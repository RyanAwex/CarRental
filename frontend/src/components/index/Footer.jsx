import {
  Facebook,
  Home,
  Instagram,
  Locate,
  Mail,
  Phone,
  X,
} from "lucide-react";
import React from "react";

const Footer = ({ appData }) => {
  if (!appData) return <div className="h-screen bg-slate-900 animate-pulse" />;

  const { email, phone, address, twitter, facebook, instagram, description } =
    appData;

  return (
    <footer className="bg-gray-900 text-gray-300 border-t border-gray-800 dark:bg-[#05060A] dark:border-white/5 pt-12 sm:pt-20 pb-8 sm:pb-10">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12 mb-10 sm:mb-16">
        <div className="sm:col-span-2 lg:col-span-1">
          <div className="flex items-center gap-2 mb-4 sm:mb-6">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center font-bold text-white">
              R
            </div>
            <span className="text-xl font-bold text-white">
              Rent<span className="text-indigo-500">X</span>
            </span>
          </div>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            {description}
          </p>
        </div>

        {[
          { title: "Company", links: ["About Us", "Careers", "Blog", "Press"] },
          {
            title: "Support",
            links: [
              "Help Center",
              "Terms of Service",
              "Privacy Policy",
              "Fraud Alert",
            ],
          },
        ].map((col, i) => (
          <div key={i}>
            <h4 className="text-white font-bold mb-4 sm:mb-6">{col.title}</h4>
            <ul className="space-y-2 sm:space-y-3">
              {col.links.map((link) => (
                <li key={link}>
                  <a
                    href="#"
                    className="text-slate-400 hover:text-indigo-400 text-sm transition-colors"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div>
          <h4 className="text-white font-bold mb-4 sm:mb-6">Contact</h4>
          <div className="space-y-3 sm:space-y-4 text-slate-400 text-sm">
            <p className="flex items-center gap-3">
              <Locate size={18} className="text-indigo-500 shrink-0" />
              {address || "Address not set"}
            </p>
            <p className="flex items-center gap-3">
              <Phone size={18} className="text-indigo-500 shrink-0" /> {phone}
            </p>
            <p className="flex items-center gap-3">
              <Mail size={18} className="text-indigo-500 shrink-0" /> {email}
            </p>
            <div className="flex gap-3 sm:gap-4 mt-4 sm:mt-6">
              <a
                href={facebook}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:bg-indigo-600 hover:text-white transition-all"
              >
                <Facebook size={16} className="sm:w-4.5 sm:h-4.5" />
              </a>
              <a
                href={twitter}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:bg-indigo-600 hover:text-white transition-all"
              >
                <X size={16} className="sm:w-4.5 sm:h-4.5" />
              </a>
              <a
                href={instagram}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:bg-indigo-600 hover:text-white transition-all"
              >
                <Instagram size={16} className="sm:w-4.5 sm:h-4.5" />
              </a>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 text-center text-gray-500 dark:text-slate-600 text-xs border-t border-gray-800 dark:border-white/5 pt-6 sm:pt-8">
        © {new Date().getFullYear()} RentX Inc. All rights reserved. Designed
        for Luxury.
      </div>
    </footer>
  );
};

export default Footer;
