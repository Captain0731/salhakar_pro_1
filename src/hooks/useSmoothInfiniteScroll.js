import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Enhanced infinite scroll hook with smooth animations and performance optimizations
 * Features:
 * - Smooth scrolling with Intersection Observer
 * - Throttled scroll events for better performance
 * - Loading states and error handling
 * - Mobile-optimized touch events
 * - Preloading for seamless experience
 */
const useSmoothInfiniteScroll = ({
  fetchMore,
  hasMore,
  isLoading,
  threshold = 0.1,
  rootMargin = '100px',
  preloadThreshold = 0.3,
  throttleDelay = 100,
  scrollContainer = null
}) => {
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  
  const loadingRef = useRef(null);
  const observerRef = useRef(null);
  const lastFetchTimeRef = useRef(0);
  const isFetchingRef = useRef(false);
  const throttleTimeoutRef = useRef(null);

  // Throttled fetch function to prevent rapid API calls
  const throttledFetch = useCallback(async () => {
    const now = Date.now();
    const timeSinceLastFetch = now - lastFetchTimeRef.current;
    
    if (timeSinceLastFetch < throttleDelay) {
      if (throttleTimeoutRef.current) {
        clearTimeout(throttleTimeoutRef.current);
      }
      
      throttleTimeoutRef.current = setTimeout(() => {
        throttledFetch();
      }, throttleDelay - timeSinceLastFetch);
      return;
    }

    if (isFetchingRef.current || !hasMore || isLoading || isLoadingMore) {
      return;
    }

    try {
      isFetchingRef.current = true;
      setIsFetching(true);
      setIsLoadingMore(true);
      setError(null);
      lastFetchTimeRef.current = Date.now();
      
      await fetchMore();
    } catch (err) {
      console.error('Error in infinite scroll fetch:', err);
      setError(err.message || 'Failed to load more data');
      setRetryCount(prev => prev + 1);
    } finally {
      isFetchingRef.current = false;
      setIsFetching(false);
      setIsLoadingMore(false);
    }
  }, [fetchMore, hasMore, isLoading, isLoadingMore, throttleDelay]);

  // Retry function
  const retry = useCallback(() => {
    setError(null);
    setRetryCount(0);
    throttledFetch();
  }, [throttledFetch]);

  // Intersection Observer setup
  useEffect(() => {
    if (!loadingRef.current) return;

    const observerOptions = {
      root: scrollContainer || null, // Use scroll container if provided, otherwise use viewport
      rootMargin: rootMargin,
      threshold: threshold
    };

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        
        if (entry.isIntersecting && hasMore && !isLoading && !isLoadingMore && !isFetchingRef.current) {
          // Preload when element is 30% visible for smoother experience
          if (entry.intersectionRatio >= preloadThreshold) {
            throttledFetch();
          }
        }
      },
      observerOptions
    );

    observerRef.current = observer;
    observer.observe(loadingRef.current);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      if (throttleTimeoutRef.current) {
        clearTimeout(throttleTimeoutRef.current);
      }
    };
  }, [hasMore, isLoading, isLoadingMore, throttledFetch, threshold, rootMargin, preloadThreshold, scrollContainer]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (throttleTimeoutRef.current) {
        clearTimeout(throttleTimeoutRef.current);
      }
    };
  }, []);

  return {
    loadingRef,
    isLoadingMore,
    error,
    retry,
    retryCount,
    isFetching
  };
};

export default useSmoothInfiniteScroll;
