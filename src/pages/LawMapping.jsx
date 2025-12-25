import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { AutoComplete } from 'primereact/autocomplete';
import Navbar from "../components/landing/Navbar";
import apiService from "../services/api";
import useSmoothInfiniteScroll from "../hooks/useSmoothInfiniteScroll";
import { 
  EnhancedJudgmentSkeleton, 
  EnhancedInfiniteScrollLoader, 
  SkeletonGrid,
  SmoothTransitionWrapper 
} from "../components/EnhancedLoadingComponents";
import { useAuth } from "../contexts/AuthContext";
import ScrollToTopButton from "../components/ScrollToTopButton";
import { Mic } from "lucide-react";

// Add custom CSS animations and highlight styles
const customStyles = `
  @keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
  
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
  }
  
  @keyframes fadeInUp {
    from { 
      opacity: 0; 
      transform: translateY(30px); 
    }
    to { 
      opacity: 1; 
      transform: translateY(0); 
    }
  }
  
  @keyframes slideInFromBottom {
    from { 
      opacity: 0; 
      transform: translateY(50px); 
    }
    to { 
      opacity: 1; 
      transform: translateY(0); 
    }
  }
  
  .animate-fade-in-up {
    animation: fadeInUp 0.6s ease-out forwards;
  }
  
  .animate-slide-in-bottom {
    animation: slideInFromBottom 0.8s ease-out forwards;
  }
  
  /* Highlight styles for search results */
  mark {
    background-color: #FEF08A;
    color: #1F2937;
    padding: 0.125rem 0.25rem;
    border-radius: 0.25rem;
    font-weight: 600;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  }
  
  /* Ensure highlights are visible in all contexts */
  .mapping-card mark,
  .mapping-result mark {
    background-color: #FEF08A !important;
    color: #1F2937 !important;
    padding: 0.125rem 0.25rem !important;
    border-radius: 0.25rem !important;
    font-weight: 600 !important;
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.type = "text/css";
  styleSheet.innerText = customStyles;
  if (!document.getElementById('law-mapping-styles')) {
    styleSheet.id = 'law-mapping-styles';
    document.head.appendChild(styleSheet);
  }
}

export default function LawMapping() {
  const navigate = useNavigate();
  const location = useLocation();
  const isMountedRef = useRef(true);
  const { isAuthenticated } = useAuth();
  
  // Check if user is authenticated
  const isUserAuthenticated = useMemo(() => {
    const token = localStorage.getItem('access_token') || 
                  localStorage.getItem('accessToken') || 
                  localStorage.getItem('token');
    const hasValidToken = !!token && token !== 'null' && token !== 'undefined';
    return isAuthenticated && hasValidToken;
  }, [isAuthenticated]);

  // Get mapping type from URL query parameter, default to bns_ipc
  const getInitialMappingType = () => {
    const searchParams = new URLSearchParams(location.search);
    const typeParam = searchParams.get('type');
    // Validate that the type is one of the valid mapping types
    const validTypes = ['bns_ipc', 'bsa_iea', 'bnss_crpc'];
    if (typeParam && validTypes.includes(typeParam)) {
      return typeParam;
    }
    return "bns_ipc"; // default
  };

  // Mapping type state - initialize from URL query parameter
  const [mappingType, setMappingType] = useState(getInitialMappingType);

  // Filter visibility state
  const [showFilters, setShowFilters] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false); // Track if user has scrolled
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false); // Mobile sidebar state
  
  // Detect mobile view
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Data states
  const [mappings, setMappings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [offset, setOffset] = useState(0);
  const [searchMetadata, setSearchMetadata] = useState(null);
  const offsetRef = useRef(0);
  const fetchMappingsRef = useRef(null);
  const isInitialMountRef = useRef(true);
  const isFetchingRef = useRef(false);
  const scrollTimeoutRef = useRef(null);

  // Helper function to load filters from localStorage
  const loadFiltersFromStorage = (mappingType) => {
    try {
      const stored = localStorage.getItem(`lawMapping_filters_${mappingType}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          word_search: parsed.word_search || '',
          source_section_search: parsed.source_section_search || '',
          target_section_search: parsed.target_section_search || '',
          subject: parsed.subject || '',
          section: parsed.section || '',
          source_section: parsed.source_section || '',
          target_section: parsed.target_section || ''
        };
      }
    } catch (error) {
      console.error('Error loading filters from storage:', error);
    }
    return {
      word_search: '',
      source_section_search: '',
      target_section_search: '',
      subject: '',
      section: '',
      source_section: '',
      target_section: ''
    };
  };

  // Filter states - initialize from localStorage
  const [filters, setFilters] = useState(() => loadFiltersFromStorage(getInitialMappingType()));

  const pageSize = 50; // Increased from 20 to show more mappings per page

  const mappingTypes = [
    { value: "bns_ipc", label: "IPC ↔ BNS (Criminal Law)", description: "Indian Penal Code to Bharatiya Nyaya Sanhita" },
    { value: "bsa_iea", label: "IEA ↔ BSA (Evidence Law)", description: "Indian Evidence Act to Bharatiya Sakshya Adhiniyam" },
    { value: "bnss_crpc", label: "CrPC ↔ BNSS (Criminal Procedure)", description: "Code of Criminal Procedure to Bharatiya Nagarik Suraksha Sanhita" }
  ];

  // Function to update mapping type and URL
  const updateMappingType = useCallback((newType) => {
    const validTypes = ['bns_ipc', 'bsa_iea', 'bnss_crpc'];
    if (validTypes.includes(newType)) {
      setMappingType(newType);
      // Update URL to preserve mapping type on browser back/forward
      navigate(`/law-mapping?type=${newType}`, { replace: true });
    }
  }, [navigate]);

  // Update mapping type when URL query parameter changes (including browser back/forward)
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const typeParam = searchParams.get('type');
    const validTypes = ['bns_ipc', 'bsa_iea', 'bnss_crpc'];
    if (typeParam && validTypes.includes(typeParam)) {
      // Always update if URL has a valid type, even if it matches current state
      // This ensures browser back/forward buttons work correctly
      if (typeParam !== mappingType) {
        setMappingType(typeParam);
      }
    } else if (!typeParam && mappingType !== 'bns_ipc') {
      // If no type in URL and current type is not default, update URL to include current type
      navigate(`/law-mapping?type=${mappingType}`, { replace: true });
    }
  }, [location.search, mappingType, navigate]);

  // Load filters from localStorage when mapping type changes
  useEffect(() => {
    const savedFilters = loadFiltersFromStorage(mappingType);
    setFilters(savedFilters);
    setMappings([]);
    setOffset(0);
    setHasMore(true);
    setSearchMetadata(null);
  }, [mappingType]);

  // Save filters to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(`lawMapping_filters_${mappingType}`, JSON.stringify(filters));
    } catch (error) {
      console.error('Error saving filters to storage:', error);
    }
  }, [filters, mappingType]);

  // Store filters in ref to always get latest values
  const filtersRef = useRef(filters);
  useEffect(() => {
    filtersRef.current = filters;
  }, [filters]);

  // Fetch mappings function with offset-based pagination
  const fetchMappings = useCallback(async (isLoadMore = false, customFilters = null) => {
    if (!isMountedRef.current) return;
    
    // Prevent duplicate simultaneous requests
    if (isFetchingRef.current && !isLoadMore) {
      console.log('Already fetching, skipping duplicate request');
      return;
    }
    
    try {
      if (!isLoadMore) {
        isFetchingRef.current = true;
      }
      
      if (isLoadMore) {
        setIsSearching(true);
      } else {
        setLoading(true);
        setError(null);
      }
      
      // Use custom filters if provided, otherwise use current filters from ref
      const activeFilters = customFilters !== null ? customFilters : filtersRef.current;
      const currentOffset = isLoadMore ? offsetRef.current : 0;
      
      // Prepare params - ensure mapping_type is always included
      const params = {
        limit: pageSize,
        offset: currentOffset,
        mapping_type: mappingType  // Always include mapping_type
      };

      // First pass: collect search values for combining
      let searchTerms = [];
      let hasWordSearch = false;
      let hasSourceSectionSearch = false;
      let hasTargetSectionSearch = false;
      
      // Check what search types are active
      if (activeFilters.word_search && activeFilters.word_search.trim() !== '') {
        hasWordSearch = true;
        searchTerms.push(activeFilters.word_search.trim());
      }
      if (activeFilters.source_section_search && activeFilters.source_section_search.trim() !== '') {
        hasSourceSectionSearch = true;
        searchTerms.push(activeFilters.source_section_search.trim());
      }
      if (activeFilters.target_section_search && activeFilters.target_section_search.trim() !== '') {
        hasTargetSectionSearch = true;
        searchTerms.push(activeFilters.target_section_search.trim());
      }
      
      // If any search is used, combine them and enable highlights
      if (searchTerms.length > 0) {
        params.search = searchTerms.join(' ');
        params.highlight = true;
      }
      
      // Add filters - map to API parameter names based on mapping type
      Object.keys(activeFilters).forEach(key => {
        const value = activeFilters[key];
        // Skip empty values
        if (!value || (typeof value === 'string' && value.trim() === '')) {
          return;
        }
        
        // Map filter keys to API parameter names
        if (key === 'word_search') {
          // Already handled above in search parameter
          // No additional action needed
        } else if (key === 'source_section_search') {
          // Source section search: use source_section for filtering
          params.source_section = value;
        } else if (key === 'target_section_search') {
          // Target section search: use target_section for filtering
          params.target_section = value;
        } else if (key === 'subject') {
          params.subject = value;
        } else if (key === 'section') {
          // Section searches in both source and target sections
          params.section = value;
        } else if (key === 'source_section') {
          // source_section maps to bns_section/bsa_section/bnss_section based on mapping_type
          params.source_section = value;
        } else if (key === 'target_section') {
          // target_section maps to ipc_section/iea_section/crpc_section based on mapping_type
          params.target_section = value;
        } else {
          // Direct mapping for other filters
          params[key] = value;
        }
      });

      // Remove empty params (but keep mapping_type even if it's empty string - it shouldn't be)
      Object.keys(params).forEach(key => {
        if (key === 'mapping_type') return; // Always keep mapping_type
        if (params[key] === "" || params[key] === null || params[key] === undefined) {
          delete params[key];
        }
      });

      // Log the request for debugging
      if (process.env.NODE_ENV === 'development') {
        console.log('Fetching mappings with params:', params);
      }

      // Call API
      const data = await apiService.getLawMappingsWithOffset(currentOffset, pageSize, params);
      
      // Log the response for debugging
      if (process.env.NODE_ENV === 'development') {
        console.log('Mappings API response:', { 
          mappingType, 
          dataCount: data?.data?.length,
          pagination: data?.pagination,
          searchMetadata: data?.search_metadata
        });
      }
      
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid API response: Expected object but got ' + typeof data);
      }
      
      // Handle different response structures
      let mappingsArray = [];
      if (Array.isArray(data.data)) {
        mappingsArray = data.data;
      } else if (Array.isArray(data)) {
        mappingsArray = data;
      } else if (data.data) {
        console.warn('API response data is not an array:', data.data);
        mappingsArray = [];
      }
      
      if (!isMountedRef.current) return;
      
      // Handle both pagination and pagination_info for backward compatibility
      const paginationInfo = data.pagination || data.pagination_info || {};
      
      if (isLoadMore) {
        setMappings(prev => [...prev, ...mappingsArray]);
        setOffset(prev => prev + mappingsArray.length);
        offsetRef.current = offsetRef.current + mappingsArray.length;
      } else {
        setMappings(mappingsArray);
        setOffset(mappingsArray.length);
        offsetRef.current = mappingsArray.length;
      }
      
      // Update hasMore based on API response
      setHasMore(paginationInfo.has_more !== false); // Default to true if not specified
      
      // Update total count from pagination info if available
      if (paginationInfo.total_count !== undefined) {
        setTotalCount(paginationInfo.total_count);
      } else if (!isLoadMore) {
        // If no total count, estimate based on current data
        setTotalCount(mappingsArray.length + (paginationInfo.has_more ? pageSize : 0));
      }
      
      // Store search metadata for highlights
      if (data.search_metadata) {
        if (isLoadMore) {
          // Merge highlights when loading more
          setSearchMetadata(prev => {
            const merged = { ...data.search_metadata };
            if (prev?.highlights && data.search_metadata.highlights) {
              merged.highlights = { ...prev.highlights, ...data.search_metadata.highlights };
            }
            return merged;
          });
        } else {
          setSearchMetadata(data.search_metadata);
        }
        if (process.env.NODE_ENV === 'development') {
          console.log('Elasticsearch search metadata:', data.search_metadata);
          console.log('Mapping highlights sample:', mappingsArray[0]?.highlights);
        }
      } else if (!isLoadMore) {
        // Only clear searchMetadata if not loading more (to preserve it during pagination)
        setSearchMetadata(null);
      }
      
    } catch (error) {
      if (!isMountedRef.current) return;
      console.error('Error fetching mappings:', error);
      
      let errorMessage = `Failed to fetch law mappings. Please try again.`;
      
      // Check for network errors (fetch failures, CORS, etc.)
      if (error.name === 'TypeError' && (error.message.includes('fetch') || error.message.includes('Failed to fetch') || error.message.includes('NetworkError') || error.message.includes('Network request failed'))) {
        errorMessage = "Network error. Please check your internet connection and try again.";
      } else if (error.message && (error.message.includes('All API servers are unavailable') || error.message.includes('servers are unavailable'))) {
        errorMessage = "Service temporarily unavailable. Please try again later.";
      } else if (error.message && error.message.includes('401') && !isUserAuthenticated) {
        // For unauthenticated users, 401 might mean the endpoint requires auth, but don't show auth error
        // Instead show a generic error that doesn't force login
        errorMessage = "Unable to load mappings. Please try again.";
      } else if (error.message && (error.message.includes('401') || error.message.includes('Authentication') || error.message.includes('Unauthorized'))) {
        errorMessage = "Authentication required. Please log in to access mappings.";
      } else if (error.message && (error.message.includes('403') || error.message.includes('Forbidden'))) {
        errorMessage = "Access denied. Please check your permissions.";
      } else if (error.message && (error.message.includes('500') || error.message.includes('Internal Server'))) {
        errorMessage = "Server error. Please try again later.";
      } else if (error.message && (error.message.includes('Network') || error.message.includes('network'))) {
        errorMessage = "Network error. Please check your internet connection and try again.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      // Only show error if not loading more (to avoid flickering)
      if (!isLoadMore) {
        setError(errorMessage);
        setMappings([]);
        setSearchMetadata(null);
      } else {
        // For load more errors, just log but don't show error to user
        console.warn('Error loading more mappings:', error);
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
        setIsSearching(false);
        if (!isLoadMore) {
          isFetchingRef.current = false;
        }
      }
    }
  }, [mappingType, pageSize]);

  // Store fetchMappings in ref
  useEffect(() => {
    fetchMappingsRef.current = fetchMappings;
  }, [fetchMappings]);

  // Filter handling functions
  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      word_search: '',
      source_section_search: '',
      target_section_search: '',
      subject: '',
      section: '',
      source_section: '',
      target_section: ''
    });
    setMappings([]);
    setHasMore(true);
    setOffset(0);
    setSearchMetadata(null);
    offsetRef.current = 0;
    setTimeout(() => {
      if (fetchMappingsRef.current) {
        fetchMappingsRef.current(false);
      }
    }, 100);
  };

  const applyFilters = () => {
    if (isFetchingRef.current) return;
    
    setMappings([]);
    setHasMore(true);
    setOffset(0);
    setSearchMetadata(null);
    offsetRef.current = 0;
    setError(null);
    
    setTimeout(() => {
      if (fetchMappingsRef.current) {
        const currentFilters = filtersRef.current;
        fetchMappingsRef.current(false, currentFilters);
      }
    }, 100);
  };

  // Sync offset ref with state
  useEffect(() => {
    offsetRef.current = offset;
  }, [offset]);

  // Auto-apply filters when they change (with debounce) - Skip on initial mount
  useEffect(() => {
    if (isInitialMountRef.current) {
      return;
    }
    
    if (isFetchingRef.current) {
      return;
    }
    
    const timeoutId = setTimeout(() => {
      const hasActiveFilters = Object.entries(filters).some(([key, val]) => {
        // Skip word_search, source_section_search, target_section_search from auto-apply
        // They need explicit Apply button or Enter key
        if (key === 'word_search' || key === 'source_section_search' || key === 'target_section_search') {
          return false;
        }
        return val && (typeof val === 'string' ? val.trim() !== '' : val !== '');
      });
      
      if (hasActiveFilters && !isFetchingRef.current && fetchMappingsRef.current) {
        const currentFilters = filtersRef.current;
        setMappings([]);
        setHasMore(true);
        setOffset(0);
        setSearchMetadata(null);
        offsetRef.current = 0;
        setError(null);
        fetchMappingsRef.current(false, currentFilters);
      }
    }, 800);

    return () => clearTimeout(timeoutId);
  }, [filters.subject, filters.section, filters.source_section, filters.target_section, filters.word_search, filters.source_section_search, filters.target_section_search]);

  // Load initial data when mapping type changes
  useEffect(() => {
    // Reset offset when mapping type changes
    setOffset(0);
    offsetRef.current = 0;
    setMappings([]);
    setHasMore(true);
    setError(null);
    setSearchMetadata(null);
    
    if (isInitialMountRef.current) {
      const timer = setTimeout(() => {
        if (!isFetchingRef.current && fetchMappingsRef.current) {
          fetchMappingsRef.current(false);
        }
      }, 100);
      isInitialMountRef.current = false;
      return () => clearTimeout(timer);
    } else {
      // When mapping type changes, immediately fetch new data
      if (!isFetchingRef.current && fetchMappingsRef.current) {
        const timer = setTimeout(() => {
          fetchMappingsRef.current(false);
        }, 100);
        return () => clearTimeout(timer);
      }
    }
  }, [mappingType]);

  // Enhanced infinite scroll logic
  const loadMoreData = useCallback(async () => {
    if (!hasMore || loading || isSearching || !isMountedRef.current) return;
    if (fetchMappingsRef.current) {
      await fetchMappingsRef.current(true);
    }
  }, [hasMore, loading, isSearching]);

  const { 
    loadingRef, 
    isLoadingMore, 
    error: scrollError, 
    retry, 
    retryCount,
    isFetching 
  } = useSmoothInfiniteScroll({
    fetchMore: loadMoreData,
    hasMore,
    isLoading: loading || isSearching,
    threshold: 0.1,
    rootMargin: '100px',
    preloadThreshold: 0.3,
    throttleDelay: 150
  });

  const viewMappingDetails = (mapping) => {
    // Navigate to mapping details page using ID in URL
    const mappingId = mapping.id || mapping.mapping_id;
    if (mappingId) {
      // Use ID and mapping_type in URL for direct API fetch
      navigate(`/mapping-details?id=${mappingId}&mapping_type=${mappingType}`);
    } else {
      // Fallback: use state if no ID (shouldn't happen, but for safety)
      navigate(`/mapping-details?type=${mappingType}`, { state: { mapping, mappingType } });
    }
  };


  // Cleanup effect
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Scroll detection to hide header and move sidebar/search bar to top
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      setIsScrolled(scrollTop > 50);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const mappingTypeLabel = mappingTypes.find(m => m.value === mappingType)?.label || "Law Mapping";

  // Helper function to get input value (for AutoComplete compatibility)
  const getInputValue = (filterName) => {
    return filters[filterName] || '';
  };

  // Helper function to handle input focus
  const handleInputFocus = (filterName) => {
    // Can be extended if needed
  };

  // Helper function to handle input blur
  const handleInputBlur = (filterName) => {
    // Can be extended if needed
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F9FAFC' }}>
      <Navbar />
      
      {/* Mobile Sticky Header with Hamburger Menu and Search Bar - Mobile Only */}
      <div className="md:hidden w-full bg-white border-b border-gray-200 fixed left-0 right-0 z-30 shadow-sm" style={{ position: 'fixed', top: '56px', left: 0, right: 0 }}>
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            {/* Hamburger Menu Button */}
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="p-2 flex items-center justify-center hover:bg-gray-50 rounded-lg transition-colors flex-shrink-0"
              aria-label="Open filters menu"
              style={{ color: '#1E65AD' }}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            
            {/* Search Bar - Simplified for mobile */}
            <div className="flex-1">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200" style={{ backgroundColor: '#FFFFFF' }}>
                <div className="relative">
                  <AutoComplete
                    value={getInputValue('word_search')}
                    onChange={(e) => {
                      const value = e.value || '';
                      handleFilterChange('word_search', value);
                    }}
                    onFocus={() => handleInputFocus('word_search')}
                    onBlur={() => handleInputBlur('word_search')}
                    placeholder="Search mappings..."
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !loading && !isFetchingRef.current) {
                        e.preventDefault();
                        applyFilters();
                      }
                    }}
                    suggestions={[]}
                    completeMethod={() => {}}
                    className="w-full"
                    inputClassName="w-full px-4 py-2.5 pl-10 pr-10 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#1E65AD] focus:border-[#1E65AD] text-sm shadow-sm bg-white transition-all"
                    inputStyle={{ fontFamily: "'Heebo', sans-serif", backgroundColor: '#FFFFFF' }}
                    panelClassName="hidden"
                    dropdown={false}
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5" style={{ color: '#1E65AD' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* HEADER - About Us Style */}
      <div className="w-full bg-white pt-32 sm:pt-36 md:pt-20 lg:pt-24 xl:pt-28 pb-8 sm:pb-10 md:pb-12 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
          {/* Centered Header Content */}
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4" style={{ color: '#1E65AD', fontFamily: "'Bricolage Grotesque', sans-serif" }}>
              Law Mapping
            </h1>
            {/* Thick Orange-Brown Line */}
            <div className="w-16 sm:w-20 h-1 mx-auto mb-4 sm:mb-5" style={{ backgroundColor: '#CF9B63' }}></div>
            {/* Subtitle */}
            <p className="text-sm sm:text-base md:text-lg text-gray-600 max-w-3xl mx-auto px-4" style={{ fontFamily: "'Heebo', sans-serif" }}>
              Navigate the transition from old legal codes to new ones. Map sections between IPC-BNS, IEA-BSA, and CrPC-BNSS.
            </p>
          </div>
        </div>
      </div>
      
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {mobileSidebarOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-[60] md:hidden"
              onClick={() => setMobileSidebarOpen(false)}
            />
            <motion.aside 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed left-0 top-0 bottom-0 w-80 bg-white shadow-2xl z-[70] md:hidden overflow-y-auto"
            >
              {/* Mobile Sidebar Header */}
              <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 pt-20uplode flex items-center justify-between z-10">
                <div className="flex items-center gap-3">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5} style={{ color: '#1E65AD' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                  <h2 className="text-lg font-semibold" style={{ color: '#1E65AD', fontFamily: "'Heebo', sans-serif" }}>Filters</h2>
                </div>
                <button
                  onClick={() => setMobileSidebarOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  aria-label="Close filters menu"
                >
                  <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Mobile Sidebar Content - Same as Desktop Sidebar */}
              <div className="p-4">
                {/* Mapping Type Toggle */}
                <div className="mb-4">
                  <label className="block text-xs font-semibold text-gray-700 mb-2" style={{ fontFamily: "'Heebo', sans-serif" }}>
                    Mapping Type
                  </label>
                  <div className="relative w-full flex items-center bg-gray-100 rounded-xl p-1 shadow-inner">
                    <motion.div
                      className="absolute top-0.5 bottom-0.5 rounded-lg z-0"
                      initial={false}
                      animate={{
                        left: mappingType === 'bns_ipc' ? '2px' : mappingType === 'bsa_iea' ? 'calc(33.33% + 1px)' : 'calc(66.66% + 1px)',
                        backgroundColor: mappingType === 'bns_ipc' ? '#1E65AD' : mappingType === 'bsa_iea' ? '#CF9B63' : '#8C969F',
                      }}
                      transition={{ 
                        type: "spring", 
                        stiffness: 300, 
                        damping: 30 
                      }}
                      style={{
                        width: 'calc(33.33% - 2px)',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                      }}
                    />
                    <motion.button
                      onClick={() => updateMappingType('bns_ipc')}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      className={`flex-1 px-2 py-2 rounded-lg font-semibold transition-all duration-300 relative z-10 text-xs ${
                        mappingType === 'bns_ipc'
                          ? 'text-white'
                          : 'text-gray-600 hover:text-gray-800'
                      }`}
                      style={{ fontFamily: "'Heebo', sans-serif" }}
                    >
                      IPC ↔ BNS
                    </motion.button>
                    <motion.button
                      onClick={() => updateMappingType('bsa_iea')}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      className={`flex-1 px-2 py-2 rounded-lg font-semibold transition-all duration-300 relative z-10 text-xs ${
                        mappingType === 'bsa_iea'
                          ? 'text-white'
                          : 'text-gray-600 hover:text-gray-800'
                      }`}
                      style={{ fontFamily: "'Heebo', sans-serif" }}
                    >
                      IEA ↔ BSA
                    </motion.button>
                    <motion.button
                      onClick={() => updateMappingType('bnss_crpc')}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      className={`flex-1 px-2 py-2 rounded-lg font-semibold transition-all duration-300 relative z-10 text-xs ${
                        mappingType === 'bnss_crpc'
                          ? 'text-white'
                          : 'text-gray-600 hover:text-gray-800'
                      }`}
                      style={{ fontFamily: "'Heebo', sans-serif" }}
                    >
                      CrPC ↔ BNSS
                    </motion.button>
                  </div>
                </div>
                
                {/* Filter Fields Section */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5" style={{ fontFamily: "'Heebo', sans-serif" }}>
                      Subject
                    </label>
                    <input
                      type="text"
                      value={filters.subject}
                      onChange={(e) => handleFilterChange('subject', e.target.value)}
                      placeholder="e.g., Theft, Murder"
                      className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E65AD] focus:border-[#1E65AD] bg-white"
                      style={{ fontFamily: "'Heebo', sans-serif" }}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5" style={{ fontFamily: "'Heebo', sans-serif" }}>
                      Section (Any)
                    </label>
                    <input
                      type="text"
                      value={filters.section}
                      onChange={(e) => handleFilterChange('section', e.target.value)}
                      placeholder="e.g., 302, 103"
                      className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E65AD] focus:border-[#1E65AD] bg-white"
                      style={{ fontFamily: "'Heebo', sans-serif" }}
                    />
                    <p className="text-[10px] text-gray-500 mt-1">Searches in both sections</p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5" style={{ fontFamily: "'Heebo', sans-serif" }}>
                      {mappingType === 'bns_ipc' ? 'BNS Section' : mappingType === 'bsa_iea' ? 'BSA Section' : 'BNSS Section'}
                    </label>
                    <input
                      type="text"
                      value={filters.source_section}
                      onChange={(e) => handleFilterChange('source_section', e.target.value)}
                      placeholder={mappingType === 'bns_ipc' ? 'e.g., 101, 103' : mappingType === 'bsa_iea' ? 'e.g., 3, 5' : 'e.g., 154, 161'}
                      className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E65AD] focus:border-[#1E65AD] bg-white"
                      style={{ fontFamily: "'Heebo', sans-serif" }}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5" style={{ fontFamily: "'Heebo', sans-serif" }}>
                      {mappingType === 'bns_ipc' ? 'IPC Section' : mappingType === 'bsa_iea' ? 'IEA Section' : 'CrPC Section'}
                    </label>
                    <input
                      type="text"
                      value={filters.target_section}
                      onChange={(e) => handleFilterChange('target_section', e.target.value)}
                      placeholder={mappingType === 'bns_ipc' ? 'e.g., 302, 304' : mappingType === 'bsa_iea' ? 'e.g., 3, 5' : 'e.g., 154, 161'}
                      className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E65AD] focus:border-[#1E65AD] bg-white"
                      style={{ fontFamily: "'Heebo', sans-serif" }}
                    />
                  </div>
                </div>

                {/* Filter Actions */}
                <div className="flex flex-col gap-2 pt-4 mt-4 border-t border-gray-200">
                  <button
                    onClick={() => {
                      applyFilters();
                      setMobileSidebarOpen(false);
                    }}
                    disabled={loading || isFetchingRef.current}
                    className="w-full px-4 py-2 text-white rounded-lg font-semibold shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-xs transition-all"
                    style={{ fontFamily: "'Heebo', sans-serif", backgroundColor: '#1E65AD' }}
                  >
                    {loading || isSearching ? (
                      <>
                        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Searching...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        Apply Filters
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      clearFilters();
                      setMobileSidebarOpen(false);
                    }}
                    disabled={loading || isFetchingRef.current}
                    className="w-full px-4 py-2 bg-white text-gray-700 border-2 border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 active:bg-gray-100 font-semibold shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-xs transition-all"
                    style={{ fontFamily: "'Heebo', sans-serif" }}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Clear All
                  </button>
                </div>

                {/* Active Filters Display */}
                {Object.values(filters).some(val => val && (typeof val === 'string' ? val.trim() !== '' : val !== '')) && (
                  <div className="mt-3 p-2 bg-[#E6F0F8] border border-[#B3D4ED] rounded-lg">
                    <h3 className="text-xs font-medium mb-1.5" style={{ fontFamily: "'Heebo', sans-serif", color: '#1E65AD' }}>
                      Active Filters:
                    </h3>
                    <div className="flex flex-wrap gap-1.5">
                      {Object.entries(filters).map(([key, value]) => {
                        if (value && (typeof value === 'string' ? value.trim() !== '' : value !== '')) {
                          const label = key === 'source_section' ? 'Source Section' : 
                                       key === 'target_section' ? 'Target Section' :
                                       key.charAt(0).toUpperCase() + key.slice(1);
                          return (
                            <span key={key} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-[#CCE0F0] text-[#1E65AD] break-words">
                              {label}: "{value}"
                            </span>
                          );
                        }
                        return null;
                      })}
                    </div>
                  </div>
                )}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
      
      {/* LEFT: FIXED SIDEBAR - Desktop Only */}
      <aside 
        className="hidden md:block fixed left-3 bottom-4 z-20 transition-all duration-300"
        style={{ 
          top: isScrolled ? '82px' : '320px',
          width: '280px'
        }}
      >
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 h-full overflow-y-auto" style={{ width: '100%', maxHeight: isScrolled ? 'calc(100vh - 80px)' : 'calc(100vh - 220px)' }}>
          {/* Mapping Type Toggle */}
          <div className="mb-4">
            <label className="block text-xs font-semibold text-gray-700 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
              Mapping Type
            </label>
            <div className="relative w-full flex items-center bg-gray-100 rounded-xl p-1 shadow-inner">
              <motion.div
                className="absolute top-0.5 bottom-0.5 rounded-lg z-0"
                initial={false}
                animate={{
                  left: mappingType === 'bns_ipc' ? '2px' : mappingType === 'bsa_iea' ? 'calc(33.33% + 1px)' : 'calc(66.66% + 1px)',
                  backgroundColor: mappingType === 'bns_ipc' ? '#1E65AD' : mappingType === 'bsa_iea' ? '#CF9B63' : '#8C969F',
                }}
                transition={{ 
                  type: "spring", 
                  stiffness: 300, 
                  damping: 30 
                }}
                style={{
                  width: 'calc(33.33% - 2px)',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                }}
              />
              <motion.button
                onClick={() => updateMappingType('bns_ipc')}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className={`flex-1 px-2 py-2 rounded-lg font-semibold transition-all duration-300 relative z-10 text-xs ${
                  mappingType === 'bns_ipc'
                    ? 'text-white'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
                style={{ fontFamily: 'Roboto, sans-serif' }}
              >
                IPC ↔ BNS
              </motion.button>
              <motion.button
                onClick={() => updateMappingType('bsa_iea')}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className={`flex-1 px-2 py-2 rounded-lg font-semibold transition-all duration-300 relative z-10 text-xs ${
                  mappingType === 'bsa_iea'
                    ? 'text-white'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
                style={{ fontFamily: 'Roboto, sans-serif' }}
              >
                IEA ↔ BSA
              </motion.button>
              <motion.button
                onClick={() => updateMappingType('bnss_crpc')}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className={`flex-1 px-2 py-2 rounded-lg font-semibold transition-all duration-300 relative z-10 text-xs ${
                  mappingType === 'bnss_crpc'
                    ? 'text-white'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
                style={{ fontFamily: 'Roboto, sans-serif' }}
              >
                CrPC ↔ BNSS
              </motion.button>
            </div>
          </div>
          
          {/* Filter Fields Section */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5" style={{ fontFamily: 'Roboto, sans-serif' }}>
                Subject
              </label>
              <input
                type="text"
                value={filters.subject}
                onChange={(e) => handleFilterChange('subject', e.target.value)}
                placeholder="e.g., Theft, Murder"
                className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E65AD] focus:border-[#1E65AD] bg-white"
                style={{ fontFamily: 'Roboto, sans-serif' }}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5" style={{ fontFamily: 'Roboto, sans-serif' }}>
                Section (Any)
              </label>
              <input
                type="text"
                value={filters.section}
                onChange={(e) => handleFilterChange('section', e.target.value)}
                placeholder="e.g., 302, 103"
                className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E65AD] focus:border-[#1E65AD] bg-white"
                style={{ fontFamily: 'Roboto, sans-serif' }}
              />
              <p className="text-[10px] text-gray-500 mt-1">Searches in both sections</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {mappingType === 'bns_ipc' ? 'BNS Section' : mappingType === 'bsa_iea' ? 'BSA Section' : 'BNSS Section'}
              </label>
              <input
                type="text"
                value={filters.source_section}
                onChange={(e) => handleFilterChange('source_section', e.target.value)}
                placeholder={mappingType === 'bns_ipc' ? 'e.g., 101, 103' : mappingType === 'bsa_iea' ? 'e.g., 3, 5' : 'e.g., 154, 161'}
                className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E65AD] focus:border-[#1E65AD] bg-white"
                style={{ fontFamily: 'Roboto, sans-serif' }}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {mappingType === 'bns_ipc' ? 'IPC Section' : mappingType === 'bsa_iea' ? 'IEA Section' : 'CrPC Section'}
              </label>
              <input
                type="text"
                value={filters.target_section}
                onChange={(e) => handleFilterChange('target_section', e.target.value)}
                placeholder={mappingType === 'bns_ipc' ? 'e.g., 302, 304' : mappingType === 'bsa_iea' ? 'e.g., 3, 5' : 'e.g., 154, 161'}
                className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E65AD] focus:border-[#1E65AD] bg-white"
                style={{ fontFamily: 'Roboto, sans-serif' }}
              />
            </div>
          </div>

          {/* Filter Actions */}
          <div className="flex flex-col gap-2 pt-4 mt-4 border-t border-gray-200">
            <button
              onClick={applyFilters}
              disabled={loading || isFetchingRef.current}
              className="w-full px-4 py-2 text-white rounded-lg font-semibold shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-xs transition-all"
              style={{ fontFamily: 'Roboto, sans-serif', backgroundColor: '#1E65AD' }}
            >
              {loading || isSearching ? (
                <>
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Searching...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Apply Filters
                </>
              )}
            </button>
            <button
              onClick={clearFilters}
              disabled={loading || isFetchingRef.current}
              className="w-full px-4 py-2 bg-white text-gray-700 border-2 border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 active:bg-gray-100 font-semibold shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-xs transition-all"
              style={{ fontFamily: 'Roboto, sans-serif' }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Clear All
            </button>
          </div>

          {/* Active Filters Display */}
          {Object.values(filters).some(val => val && (typeof val === 'string' ? val.trim() !== '' : val !== '')) && (
            <div className="mt-3 p-2 bg-[#E6F0F8] border border-[#B3D4ED] rounded-lg">
              <h3 className="text-xs font-medium mb-1.5" style={{ fontFamily: 'Roboto, sans-serif', color: '#1E65AD' }}>
                Active Filters:
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(filters).map(([key, value]) => {
                  if (value && (typeof value === 'string' ? value.trim() !== '' : value !== '')) {
                    const label = key === 'source_section' ? 'Source Section' : 
                                 key === 'target_section' ? 'Target Section' :
                                 key.charAt(0).toUpperCase() + key.slice(1);
                    return (
                      <span key={key} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-[#CCE0F0] text-[#1E65AD] break-words">
                        {label}: "{value}"
                      </span>
                    );
                  }
                  return null;
                })}
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-6 py-4 md:ml-[296px] pt-32 md:pt-4" style={{ position: 'relative', zIndex: 1 }}>
        
        {/* SCROLLABLE CONTENT AREA */}
        <div className="transition-all duration-300">
          
          {/* SEARCH BAR - Desktop Only (Mobile search is in sticky header) */}
          <div className="mb-4 hidden md:block">
            <div className="max-w-6xl mx-auto">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3" style={{ backgroundColor: '#FFFFFF' }}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* Source Section Search */}
                  <div className="relative">
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      {mappingType === 'bns_ipc' ? 'BNS Section' : mappingType === 'bsa_iea' ? 'BSA Section' : 'BNSS Section'}
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={filters.source_section_search}
                        onChange={(e) => handleFilterChange('source_section_search', e.target.value)}
                        placeholder={mappingType === 'bns_ipc' ? 'e.g., 300, 302' : mappingType === 'bsa_iea' ? 'e.g., 3, 5' : 'e.g., 154, 161'}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !loading && !isFetchingRef.current) {
                            e.preventDefault();
                            applyFilters();
                          }
                        }}
                        className="w-full px-4 py-2.5 pl-10 pr-10 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#1E65AD] focus:border-[#1E65AD] text-sm shadow-sm bg-white transition-all"
                        style={{ fontFamily: 'Roboto, sans-serif', backgroundColor: '#FFFFFF' }}
                      />
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5" style={{ color: '#1E65AD' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <Mic className="h-4 w-4 text-gray-400" />
                      </div>
                    </div>
                  </div>

                  {/* Target Section Search */}
                  <div className="relative">
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      {mappingType === 'bns_ipc' ? 'IPC Section' : mappingType === 'bsa_iea' ? 'IEA Section' : 'CrPC Section'}
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={filters.target_section_search}
                        onChange={(e) => handleFilterChange('target_section_search', e.target.value)}
                    placeholder={mappingType === 'bns_ipc' ? 'e.g., 300, 103' : mappingType === 'bsa_iea' ? 'e.g., 3, 5' : 'e.g., 154, 161'}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !loading && !isFetchingRef.current) {
                        e.preventDefault();
                        applyFilters();
                      }
                    }}
                    className="w-full px-4 py-2.5 pl-10 pr-10 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#1E65AD] focus:border-[#1E65AD] text-sm shadow-sm bg-white transition-all"
                    style={{ fontFamily: 'Roboto, sans-serif', backgroundColor: '#FFFFFF' }}
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5" style={{ color: '#1E65AD' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <Mic className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
              </div>

              {/* Word Search */}
              <div className="relative">
                <label className="block text-xs font-semibold text-gray-700 mb-1.5" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  Word Search
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={filters.word_search}
                    onChange={(e) => handleFilterChange('word_search', e.target.value)}
                    placeholder="e.g., murder, punishment"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !loading && !isFetchingRef.current) {
                        e.preventDefault();
                        applyFilters();
                      }
                    }}
                    className="w-full px-4 py-2.5 pl-10 pr-10 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#1E65AD] focus:border-[#1E65AD] text-sm shadow-sm bg-white transition-all"
                    style={{ fontFamily: 'Roboto, sans-serif', backgroundColor: '#FFFFFF' }}
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5" style={{ color: '#1E65AD' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <Mic className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        </div>
          
          {/* Results Section */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg md:text-xl font-bold mb-1" style={{ color: '#1E65AD', fontFamily: "'Bricolage Grotesque', sans-serif" }}>
                  {Object.values(filters).some(val => val && (typeof val === 'string' ? val.trim() !== '' : val !== '')) 
                    ? `Search Results - ${mappingTypeLabel}` 
                    : `Latest ${mappingTypeLabel}`}
                </h2>
                <p className="text-xs text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  {Object.values(filters).some(val => val && (typeof val === 'string' ? val.trim() !== '' : val !== '')) 
                    ? `Showing mappings matching your search criteria` 
                    : `Showing the most recent mappings first`}
                </p>
              </div>
              <div className="text-right">
                <div className="text-xs font-semibold text-gray-700" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  {mappings.length} {mappings.length === 1 ? 'Mapping' : 'Mappings'}
                </div>
                {hasMore && !loading && (
                  <div className="text-xs mt-0.5" style={{ fontFamily: 'Roboto, sans-serif', color: '#1E65AD' }}>
                    More available
                  </div>
                )}
              </div>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  className="mb-3 p-2.5 bg-red-50 border-l-4 border-red-400 rounded-lg shadow-sm"
                >
                <div className="flex flex-col gap-3">
                  <div className="flex items-start flex-1">
                    <svg className="w-4 h-4 text-red-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-red-800 font-semibold mb-1 text-xs" style={{ fontFamily: 'Roboto, sans-serif' }}>
                        Error Loading Mappings
                      </h4>
                      <p className="text-red-700 text-xs break-words" style={{ fontFamily: 'Roboto, sans-serif' }}>
                        {error}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setError(null);
                      fetchMappings(false);
                    }}
                    disabled={loading}
                    className="px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 flex-shrink-0 w-full sm:w-auto self-start sm:self-auto"
                    style={{ fontFamily: 'Roboto, sans-serif' }}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Retry
                  </button>
                </div>
              </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence mode="wait">
              {loading && mappings.length === 0 ? (
                <motion.div
                  key="loading-skeletons"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                >
                  <SkeletonGrid count={3} />
                </motion.div>
              ) : mappings.length === 0 && !error ? (
                <motion.div 
                  key="empty-state"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="text-center py-6 sm:py-8 md:py-12 lg:py-16 px-3 sm:px-4"
                >
                <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 mx-auto mb-3 sm:mb-4 md:mb-6 bg-[#E6F0F8] rounded-full flex items-center justify-center">
                  <svg className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 text-[#1E65AD]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-base sm:text-lg md:text-xl font-semibold text-gray-800 mb-2 sm:mb-3 px-2" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
                  No mappings found
                </h3>
                <p className="text-xs sm:text-sm md:text-base text-gray-600 mb-4 sm:mb-6 max-w-md mx-auto px-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  {Object.values(filters).some(val => val && (typeof val === 'string' ? val.trim() !== '' : val !== ''))
                    ? 'No mappings match your current search criteria. Try adjusting your filters or search terms.'
                    : `No mappings are currently available. Please check back later.`}
                </p>
                {Object.values(filters).some(val => val && (typeof val === 'string' ? val.trim() !== '' : val !== '')) && (
                  <button
                    onClick={clearFilters}
                    className="px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 bg-[#1E65AD] text-white rounded-lg hover:bg-[#1A5490] transition-colors font-medium text-xs sm:text-sm md:text-base"
                    style={{ fontFamily: 'Roboto, sans-serif' }}
                  >
                    Clear All Filters
                  </button>
                )}
                </motion.div>
              ) : (
                <motion.div 
                  key="mappings-list-container"
                  className="relative space-y-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                >
                  <AnimatePresence mode="popLayout">
                    {mappings.map((mapping, index) => {
                  // Get section numbers based on mapping type
                  const getSourceSection = () => {
                    if (mappingType === 'bns_ipc') {
                      return mapping.ipc_section || mapping.source_section;
                    } else if (mappingType === 'bsa_iea') {
                      return mapping.iea_section || mapping.source_section;
                    } else {
                      return mapping.crpc_section || mapping.source_section;
                    }
                  };
                  
                  const getTargetSection = () => {
                    if (mappingType === 'bns_ipc') {
                      return mapping.bns_section || mapping.target_section;
                    } else if (mappingType === 'bsa_iea') {
                      return mapping.bsa_section || mapping.target_section;
                    } else {
                      return mapping.bnss_section || mapping.target_section;
                    }
                  };
                  
                  const sourceSection = getSourceSection();
                  const targetSection = getTargetSection();
                  const subject = mapping.subject || mapping.title || 'Mapping';
                  const summary = mapping.summary || mapping.description || mapping.source_description || '';
                  
                  // Get colors based on mapping type - all use red and green pattern
                  const getSourceColor = () => {
                    return { bg: 'bg-red-50', text: 'text-red-600' };
                  };
                  
                  const getTargetColor = () => {
                    return { bg: 'bg-green-50', text: 'text-green-600' };
                  };
                  
                  const sourceColor = getSourceColor();
                  const targetColor = getTargetColor();
                  
                  const getSourceLabel = () => {
                    if (mappingType === 'bns_ipc') return 'IPC Section';
                    if (mappingType === 'bsa_iea') return 'IEA Section';
                    return 'CrPC Section';
                  };
                  
                  const getTargetLabel = () => {
                    if (mappingType === 'bns_ipc') return 'BNS Section';
                    if (mappingType === 'bsa_iea') return 'BSA Section';
                    return 'BNSS Section';
                  };
                  
                  return (
                    <motion.div
                      key={mapping.id || `mapping-${index}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div 
                        onClick={() => viewMappingDetails(mapping)}
                        className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm hover:shadow-md hover:border-[#1E65AD] transition-all duration-200 cursor-pointer group"
                        style={{ borderColor: '#E5E7EB' }}
                      >
                        {/* Card Content */}
                        <div className="px-4 sm:px-5 md:px-6 py-4 sm:py-5">
                          {/* Title and Latest Tag */}
                          <div className="mb-4 sm:mb-3">
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <h3 
                                className="text-base sm:text-sm md:text-base font-medium flex-1 line-clamp-2 group-hover:text-[#1A5490] transition-colors" 
                                style={{ 
                                  color: '#1E65AD', 
                                  fontFamily: "'Heebo', sans-serif",
                                  lineHeight: '1.4',
                                  fontWeight: 500
                                }}
                                dangerouslySetInnerHTML={{
                                  __html: (() => {
                                    let highlight = mapping.highlights?.subject?.[0] || 
                                                   mapping.highlights?.title?.[0] ||
                                                   mapping.highlights?.searchable_text?.[0];
                                    if (!highlight && searchMetadata?.highlights?.[mapping.id]) {
                                      highlight = searchMetadata.highlights[mapping.id].subject?.[0] || 
                                                 searchMetadata.highlights[mapping.id].title?.[0] ||
                                                 searchMetadata.highlights[mapping.id].searchable_text?.[0];
                                    }
                                    if (highlight) {
                                      return highlight;
                                    }
                                    return (subject || '').replace(/</g, '&lt;').replace(/>/g, '&gt;');
                                  })()
                                }}
                              />
                              {index === 0 && !loading && (
                                <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold flex-shrink-0" style={{ backgroundColor: '#D1FAE5', color: '#065F46' }}>
                                  Latest
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Section Mapping Display - Three Boxes Layout */}
                          <div className="flex items-center justify-center gap-2 sm:gap-3 mb-4">
                            {/* Source Section Box - Red */}
                            <div className="flex-1 bg-red-50 rounded-lg p-3 border border-red-200">
                              <p className="text-xs text-gray-600 mb-2 text-center" style={{ fontFamily: "'Heebo', sans-serif" }}>
                                {getSourceLabel()}
                              </p>
                              {sourceSection && (
                                <div 
                                  className="text-2xl md:text-3xl font-bold text-center text-red-600"
                                  style={{ fontFamily: "'Heebo', sans-serif" }}
                                  dangerouslySetInnerHTML={{
                                    __html: (() => {
                                      let highlight = null;
                                      if (mappingType === 'bns_ipc') {
                                        highlight = mapping.highlights?.ipc_section?.[0];
                                      } else if (mappingType === 'bsa_iea') {
                                        highlight = mapping.highlights?.iea_section?.[0];
                                      } else if (mappingType === 'bnss_crpc') {
                                        highlight = mapping.highlights?.crpc_section?.[0];
                                      }
                                      if (!highlight && searchMetadata?.highlights?.[mapping.id]) {
                                        if (mappingType === 'bns_ipc') {
                                          highlight = searchMetadata.highlights[mapping.id].ipc_section?.[0];
                                        } else if (mappingType === 'bsa_iea') {
                                          highlight = searchMetadata.highlights[mapping.id].iea_section?.[0];
                                        } else if (mappingType === 'bnss_crpc') {
                                          highlight = searchMetadata.highlights[mapping.id].crpc_section?.[0];
                                        }
                                      }
                                      return highlight || sourceSection;
                                    })()
                                  }}
                                />
                              )}
                            </div>

                            {/* Arrow Icon with "Maps to" - Blue */}
                            <div className="flex flex-col items-center justify-center gap-1">
                              <svg className="w-6 h-6" style={{ color: '#1E65AD' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                              </svg>
                              <p className="text-xs text-gray-500" style={{ fontFamily: "'Heebo', sans-serif" }}>
                                Maps to
                              </p>
                            </div>

                            {/* Target Section Box - Green */}
                            <div className="flex-1 bg-green-50 rounded-lg p-3 border border-green-200">
                              <p className="text-xs text-gray-600 mb-2 text-center" style={{ fontFamily: "'Heebo', sans-serif" }}>
                                {getTargetLabel()}
                              </p>
                              {targetSection && (
                                <div 
                                  className="text-2xl md:text-3xl font-bold text-center text-green-600"
                                  style={{ fontFamily: "'Heebo', sans-serif" }}
                                  dangerouslySetInnerHTML={{
                                    __html: (() => {
                                      let highlight = null;
                                      if (mappingType === 'bns_ipc') {
                                        highlight = mapping.highlights?.bns_section?.[0];
                                      } else if (mappingType === 'bsa_iea') {
                                        highlight = mapping.highlights?.bsa_section?.[0];
                                      } else if (mappingType === 'bnss_crpc') {
                                        highlight = mapping.highlights?.bnss_section?.[0];
                                      }
                                      if (!highlight && searchMetadata?.highlights?.[mapping.id]) {
                                        if (mappingType === 'bns_ipc') {
                                          highlight = searchMetadata.highlights[mapping.id].bns_section?.[0];
                                        } else if (mappingType === 'bsa_iea') {
                                          highlight = searchMetadata.highlights[mapping.id].bsa_section?.[0];
                                        } else if (mappingType === 'bnss_crpc') {
                                          highlight = searchMetadata.highlights[mapping.id].bnss_section?.[0];
                                        }
                                      }
                                      return highlight || targetSection;
                                    })()
                                  }}
                                />
                              )}
                            </div>
                          </div>

                          {/* Description and View Details Button - Desktop */}
                          <div className="hidden sm:flex items-start justify-between gap-4">
                            {/* Description Text */}
                            {summary && (
                              <div className="flex-1">
                                <p 
                                  className="text-sm text-gray-700 leading-relaxed" 
                                  style={{ fontFamily: "'Heebo', sans-serif" }}
                                  dangerouslySetInnerHTML={{
                                    __html: (() => {
                                      let highlight = mapping.highlights?.summary?.[0] || 
                                                     mapping.highlights?.description?.[0] || 
                                                     mapping.highlights?.source_description?.[0] ||
                                                     mapping.highlights?.searchable_text?.[0];
                                      if (!highlight && searchMetadata?.highlights?.[mapping.id]) {
                                        const metaHighlights = searchMetadata.highlights[mapping.id];
                                        highlight = metaHighlights.summary?.[0] || 
                                                   metaHighlights.description?.[0] ||
                                                   metaHighlights.source_description?.[0] ||
                                                   metaHighlights.searchable_text?.[0];
                                      }
                                      if (highlight) {
                                        return highlight;
                                      }
                                      return (summary || '').replace(/</g, '&lt;').replace(/>/g, '&gt;');
                                    })()
                                  }}
                                />
                              </div>
                            )}

                            {/* View Details Button - Desktop Only */}
                            <div className="flex-shrink-0">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  viewMappingDetails(mapping);
                                }}
                                className="px-4 py-2 rounded-lg font-semibold text-xs transition-all duration-200 flex items-center justify-center gap-1.5 whitespace-nowrap hover:shadow-md hover:bg-[#1A5490]"
                                style={{ 
                                  backgroundColor: '#1E65AD',
                                  color: '#FFFFFF',
                                  fontFamily: "'Heebo', sans-serif"
                                }}
                              >
                                <span>View Details</span>
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                              </button>
                            </div>
                          </div>

                          {/* Description - Mobile Only */}
                          {summary && (
                            <div className="sm:hidden mb-4">
                              <p 
                                className="text-sm text-gray-700 leading-relaxed" 
                                style={{ fontFamily: "'Heebo', sans-serif" }}
                                dangerouslySetInnerHTML={{
                                  __html: (() => {
                                    let highlight = mapping.highlights?.summary?.[0] || 
                                                   mapping.highlights?.description?.[0] || 
                                                   mapping.highlights?.source_description?.[0] ||
                                                   mapping.highlights?.searchable_text?.[0];
                                    if (!highlight && searchMetadata?.highlights?.[mapping.id]) {
                                      const metaHighlights = searchMetadata.highlights[mapping.id];
                                      highlight = metaHighlights.summary?.[0] || 
                                                 metaHighlights.description?.[0] ||
                                                 metaHighlights.source_description?.[0] ||
                                                 metaHighlights.searchable_text?.[0];
                                    }
                                    if (highlight) {
                                      return highlight;
                                    }
                                    return (summary || '').replace(/</g, '&lt;').replace(/>/g, '&gt;');
                                  })()
                                }}
                              />
                            </div>
                          )}

                          {/* View Details Button - Mobile Only (Full Width) */}
                          <div className="sm:hidden mt-4 pt-4 border-t border-gray-200">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                viewMappingDetails(mapping);
                              }}
                              className="w-full px-4 py-3 bg-[#1E65AD] text-white rounded-lg hover:bg-[#1A5490] active:bg-[#164373] transition-colors font-semibold text-sm shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#1E65AD] focus:ring-offset-2 flex items-center justify-center gap-2"
                              style={{ fontFamily: "'Heebo', sans-serif" }}
                              aria-label="View mapping details"
                            >
                              <span>View Details</span>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                    })}
                  </AnimatePresence>
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Infinite Scroll Loader */}
            {mappings.length > 0 && (
              <div ref={loadingRef} className="mt-4 py-6 flex items-center justify-center" style={{ minHeight: '100px' }}>
                {isLoadingMore ? (
                  <div className="flex flex-col items-center gap-3">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1E65AD]"></div>
                    <p className="text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      Loading more mappings...
                    </p>
                  </div>
                ) : hasMore ? (
                  <p className="text-sm text-gray-500" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    Scroll down to load more
                  </p>
                ) : (
                  <p className="text-sm text-gray-500" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    No more mappings to load
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      
      <ScrollToTopButton />

    </div>
  );
}
