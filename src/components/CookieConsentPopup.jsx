import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { X, Cookie, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const CookieConsentPopup = () => {
  const [showPopup, setShowPopup] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user has already agreed to cookies
    const cookieConsent = localStorage.getItem("cookieConsent");
    if (!cookieConsent) {
      // Show popup after a short delay for better UX
      const timer = setTimeout(() => {
        setShowPopup(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAgree = () => {
    // Store consent in localStorage
    localStorage.setItem("cookieConsent", "true");
    localStorage.setItem("cookieConsentDate", new Date().toISOString());
    setShowPopup(false);
  };

  const handleCookiePolicy = () => {
    // Navigate to cookie policy page
    navigate("/cookie-policy");
    // Don't close the popup - let user read the policy and come back
  };

  if (!showPopup) {
    return null;
  }

  return (
    <AnimatePresence>
      {showPopup && (
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-6"
          style={{ pointerEvents: "auto" }}
        >
          <div
            className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl border border-gray-200 relative overflow-hidden"
            style={{
              background: "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
            }}
          >
            {/* Close Button */}
            <button
              onClick={handleAgree}
              className="absolute top-4 right-4 z-10 p-2 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Close popup"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>

            {/* Content */}
            <div className="p-6 sm:p-8 pr-12">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
                {/* Cookie Icon */}
                <div className="flex-shrink-0">
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center"
                    style={{
                      background: "linear-gradient(135deg, #1E65AD 0%, #CF9B63 100%)",
                    }}
                  >
                    <Cookie className="w-8 h-8 text-white" />
                  </div>
                </div>

                {/* Text Content */}
                <div className="flex-1">
                  <h3
                    className="text-lg sm:text-xl font-bold mb-2"
                    style={{ color: "#1E65AD", fontFamily: "'Bricolage Grotesque', sans-serif" }}
                  >
                    We Use Cookies
                  </h3>
                  <p
                    className="text-sm sm:text-base text-gray-700 mb-4"
                    style={{ fontFamily: "Roboto, sans-serif", lineHeight: "1.6" }}
                  >
                    We use cookies to enhance your browsing experience, analyze site traffic, and personalize content. 
                    By clicking "Agree", you consent to our use of cookies.{" "}
                    <button
                      onClick={handleCookiePolicy}
                      className="text-blue-600 hover:text-blue-800 underline font-medium"
                      style={{ fontFamily: "Roboto, sans-serif" }}
                    >
                      Learn more in our Cookie Policy
                    </button>
                  </p>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                    <button
                      onClick={handleAgree}
                      className="px-6 py-2.5 rounded-lg font-semibold text-white transition-all duration-300 transform hover:scale-105 hover:shadow-lg flex items-center justify-center gap-2 sm:flex-shrink-0"
                      style={{
                        background: "linear-gradient(135deg, #1E65AD 0%, #CF9B63 100%)",
                        fontFamily: "Roboto, sans-serif",
                        minWidth: "120px",
                      }}
                    >
                      <CheckCircle className="w-5 h-5" />
                      <span>Agree</span>
                    </button>
                    <button
                      onClick={handleCookiePolicy}
                      className="px-6 py-2.5 rounded-lg font-semibold border-2 transition-all duration-300 hover:bg-gray-50 flex items-center justify-center gap-2"
                      style={{
                        borderColor: "#1E65AD",
                        color: "#1E65AD",
                        fontFamily: "Roboto, sans-serif",
                        minWidth: "140px",
                      }}
                    >
                      <span>Cookie Policy</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CookieConsentPopup;

