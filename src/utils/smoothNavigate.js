/**
 * Smooth navigation utility
 * Provides smooth scroll and fade transitions when navigating
 */

export const smoothNavigate = (navigate, direction = 1, options = {}) => {
  const { 
    scrollBehavior = 'smooth',
    fadeDuration = 150,
    scrollDuration = 400 
  } = options;

  // Smooth scroll to top function
  const scrollToTop = () => {
    // Smooth scroll window
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: scrollBehavior
    });

    // Also reset any scroll containers
    const scrollContainers = [
      document.getElementById('main-scroll-area'),
      document.getElementById('chatbot-scroll-area'),
      document.querySelector('[data-scroll-container]')
    ];

    scrollContainers.forEach(container => {
      if (container) {
        container.scrollTo({
          top: 0,
          left: 0,
          behavior: scrollBehavior
        });
      }
    });

    // Smooth scroll for document elements using animation
    const smoothScrollAnimation = () => {
      const currentScroll = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop;
      if (currentScroll > 0) {
        window.requestAnimationFrame(smoothScrollAnimation);
        window.scrollTo(0, currentScroll - (currentScroll / 8));
        document.documentElement.scrollTop = currentScroll - (currentScroll / 8);
        document.body.scrollTop = currentScroll - (currentScroll / 8);
      }
    };
    
    // Start smooth scroll animation
    smoothScrollAnimation();
  };

  // Start smooth scroll immediately
  scrollToTop();

  // Navigate after a short delay for smooth transition
  setTimeout(() => {
    if (direction === -1) {
      navigate(-1);
    } else if (typeof direction === 'string') {
      navigate(direction, options);
    } else {
      navigate(direction);
    }

    // Ensure scroll to top after navigation completes
    setTimeout(() => {
      scrollToTop();
    }, 100);
  }, fadeDuration);
};

/**
 * React hook for smooth navigation
 */
export const useSmoothNavigate = (navigate) => {
  const smoothNav = (direction = 1, options = {}) => {
    smoothNavigate(navigate, direction, options);
  };

  const smoothGoBack = (options = {}) => {
    smoothNavigate(navigate, -1, options);
  };

  return { smoothNav, smoothGoBack };
};

