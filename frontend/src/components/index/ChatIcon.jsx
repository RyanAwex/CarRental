import { MessagesSquare, Phone, X } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import React from "react";

function ChatIcon() {
  const [contactOpen, setContactOpen] = React.useState(false);

  return (
    <>
      {/* Backdrop to close on outside click */}
      {contactOpen && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => setContactOpen(false)}
        />
      )}

      <div className="fixed bottom-7 right-5 flex items-center justify-center space-x-2 z-30">
        <div
          className={`w-14 h-14 bg-indigo-600 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl cursor-pointer transition-all duration-300 z-30 ${
            contactOpen
              ? "opacity-100 translate-x-0"
              : "opacity-0 translate-x-4 pointer-events-none"
          }`}
        >
          <FaWhatsapp size={26} color="white" />
        </div>

        <div
          className={`w-14 h-14 bg-indigo-600 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl cursor-pointer transition-all duration-300 z-50 ${
            contactOpen
              ? "opacity-100 translate-x-0"
              : "opacity-0 translate-x-4 pointer-events-none"
          }`}
        >
          <Phone color="white" />
        </div>

        <div
          className=" w-14 h-14 bg-indigo-600 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl cursor-pointer transition-shadow duration-300 z-30"
          onClick={() => setContactOpen(!contactOpen)}
        >
          {contactOpen ? <X color="white" /> : <MessagesSquare color="white" />}
        </div>
      </div>
    </>
  );
}

export default ChatIcon;
