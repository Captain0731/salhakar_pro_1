import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Custom hook for infinite scrolling with Intersection Observer
 * Provides smooth loading experience with skeleton states
 */
export const useInfiniteScroll = ({
  fetchMore,
  hasMore = true,
  threshold = 0.1,
  rootMargin = '100px',
  isLoading = false
}) => {
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const observerRef = useRef(null);
  const loadingRef = useRef(null);

  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore || isLoading) return;

    setIsLoadingMore(true);
    setError(null);

    try {
      await fetchMore();
    } catch (err) {
      setError(err.message || 'Failed to load more data');
      console.error('Infinite scroll error:', err);
    } finally {
      setIsLoadingMore(false);
    }
  }, [fetchMore, hasMore, isLoading, isLoadingMore]);

  useEffect(() => {
    // Disconnect previous observer
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target.isIntersecting && hasMore && !isLoadingMore && !isLoading) {
          loadMore();
        }
      },
      {
        threshold,
        rootMargin,
      }
    );

    observerRef.current = observer;

    // Observe the loading element when it's available
    if (loadingRef.current) {
      observer.observe(loadingRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [loadMore, hasMore, isLoadingMore, isLoading, threshold, rootMargin]);

  // Re-observe when loadingRef element becomes available
  useEffect(() => {
    if (loadingRef.current && observerRef.current) {
      observerRef.current.observe(loadingRef.current);
    }
  });

  return {
    loadingRef,
    isLoadingMore,
    error,
    retry: loadMore
  };
};

export default useInfiniteScroll;
