import React from "react";

const ScrollToTopButton = ({ scrollContainerId }) => {
  const handleScrollTop = () => {
    const container = document.getElementById(scrollContainerId);
    if (container) {
      container.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };

  return (
    <button
      onClick={handleScrollTop}
      className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 
        text-white p-3 md:p-4 rounded-full shadow-lg 
        transition-all duration-300 flex items-center justify-center 
        bg-[#1E65AD] hover:bg-[#155a94]"
      style={{
        fontFamily: "Roboto, sans-serif",
      }}
      aria-label="Scroll to top"
    >
      <svg
        className="w-5 h-5 md:w-6 md:h-6 transition-transform duration-300 hover:-translate-y-1"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M5 10l7-7m0 0l7 7m-7-7v18" 
        />
      </svg>
    </button>
  );
};

export default ScrollToTopButton;

