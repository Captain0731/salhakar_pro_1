import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { X, Sparkles, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../contexts/AuthContext";

const FreeTrialPopup = () => {
  const [showPopup, setShowPopup] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const intervalRef = useRef(null);

  // Check if user is logged in by checking token
  const isUserLoggedIn = () => {
    const token = localStorage.getItem('access_token') || 
                  localStorage.getItem('accessToken') || 
                  localStorage.getItem('token');
    return isAuthenticated && !!token && token !== 'null' && token !== 'undefined';
  };

  useEffect(() => {
    // Only show popup if user is NOT logged in
    if (isUserLoggedIn()) {
      // Clear any existing intervals if user logs in
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setShowPopup(false);
      return; // Don't show popup for logged-in users
    }

    // Show popup after 3 seconds initially
    const initialTimer = setTimeout(() => {
      if (!isUserLoggedIn()) {
        setShowPopup(true);
      }
    }, 3000);

    // Set up interval to show popup every 2 minutes (120000 ms)
    intervalRef.current = setInterval(() => {
      // Only show if user is still not logged in
      if (!isUserLoggedIn()) {
        setShowPopup(true);
      } else {
        // If user logged in, clear interval
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      }
    }, 120000); // 2 minutes

    return () => {
      clearTimeout(initialTimer);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isAuthenticated]);

  const handleClose = () => {
    setShowPopup(false);
    // Don't store dismissal in localStorage - we want it to show again after 2 minutes
    // The interval will handle showing it again
  };

  const handleGetStarted = () => {
    handleClose();
    navigate("/pricing");
  };

  return (
    <AnimatePresence>
      {showPopup && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={handleClose}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black bg-opacity-50" />

          {/* Popup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative z-10"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full relative overflow-hidden"
              style={{
                background: "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
              }}
            >
              {/* Close Button */}
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 z-10 p-2 rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Close popup"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>

              {/* Content */}
              <div className="p-6 sm:p-8">
                {/* Icon */}
                <div className="flex justify-center mb-4">
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center"
                    style={{
                      background: "linear-gradient(135deg, #1E65AD 0%, #CF9B63 100%)",
                    }}
                  >
                    <Sparkles className="w-8 h-8 text-white" />
                  </div>
                </div>

                {/* Title */}
                <h2
                  className="text-2xl sm:text-3xl font-bold text-center mb-3"
                  style={{ color: "#1E65AD", fontFamily: "'Bricolage Grotesque', sans-serif" }}
                >
                  Start Your Free Trial
                </h2>

                {/* Description */}
                <p
                  className="text-center text-gray-600 mb-6 text-sm sm:text-base"
                  style={{ fontFamily: "Roboto, sans-serif", lineHeight: "1.6" }}
                >
                  Unlock access to India's first AI-powered multilingual legal tech platform. 
                  Explore judgments, acts, law mapping, and more!
                </p>

                {/* Features List */}
                <ul className="space-y-2 mb-6">
                  {[
                    "Access to legal judgments & acts",
                    "AI-powered legal research",
                    "Multilingual support",
                    "Law mapping tools",
                  ].map((feature, index) => (
                    <li key={index} className="flex items-center text-sm sm:text-base text-gray-700">
                      <div
                        className="w-5 h-5 rounded-full mr-3 flex-shrink-0 flex items-center justify-center"
                        style={{ backgroundColor: "#E3F2FD" }}
                      >
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: "#1E65AD" }}
                        />
                      </div>
                      <span style={{ fontFamily: "Roboto, sans-serif" }}>{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <button
                  onClick={handleGetStarted}
                  className="w-full py-3 px-6 rounded-lg font-semibold text-white transition-all duration-300 transform hover:scale-105 hover:shadow-lg flex items-center justify-center gap-2"
                  style={{
                    background: "linear-gradient(135deg, #1E65AD 0%, #CF9B63 100%)",
                    fontFamily: "Roboto, sans-serif",
                  }}
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-5 h-5" />
                </button>

                {/* Optional: Small text */}
                <p
                  className="text-xs text-center text-gray-500 mt-4"
                  style={{ fontFamily: "Roboto, sans-serif" }}
                >
                  No credit card required
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FreeTrialPopup;

