import React from 'react';

/**
 * Enhanced loading components with smooth animations and modern design
 * Features:
 * - Smooth shimmer animations
 * - Skeleton loaders for different content types
 * - Loading spinners with modern design
 * - Error states with retry functionality
 * - Mobile-optimized responsive design
 */

// Shimmer animation keyframes
const shimmerKeyframes = `
  @keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
  
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
  
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  
  .shimmer {
    position: relative;
    overflow: hidden;
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    animation: shimmer 2s infinite;
  }
  
  .fade-in {
    animation: fadeIn 0.5s ease-out;
  }
  
  .pulse {
    animation: pulse 2s infinite;
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.type = "text/css";
  styleSheet.innerText = shimmerKeyframes;
  document.head.appendChild(styleSheet);
}

// Enhanced Judgment Skeleton with smooth animations
export const EnhancedJudgmentSkeleton = () => (
  <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-all duration-300 fade-in">
    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
      <div className="flex-1">
        {/* Title skeleton */}
        <div className="h-6 bg-gray-200 rounded shimmer mb-3 w-3/4"></div>
        
        {/* Content grid skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded shimmer w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded shimmer w-3/4"></div>
          </div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded shimmer w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded shimmer w-2/3"></div>
          </div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded shimmer w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded shimmer w-1/2"></div>
          </div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded shimmer w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded shimmer w-3/4"></div>
          </div>
        </div>
      </div>
      
      {/* Button skeletons */}
      <div className="flex-shrink-0 flex flex-col gap-2">
        <div className="h-10 bg-gray-200 rounded-lg shimmer w-24"></div>
        <div className="h-8 bg-gray-200 rounded-lg shimmer w-20"></div>
      </div>
    </div>
  </div>
);

// Modern loading spinner
export const ModernSpinner = ({ size = 'md', color = 'blue' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };
  
  const colorClasses = {
    blue: 'text-blue-600',
    gray: 'text-gray-600',
    white: 'text-white'
  };
  
  return (
    <div className={`${sizeClasses[size]} ${colorClasses[color]} animate-spin`}>
      <svg className="w-full h-full" fill="none" viewBox="0 0 24 24">
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </div>
  );
};

// Enhanced infinite scroll loader with smooth animations
export const EnhancedInfiniteScrollLoader = ({ 
  isLoading, 
  hasMore, 
  error, 
  onRetry,
  retryCount = 0,
  isFetching = true
}) => {
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-8 px-4 fade-in">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to load more data</h3>
        <p className="text-gray-600 text-center mb-4 max-w-md">
          {error}
        </p>
        <button
          onClick={onRetry}
          className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium shadow-sm hover:shadow-md flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Retry {retryCount > 0 && `(${retryCount})`}
        </button>
      </div>
    );
  }

  if (!hasMore) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 fade-in">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">You've reached the end</h3>
        <p className="text-gray-600 text-center">
          No more judgments to load. Check back later for new content!
        </p>
      </div>
    );
  }

  if (isLoading || isFetching) {
    return (
      <div className="fade-in">
        {/* Skeleton Cards */}
        <div className="space-y-4">
          {[...Array(3)].map((_, index) => (
            <EnhancedJudgmentSkeleton key={`scroll-skeleton-${index}`} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-8 px-4">
      <div className="text-gray-500 text-sm">
        Scroll down to load more judgments
      </div>
    </div>
  );
};

// Skeleton grid for initial loading
export const SkeletonGrid = ({ count = 10, className = "" }) => (
  <div className={`space-y-4 ${className}`}>
    {[...Array(count)].map((_, index) => (
      <EnhancedJudgmentSkeleton key={index} />
    ))}
  </div>
);

// Loading overlay for full page loading
export const LoadingOverlay = ({ isLoading, message = "Loading..." }) => {
  if (!isLoading) return null;
  
  return (
    <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center fade-in">
      <div className="bg-white rounded-lg shadow-xl p-8 flex flex-col items-center gap-4">
        <ModernSpinner size="lg" color="blue" />
        <p className="text-gray-600 font-medium">{message}</p>
      </div>
    </div>
  );
};

// Smooth transition wrapper for new items
export const SmoothTransitionWrapper = ({ children, delay = 0 }) => (
  <div 
    className="fade-in" 
    style={{ 
      animationDelay: `${delay}ms`,
      animationFillMode: 'both'
    }}
  >
    {children}
  </div>
);

export default {
  EnhancedJudgmentSkeleton,
  ModernSpinner,
  EnhancedInfiniteScrollLoader,
  SkeletonGrid,
  LoadingOverlay,
  SmoothTransitionWrapper
};
