import React, { useEffect, useRef } from 'react';

/**
 * ScrollOverlapWrapper - Manages the overlap scroll animation between Hero and next section
 * Hero stays fixed, next section slides up and overlaps smoothly
 */
const ScrollOverlapWrapper = ({ children }) => {
  const heroRef = useRef(null);
  const nextSectionRef = useRef(null);
  const spacerRef = useRef(null);

  useEffect(() => {
    // Get actual section elements
    const getElements = () => {
      const heroWrapper = heroRef.current;
      const nextSectionWrapper = nextSectionRef.current;
      
      if (!heroWrapper || !nextSectionWrapper) return null;
      
      const heroEl = heroWrapper.querySelector('.hero-section') || heroWrapper.querySelector('section') || heroWrapper.firstElementChild;
      const nextEl = nextSectionWrapper.querySelector('.next-section') || nextSectionWrapper.querySelector('section') || nextSectionWrapper.firstElementChild;
      
      return { heroEl, nextEl };
    };

    // Store initial hero position
    const getHeroInitialTop = (heroEl) => {
      if (heroEl) {
        const rect = heroEl.getBoundingClientRect();
        return rect.top + window.scrollY;
      }
      return 0;
    };

    // Initialize elements
    let heroElement = null;
    let nextSectionElement = null;
    let heroInitialTop = 0;

    const initializeElements = () => {
      const elements = getElements();
      if (elements && elements.heroEl && elements.nextEl) {
        heroElement = elements.heroEl;
        nextSectionElement = elements.nextEl;
        heroInitialTop = getHeroInitialTop(heroElement);
        
        // Set initial state for next section
        nextSectionElement.style.transform = `translate3d(0, ${window.innerHeight}px, 0)`;
        nextSectionElement.style.opacity = '0.3';
        nextSectionElement.style.zIndex = '1';
        nextSectionElement.style.position = 'relative';
        nextSectionElement.style.transition = 'none';
        
        return true;
      }
      return false;
    };

    // Recalculate on window resize
    const handleResize = () => {
      if (heroElement) {
        heroInitialTop = getHeroInitialTop(heroElement);
        handleScroll();
      }
    };
    window.addEventListener('resize', handleResize);

    const handleScroll = () => {
      if (!heroElement || !nextSectionElement) {
        if (!initializeElements()) return;
      }

      const windowHeight = window.innerHeight;
      const scrollY = window.scrollY;
      const heroHeight = windowHeight;

      // Calculate scroll progress through the overlap phase (0 to 1)
      // Use stored initial position to avoid issues with fixed positioning
      const overlapStart = heroInitialTop;
      const overlapEnd = heroInitialTop + heroHeight;
      const overlapRange = heroHeight;

      // Before overlap - ensure initial positioning (immediate visibility)
      if (scrollY < overlapStart - 50) {
        // Immediately set hero to full visibility - no delay
        heroElement.style.opacity = '1';
        heroElement.style.visibility = 'visible';
        heroElement.style.transform = 'translate3d(0, 0, 0)';
        heroElement.style.position = 'relative';
        heroElement.style.zIndex = '2';
        heroElement.style.top = 'auto';
        heroElement.style.left = 'auto';
        heroElement.style.width = 'auto';
        heroElement.style.transition = 'none';
        heroElement.style.display = 'block';
        heroElement.style.willChange = 'auto';
        
        nextSectionElement.style.transform = `translate3d(0, ${windowHeight}px, 0)`;
        nextSectionElement.style.opacity = '0.3';
        nextSectionElement.style.zIndex = '1';
        nextSectionElement.style.position = 'relative';
        nextSectionElement.style.transition = 'none';
        nextSectionElement.style.borderRadius = '0';
        nextSectionElement.style.boxShadow = 'none';
        
        if (spacerRef.current) {
          spacerRef.current.style.height = '0px';
          spacerRef.current.style.transition = 'none';
        }
        return;
      }

      if (scrollY >= overlapStart && scrollY < overlapEnd) {
        // During overlap phase
        const rawProgress = Math.min((scrollY - overlapStart) / overlapRange, 1);
        
        // Ultra-smooth easing functions for cinematic feel
        const easeInOutCubic = (t) => {
          return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
        };
        const easeOutExpo = (t) => {
          return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
        };
        const easeInOutQuart = (t) => {
          return t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2;
        };
        const easeInOutQuint = (t) => {
          return t < 0.5 ? 16 * t * t * t * t * t : 1 - Math.pow(-2 * t + 2, 5) / 2;
        };
        const easeOutCubic = (t) => {
          return 1 - Math.pow(1 - t, 3);
        };
        // Custom smooth easing - combines multiple curves for ultra-smooth feel
        const smoothEase = (t) => {
          // Use quintic for main progress
          const quint = easeInOutQuint(t);
          // Blend with quartic for extra smoothness
          return quint * 0.7 + easeInOutQuart(t) * 0.3;
        };
        
        // Use ultra-smooth easing curve
        const progress = smoothEase(rawProgress);

        // Hero: ultra-smooth fade out with custom curve
        const heroFadeCurve = easeOutCubic(rawProgress);
        const heroOpacity = Math.max(0, 1 - heroFadeCurve * 1.02);
        // Ultra-smooth upward movement with exponential ease
        const heroTranslateY = -easeOutExpo(rawProgress) * 12; // Even gentler movement

        // Next Section: slide up with ultra-smooth curve
        // Start at 100vh below, end at -100px overlap (covering hero)
        const sectionStartY = windowHeight;
        const sectionEndY = -100; // 100px overlap
        
        // Use ultra-smooth eased progress for transform
        const easedTransform = smoothEase(rawProgress);
        const sectionTranslateY = sectionStartY - (sectionStartY - sectionEndY) * easedTransform;
        
        // Ultra-smooth opacity transition with custom curve
        const opacityCurve = easeInOutQuart(rawProgress);
        const sectionOpacity = Math.min(1, 0.12 + opacityCurve * 0.88);

        // Add rounded corners and shadow as it overlaps (ultra-smooth progression)
        const borderRadiusProgress = smoothEase(rawProgress);
        const borderRadius = Math.min(borderRadiusProgress * 32, 32); // up to 2rem
        // Smooth shadow with gradual increase
        const shadowCurve = easeInOutQuart(rawProgress);
        const shadowOpacity = Math.min(shadowCurve * 0.15, 0.15);
        
        // Apply all styles directly with optimized values (already in requestAnimationFrame context)
        // Use fractional values for smoother pixel rendering
        heroElement.style.opacity = heroOpacity.toFixed(3);
        heroElement.style.position = 'fixed';
        heroElement.style.top = '0';
        heroElement.style.left = '0';
        heroElement.style.right = '0';
        heroElement.style.width = '100%';
        heroElement.style.zIndex = progress < 0.8 ? 2 : 1;
        heroElement.style.transition = 'none';
        heroElement.style.transform = `translate3d(0, ${heroTranslateY.toFixed(2)}px, 0) scale(1)`;
        
        nextSectionElement.style.transform = `translate3d(0, ${sectionTranslateY.toFixed(2)}px, 0) scale(1)`;
        nextSectionElement.style.opacity = sectionOpacity.toFixed(3);
        nextSectionElement.style.position = 'relative';
        nextSectionElement.style.zIndex = progress >= 0.35 ? 3 : 1;
        nextSectionElement.style.transition = 'none';
        nextSectionElement.style.borderRadius = `${borderRadius.toFixed(2)}px ${borderRadius.toFixed(2)}px 0 0`;
        nextSectionElement.style.boxShadow = `0 -10px 40px rgba(0, 0, 0, ${shadowOpacity.toFixed(3)})`;

        // Add spacer to prevent layout shift (with smooth transition)
        if (spacerRef.current) {
          const spacerHeight = heroHeight * (1 - progress);
          spacerRef.current.style.height = `${spacerHeight.toFixed(2)}px`;
        }
      } else {
        // After overlap - normal scroll, next section is fully visible
        heroElement.style.opacity = '0';
        heroElement.style.transform = 'translate3d(0, 0, 0) scale(1)';
        heroElement.style.position = 'relative';
        heroElement.style.zIndex = '1';
        heroElement.style.top = 'auto';
        heroElement.style.left = 'auto';
        heroElement.style.right = 'auto';
        heroElement.style.width = 'auto';
        heroElement.style.transition = 'none';

        nextSectionElement.style.transform = 'translate3d(0, 0, 0) scale(1)';
        nextSectionElement.style.opacity = '1';
        nextSectionElement.style.zIndex = '2';
        nextSectionElement.style.borderRadius = '2rem 2rem 0 0';
        nextSectionElement.style.boxShadow = '0 -10px 40px rgba(0, 0, 0, 0.15)';
        nextSectionElement.style.transition = 'none';

        if (spacerRef.current) {
          spacerRef.current.style.height = '0px';
        }
      }
    };

    // Optimized scroll handler for smooth performance
    let ticking = false;
    let lastScrollY = 0;
    let rafId = null;
    
    const throttledScroll = () => {
      const currentScrollY = window.scrollY;
      
      // If scrolling back up to hero section, execute immediately without delay
      const isScrollingToHero = currentScrollY < lastScrollY && currentScrollY < (heroInitialTop || 0) + 100;
      
      // Smooth scroll handling with optimized threshold
      const scrollDelta = Math.abs(currentScrollY - lastScrollY);
      // Reasonable threshold for smooth updates without performance issues
      if (scrollDelta < 0.5 && ticking && !isScrollingToHero) {
        return;
      }
      
      lastScrollY = currentScrollY;
      
      // If scrolling back to hero, execute immediately
      if (isScrollingToHero && heroElement && nextSectionElement) {
        // Cancel any pending animation frame
        if (rafId) {
          cancelAnimationFrame(rafId);
          rafId = null;
        }
        ticking = false;
        handleScroll(); // Immediate execution
        return;
      }
      
      if (!ticking) {
        // Cancel any pending animation frame for better performance
        if (rafId) {
          cancelAnimationFrame(rafId);
        }
        
        rafId = window.requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
          rafId = null;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', throttledScroll, { passive: true });
    
    // Initial setup - immediate execution for hero visibility
    const initDelay = setTimeout(() => {
      if (initializeElements()) {
        handleScroll(); // Set initial state immediately
        // Also call immediately to ensure hero is visible
        if (window.scrollY < (heroInitialTop || 0)) {
          if (heroElement) {
            heroElement.style.opacity = '1';
            heroElement.style.visibility = 'visible';
            heroElement.style.transition = 'none';
          }
        }
      }
    }, 50); // Reduced delay for faster initial render

    return () => {
      clearTimeout(initDelay);
      window.removeEventListener('scroll', throttledScroll);
      window.removeEventListener('resize', handleResize);
      // Cancel any pending animation frames
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
    };
  }, []);

  // Extract children
  const childrenArray = React.Children.toArray(children);
  const heroChild = childrenArray[0];
  const nextSectionChild = childrenArray[1];

  return (
    <div className="relative">
      {/* Spacer for smooth transition when hero becomes fixed */}
      <div 
        ref={spacerRef} 
        className="hero-spacer" 
        style={{ 
          height: '0', 
          transition: 'none', // No transition for immediate updates
          willChange: 'auto'
        }}
      ></div>
      
      {/* Hero Section */}
      <div ref={heroRef}>
        {React.isValidElement(heroChild) ? React.cloneElement(heroChild) : heroChild}
      </div>
      
      {/* Next Section (Features) */}
      <div ref={nextSectionRef}>
        {React.isValidElement(nextSectionChild) ? React.cloneElement(nextSectionChild) : nextSectionChild}
      </div>
    </div>
  );
};

export default ScrollOverlapWrapper;

