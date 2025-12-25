import React from 'react';

/**
 * Skeleton component for judgment cards
 */
export const JudgmentSkeleton = () => (
  <div className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
    <div className="flex items-start justify-between mb-4">
      <div className="flex-1">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
      </div>
      <div className="h-8 w-8 bg-gray-200 rounded"></div>
    </div>
    
    <div className="space-y-2 mb-4">
      <div className="h-3 bg-gray-200 rounded w-full"></div>
      <div className="h-3 bg-gray-200 rounded w-5/6"></div>
      <div className="h-3 bg-gray-200 rounded w-4/6"></div>
    </div>
    
    <div className="flex items-center justify-between">
      <div className="flex space-x-4">
        <div className="h-3 bg-gray-200 rounded w-20"></div>
        <div className="h-3 bg-gray-200 rounded w-16"></div>
      </div>
      <div className="h-8 bg-gray-200 rounded w-24"></div>
    </div>
  </div>
);

/**
 * Skeleton component for act cards
 */
export const ActSkeleton = () => (
  <div className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
    <div className="flex items-start justify-between mb-4">
      <div className="flex-1">
        <div className="h-5 bg-gray-200 rounded w-4/5 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-3/5"></div>
      </div>
      <div className="h-8 w-8 bg-gray-200 rounded"></div>
    </div>
    
    <div className="space-y-2 mb-4">
      <div className="h-3 bg-gray-200 rounded w-full"></div>
      <div className="h-3 bg-gray-200 rounded w-4/5"></div>
    </div>
    
    <div className="flex items-center justify-between">
      <div className="flex space-x-4">
        <div className="h-3 bg-gray-200 rounded w-24"></div>
        <div className="h-3 bg-gray-200 rounded w-20"></div>
        <div className="h-3 bg-gray-200 rounded w-16"></div>
      </div>
      <div className="h-8 bg-gray-200 rounded w-24"></div>
    </div>
  </div>
);

/**
 * Loading spinner component
 */
export const LoadingSpinner = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12'
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className={`${sizeClasses[size]} animate-spin rounded-full border-2 border-gray-300 border-t-blue-600`}></div>
    </div>
  );
};

/**
 * Infinite scroll loading indicator
 */
export const InfiniteScrollLoader = ({ isLoading, hasMore, error, onRetry }) => {
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <div className="text-red-500 text-sm mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
          Failed to load more data
        </div>
        <button
          onClick={onRetry}
          className="px-4 py-2 text-sm text-blue-600 hover:text-blue-800 underline"
          style={{ fontFamily: 'Roboto, sans-serif' }}
        >
          Try again
        </button>
      </div>
    );
  }

  if (!hasMore) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-gray-500 text-sm" style={{ fontFamily: 'Roboto, sans-serif' }}>
          You've reached the end
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <LoadingSpinner size="md" />
        <span className="ml-2 text-gray-500 text-sm" style={{ fontFamily: 'Roboto, sans-serif' }}>
          Loading more...
        </span>
      </div>
    );
  }

  return null;
};

export default {
  JudgmentSkeleton,
  ActSkeleton,
  LoadingSpinner,
  InfiniteScrollLoader
};
