import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { AutoComplete } from 'primereact/autocomplete';
import Navbar from "../components/landing/Navbar";
import apiService from "../services/api";
import { useInfiniteScroll } from "../hooks/useInfiniteScroll";
import { SkeletonGrid, SmoothTransitionWrapper } from "../components/EnhancedLoadingComponents";
import { InfiniteScrollLoader } from "../components/LoadingComponents";
import { useAuth } from "../contexts/AuthContext";
import { useURLFilters } from "../hooks/useURLFilters";
import ScrollToTopButton from "../components/ScrollToTopButton";

// Add custom CSS animations
const customStyles = `
  @keyframes fade-in-up {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @keyframes slide-in-bottom {
    from {
      opacity: 0;
      transform: translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .animate-fade-in-up {
    animation: fade-in-up 0.6s ease-out forwards;
  }
  
  .animate-slide-in-bottom {
    animation: slide-in-bottom 0.6s ease-out forwards;
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.type = "text/css";
  styleSheet.innerText = customStyles;
  if (!document.getElementById('law-library-styles')) {
    styleSheet.id = 'law-library-styles';
    document.head.appendChild(styleSheet);
  }
}

export default function LawLibrary() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  
  // Check if user is authenticated
  const isUserAuthenticated = useMemo(() => {
    const token = localStorage.getItem('access_token') || 
                  localStorage.getItem('accessToken') || 
                  localStorage.getItem('token');
    const hasValidToken = !!token && token !== 'null' && token !== 'undefined';
    return isAuthenticated && hasValidToken;
  }, [isAuthenticated]);
  
  // Initialize activeSection from URL search params or default to "central"
  const getInitialSection = () => {
    const searchParams = new URLSearchParams(location.search);
    const section = searchParams.get('section');
    return (section === 'state' || section === 'central') ? section : 'central';
  };
  
  const [activeSection, setActiveSection] = useState(getInitialSection);
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
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
  
  // Initialize filters based on active section
  const getInitialFilters = (section) => {
    if (section === "central") {
      return {
        search: '',
        act_id: '',
        ministry: '',
        department: '',
        year: '',
        type: ''
      };
    } else {
      return {
        search: '',
        state: '',
        act_number: '',
        year: '',
        department: ''
      };
    }
  };

  // Use URL-persisted filters hook
  const [filters, setFilters, clearFilters] = useURLFilters(
    getInitialFilters(getInitialSection()),
    { replace: false, syncOnMount: true }
  );
  
  // Update filters when section changes
  useEffect(() => {
    const newFilters = getInitialFilters(activeSection);
    // Only update if section-specific filters are different
    const currentFilters = filters;
    const needsUpdate = Object.keys(newFilters).some(key => {
      if (activeSection === "central") {
        // For central, remove state-specific filters
        return key === 'state' || key === 'act_number';
      } else {
        // For state, remove central-specific filters
        return key === 'act_id' || key === 'ministry' || key === 'type';
      }
    });
    
    if (needsUpdate) {
      // Merge existing filters with new defaults, preserving common filters
      const mergedFilters = { ...newFilters };
      Object.keys(currentFilters).forEach(key => {
        if (newFilters.hasOwnProperty(key) && currentFilters[key]) {
          mergedFilters[key] = currentFilters[key];
        }
      });
      setFilters(mergedFilters);
    }
  }, [activeSection]); // Only run when section changes
  const [acts, setActs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  // Highlights are now enabled by default when searching
  // Removed enableHighlights state - highlights are always on for searches
  const [searchInfo, setSearchInfo] = useState(null);
  const scrollTimeoutRef = useRef(null);
  const [isScrolled, setIsScrolled] = useState(false); // Track if user has scrolled
  
  const filtersRef = useRef(filters);
  useEffect(() => {
    filtersRef.current = filters;
  }, [filters]);

  const librarySections = [
    {
      id: "central",
      title: "Central Acts",
      path: "/central-acts",
      description: "Browse acts passed by the Parliament of India. Search through central legislation, regulations, and constitutional documents.",
      color: "#1E65AD",
    },
    {
      id: "state",
      title: "State Acts",
      path: "/state-acts",
      description: "Access acts and legislation from various state governments across India. Find state-specific laws and regulations.",
      color: "#CF9B63",
    }
  ];

  const activeSectionData = librarySections.find(s => s.id === activeSection) || librarySections[0];
  const sectionLabel = activeSectionData.title;

  // Store activeSection in ref to access latest value in callbacks
  const activeSectionRef = useRef(activeSection);
  useEffect(() => {
    activeSectionRef.current = activeSection;
  }, [activeSection]);

  // Local input values for smooth typing (prevent cursor jumping)
  const [localInputs, setLocalInputs] = useState({});
  const debounceTimersRef = useRef({});
  const focusedInputRef = useRef(null);

  // Initialize local inputs from filters on mount and when filters change from URL
  useEffect(() => {
    // Only sync if no input is focused (e.g., from URL back button)
    if (!focusedInputRef.current) {
      setLocalInputs(prev => {
        const newInputs = { ...prev };
        Object.keys(filters).forEach(key => {
          if (prev[key] === undefined || prev[key] !== filters[key]) {
            newInputs[key] = filters[key] || '';
          }
        });
        return newInputs;
      });
    }
  }, [filters]);

  // Get input value - use local value if exists, otherwise use filter value
  const getInputValue = (filterName) => {
    return localInputs[filterName] !== undefined ? localInputs[filterName] : (filters[filterName] || '');
  };

  // Handle input change - update local state immediately, debounce URL sync
  const handleFilterChange = useCallback((key, value) => {
    // Update local input immediately (no re-render from URL update)
    setLocalInputs(prev => ({
      ...prev,
      [key]: value
    }));
    
    if (key === 'search') {
      setSearchQuery(value);
    }
    
    // Clear existing debounce timer for this input
    if (debounceTimersRef.current[key]) {
      clearTimeout(debounceTimersRef.current[key]);
    }
    
    // Debounce the URL/filter update to prevent cursor jumping
    debounceTimersRef.current[key] = setTimeout(() => {
      setFilters(prev => {
        if (prev[key] === value) return prev;
        return { ...prev, [key]: value };
      });
      
      // Ensure section parameter is preserved in URL after filter update
      setTimeout(() => {
        const currentPath = window.location.pathname;
        const currentSearch = window.location.search;
        const searchParams = new URLSearchParams(currentSearch);
        const sectionFromUrl = searchParams.get('section');
        const currentSection = activeSectionRef.current;
        
        if (!sectionFromUrl || (sectionFromUrl !== 'state' && sectionFromUrl !== 'central')) {
          searchParams.set('section', currentSection);
          const newSearch = searchParams.toString();
          navigate(`${currentPath}?${newSearch}`, { replace: true });
        }
      }, 50);
    }, 300); // 300ms debounce
  }, [setFilters, navigate]);

  // Handle input focus
  const handleInputFocus = (filterName) => {
    focusedInputRef.current = filterName;
  };

  // Handle input blur
  const handleInputBlur = (filterName) => {
    // Clear debounce and sync immediately on blur
    if (debounceTimersRef.current[filterName]) {
      clearTimeout(debounceTimersRef.current[filterName]);
    }
    
    // Sync local value to filters immediately
    const localValue = localInputs[filterName];
    if (localValue !== undefined && localValue !== filters[filterName]) {
      setFilters(prev => ({
        ...prev,
        [filterName]: localValue
      }));
    }
    
    setTimeout(() => {
      if (focusedInputRef.current === filterName) {
        focusedInputRef.current = null;
      }
    }, 100);
  };

  // Cleanup debounce timers on unmount
  useEffect(() => {
    return () => {
      Object.values(debounceTimersRef.current).forEach(timer => {
        if (timer) clearTimeout(timer);
      });
    };
  }, []);

  
  // Update searchQuery when filters.search changes (e.g., from URL)
  useEffect(() => {
    if (filters.search !== undefined) {
      setSearchQuery(filters.search);
    }
  }, [filters.search]);

  const fetchActs = useCallback(async (loadMore = false, customFilters = null) => {
    if (isSearching && !loadMore) {
      return;
    }
    
    setIsSearching(true);
    setLoading(true);
    setError(null);
    
    try {
      const activeFilters = customFilters !== null ? customFilters : filtersRef.current;
      const currentOffset = loadMore ? (pagination?.offset || 0) + (pagination?.current_page_size || 0) : 0;
      
      // Build API parameters
      const params = {
        limit: 20,
        offset: currentOffset
      };

      // Central Acts specific filters
      if (activeSection === "central") {
        // For Central Acts: Use 'search' parameter for Elasticsearch full-text search
        // This searches PDF content, not just metadata
        if (activeFilters.search && typeof activeFilters.search === 'string' && activeFilters.search.trim()) {
          params.search = activeFilters.search.trim();
          // Always enable highlights when searching
          params.highlight = true;
        }
        
        if (activeFilters.act_id && typeof activeFilters.act_id === 'string' && activeFilters.act_id.trim()) {
          params.act_id = activeFilters.act_id.trim();
        }
        if (activeFilters.ministry && typeof activeFilters.ministry === 'string' && activeFilters.ministry.trim()) {
          params.ministry = activeFilters.ministry.trim();
        }
      } else {
        // State Acts: Use 'search' parameter for Elasticsearch full-text search
        // This searches in metadata and PDF content, similar to central acts
        if (activeFilters.search && typeof activeFilters.search === 'string' && activeFilters.search.trim()) {
          params.search = activeFilters.search.trim();
          // Always enable highlights when searching
          params.highlight = true;
        }
        
        // State Acts specific filters
        if (activeFilters.act_number && typeof activeFilters.act_number === 'string' && activeFilters.act_number.trim()) {
          params.act_number = activeFilters.act_number.trim();
        }
        if (activeFilters.state && typeof activeFilters.state === 'string' && activeFilters.state.trim()) {
          params.state = activeFilters.state.trim();
        }
        // Also support short_title for traditional filtering (when not using search)
        if (activeFilters.short_title && typeof activeFilters.short_title === 'string' && activeFilters.short_title.trim() && !params.search) {
          params.short_title = activeFilters.short_title.trim();
        }
      }
      
      // Common filters
      if (activeFilters.department && typeof activeFilters.department === 'string' && activeFilters.department.trim()) {
        params.department = activeFilters.department.trim();
      }
      
      if (activeFilters.year) {
        const yearValue = typeof activeFilters.year === 'string' ? activeFilters.year.trim() : String(activeFilters.year);
        if (yearValue) {
          const yearInt = parseInt(yearValue);
          if (!isNaN(yearInt) && yearInt > 0) {
            params.year = yearInt;
          }
        }
      }

      // Fetch data based on active section
      let data;
      if (activeSection === "central") {
        data = await apiService.getCentralActs(params);
      } else {
        data = await apiService.getStateActs(params);
      }

      if (!data || !data.data) {
        setActs([]);
        setError("No data received from the server");
        setPagination(null);
        setSearchInfo(null);
        return;
      }

      // Store search info if available (from Elasticsearch)
      if (data.search_info) {
        setSearchInfo(data.search_info);
      } else {
        setSearchInfo(null);
      }

      // For Elasticsearch results, don't sort by year (they're already sorted by relevance)
      // Only sort by year if not using Elasticsearch
      if (data.data && data.data.length > 0 && !data.search_info) {
        data.data = data.data.sort((a, b) => {
          const yearA = parseInt(a.year) || 0;
          const yearB = parseInt(b.year) || 0;
          return yearB - yearA;
        });
      }

      if (loadMore) {
        setActs(prev => [...prev, ...(data.data || [])]);
      } else {
        setActs(data.data || []);
      }

      setPagination(data.pagination_info || null);
      setTotalCount(data.pagination_info?.total_count || data.data?.length || 0);
      
    } catch (err) {
      console.error('Error fetching acts:', err);
      setError(err.message || "Failed to fetch acts. Please try again.");
      if (!loadMore) {
        setActs([]);
      }
    } finally {
      setLoading(false);
      setIsSearching(false);
    }
  }, [activeSection, pagination, isSearching]);

  const fetchActsRef = useRef(fetchActs);
  useEffect(() => {
    fetchActsRef.current = fetchActs;
  }, [fetchActs]);

  // Handle select/dropdown filter change - auto-apply immediately (no debounce needed)
  const handleSelectFilterChange = (key, value) => {
    // Update filters immediately
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    
    // Also update local inputs to keep them in sync
    setLocalInputs(prev => ({
      ...prev,
      [key]: value
    }));
    
    // Fetch with new filters immediately
    setPagination(null);
    setError(null);
    
    // Use setTimeout to ensure state is updated before fetch
    setTimeout(() => {
      // Merge local inputs with new filters for the fetch
      const mergedFilters = { ...newFilters };
      Object.keys(localInputs).forEach(k => {
        if (k !== key && localInputs[k] !== undefined) {
          mergedFilters[k] = localInputs[k];
        }
      });
      if (fetchActsRef.current) {
        fetchActsRef.current(false, mergedFilters);
      }
    }, 50);
  };

  const loadMoreData = useCallback(() => {
    if (fetchActsRef.current && pagination?.has_more && !loading && !isSearching) {
      fetchActsRef.current(true);
    }
  }, [pagination, loading, isSearching]);

  const { loadingRef, isLoadingMore, error: scrollError, retry } = useInfiniteScroll({
    fetchMore: loadMoreData,
    hasMore: pagination?.has_more || false,
    isLoading: loading || isSearching
  });

  const applyFilters = () => {
    // Clear all debounce timers first
    Object.values(debounceTimersRef.current).forEach(timer => {
      if (timer) clearTimeout(timer);
    });
    
    // Sync all local inputs to filters immediately
    const mergedFilters = { ...filters };
    Object.keys(localInputs).forEach(key => {
      if (localInputs[key] !== undefined) {
        mergedFilters[key] = localInputs[key];
      }
    });
    
    // Update filters state with merged values
    setFilters(mergedFilters);
    
    // Don't clear acts immediately - keep existing data visible during loading
    // This prevents the "flash" effect
    setPagination(null);
    setError(null);
    
    // Fetch new data immediately (no delay needed)
    fetchActs(false, mergedFilters);
  };
  
  // Auto-apply filters removed to prevent duplicate fetches and refresh effect
  // Filters are now applied manually via the Apply Filters button or Enter key

  const handleClearFilters = () => {
    // Clear all debounce timers
    Object.values(debounceTimersRef.current).forEach(timer => {
      if (timer) clearTimeout(timer);
    });
    
    const emptyFilters = getInitialFilters(activeSection);
    
    // Clear local inputs
    setLocalInputs({});
    
    setFilters(emptyFilters);
    setSearchQuery('');
    // Don't clear acts immediately - keep existing data visible during loading
    setPagination(null);
    setError(null);
    
    // Fetch immediately without delay
    fetchActs(false, emptyFilters);
  };

  const viewActDetails = (act) => {
    const actId = act.id || act.act_id;
    if (actId) {
      // Use different URLs for state vs central acts
      const isStateActType = activeSection === 'state';
      const actPath = isStateActType ? `/acts/state/${actId}` : `/acts/central/${actId}`;
      
      // Pass the complete act object and section type in navigation state
      navigate(actPath, { 
        state: { 
          act: act,
          section: activeSection, // 'central' or 'state'
          isStateAct: isStateActType
        } 
      });
    } else {
      // If no ID, try to extract from act data or show error
      console.error('No act ID available for navigation');
      // Still navigate but it will show error on the page
      navigate('/acts/0');
    }
  };


  const ministries = [
    "Ministry of Home Affairs",
    "Ministry of Law and Justice",
    "Ministry of Corporate Affairs",
    "Ministry of Consumer Affairs",
    "Ministry of Personnel, Public Grievances and Pensions",
    "Ministry of Road Transport and Highways",
    "Ministry of Finance",
    "Ministry of Health and Family Welfare"
  ];

  const states = [
    "Andhra Pradesh",
    "Arunachal Pradesh",
    "Assam",
    "Bihar",
    "Chhattisgarh",
    "Goa",
    "Gujarat",
    "Haryana",
    "Himachal Pradesh",
    "Jharkhand",
    "Karnataka",
    "Kerala",
    "Madhya Pradesh",
    "Maharashtra",
    "Manipur",
    "Meghalaya",
    "Mizoram",
    "Nagaland",
    "Odisha",
    "Punjab",
    "Rajasthan",
    "Sikkim",
    "Tamil Nadu",
    "Telangana",
    "Tripura",
    "Uttar Pradesh",
    "Uttarakhand",
    "West Bengal",
    "Delhi"
  ];

  const types = ["Central Act", "State Act", "Constitutional Document", "Ordinance", "Rule", "Regulation"];
  const years = Array.from({ length: 225 }, (_, i) => new Date().getFullYear() - i);

  // Initial load - ensure URL has section parameter
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    if (!searchParams.get('section')) {
      // If no section in URL, add it based on current activeSection
      navigate(`${location.pathname}?section=${activeSection}`, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount

  // Initial load
  useEffect(() => {
    if (!loading && acts.length === 0 && !isSearching) {
      fetchActs(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount

  // Ensure section parameter is always in URL and sync activeSection
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const sectionFromUrl = searchParams.get('section');
    
    // If section is missing or invalid from URL, add it based on current activeSection
    if (!sectionFromUrl || (sectionFromUrl !== 'state' && sectionFromUrl !== 'central')) {
      // Only update URL if section is truly missing (to avoid infinite loops)
      if (!sectionFromUrl) {
        searchParams.set('section', activeSection);
        const newSearch = searchParams.toString();
        navigate(`${location.pathname}?${newSearch}`, { replace: true });
      }
      // Keep current activeSection, don't change it
      return;
    }
    
    // Only update activeSection if URL has a valid section that's different from current
    if (sectionFromUrl === 'state' || sectionFromUrl === 'central') {
      if (sectionFromUrl !== activeSection) {
        setActiveSection(sectionFromUrl);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

  // Reload data when section changes (but preserve URL filters)
  useEffect(() => {
    setActs([]);
    setPagination(null);
    setError(null);
    setSearchInfo(null);
    // Don't clear filters on section change - let URL filters persist
    // Filters will be automatically filtered by section-specific fields in fetchActs
    if (fetchActsRef.current) {
      setTimeout(() => {
        fetchActsRef.current(false);
      }, 100);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSection]); // Reload when section changes

  // Scroll detection to hide header and move sidebar/search bar to top
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      setIsScrolled(scrollTop > 50);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
            
            {/* Search Bar */}
            <div className="flex-1">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200" style={{ backgroundColor: '#FFFFFF' }}>
                <div className="relative">
                  <AutoComplete
                    value={getInputValue('search')}
                    onChange={(e) => {
                      const value = e.value || '';
                      handleFilterChange('search', value);
                    }}
                    onFocus={() => handleInputFocus('search')}
                    onBlur={() => handleInputBlur('search')}
                    placeholder={activeSection === "central" 
                      ? "Search in PDF content (e.g., 'Section 302', 'murder', 'penalty')..." 
                      : `Search ${sectionLabel.toLowerCase()}...`}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !loading) {
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
                  <button
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                    title="Voice Search"
                    type="button"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                  </button>
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
              Law Library
            </h1>
            {/* Thick Orange-Brown Line */}
            <div className="w-16 sm:w-20 h-1 mx-auto mb-4 sm:mb-5" style={{ backgroundColor: '#CF9B63' }}></div>
            {/* Subtitle */}
            <p className="text-sm sm:text-base md:text-lg text-gray-600 max-w-3xl mx-auto px-4" style={{ fontFamily: "'Heebo', sans-serif" }}>
              Your comprehensive resource for accessing legal acts, regulations, and legislative documents from across India
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
              style={{ position: 'fixed' }}
            >
              {/* Mobile Sidebar Header */}
              <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 pt-20 flex items-center justify-between z-10">
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
                {/* Section Toggle */}
                <div className="mb-4">
                  <label className="block text-xs font-semibold text-gray-700 mb-2" style={{ fontFamily: "'Heebo', sans-serif" }}>
                    Act Type
                  </label>
                  <div className="relative inline-flex items-center bg-gray-100 rounded-xl p-1 shadow-inner w-full">
                    <motion.div
                      className="absolute top-0.5 bottom-0.5 rounded-lg z-0"
                      initial={false}
                      animate={{
                        left: activeSection === 'central' ? '2px' : 'calc(50% + 1px)',
                        backgroundColor: activeSection === 'central' ? '#1E65AD' : '#CF9B63',
                      }}
                      transition={{ 
                        type: "spring", 
                        stiffness: 300, 
                        damping: 30 
                      }}
                      style={{
                        width: 'calc(50% - 2px)',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                      }}
                    />
                    <motion.button
                      onClick={() => {
                        setActiveSection('central');
                        navigate(`${location.pathname}?section=central`, { replace: true });
                      }}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      className={`flex-1 px-2 py-2 rounded-lg font-semibold transition-all duration-300 relative z-10 text-xs ${
                        activeSection === 'central'
                          ? 'text-white'
                          : 'text-gray-600 hover:text-gray-800'
                      }`}
                      style={{ fontFamily: "'Heebo', sans-serif" }}
                    >
                      Central Acts
                    </motion.button>
                    <motion.button
                      onClick={() => {
                        setActiveSection('state');
                        navigate(`${location.pathname}?section=state`, { replace: true });
                      }}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      className={`flex-1 px-2 py-2 rounded-lg font-semibold transition-all duration-300 relative z-10 text-xs ${
                        activeSection === 'state'
                          ? 'text-white'
                          : 'text-gray-600 hover:text-gray-800'
                      }`}
                      style={{ fontFamily: "'Heebo', sans-serif" }}
                    >
                      State Acts
                    </motion.button>
                  </div>
                </div>
                
                {/* Filter Fields Section - Same as Desktop */}
                <div className="space-y-3">
                {activeSection === "central" ? (
                  /* Central Acts Filters */
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5" style={{ fontFamily: "'Heebo', sans-serif" }}>
                        Act ID
                      </label>
                      <input
                        type="text"
                        value={getInputValue('act_id')}
                        onChange={(e) => handleFilterChange('act_id', e.target.value)}
                        onFocus={() => handleInputFocus('act_id')}
                        onBlur={() => handleInputBlur('act_id')}
                        placeholder="e.g., 186901"
                        className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E65AD] focus:border-[#1E65AD] bg-white"
                        style={{ fontFamily: "'Heebo', sans-serif" }}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5" style={{ fontFamily: "'Heebo', sans-serif" }}>
                        Ministry
                      </label>
                      <select
                        value={filters.ministry || ''}
                        onChange={(e) => handleSelectFilterChange('ministry', e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E65AD] focus:border-[#1E65AD] bg-white"
                        style={{ fontFamily: "'Heebo', sans-serif" }}
                      >
                        <option value="">All Ministries</option>
                        {ministries.map((ministry) => (
                          <option key={ministry} value={ministry}>
                            {ministry}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5" style={{ fontFamily: "'Heebo', sans-serif" }}>
                        Department
                      </label>
                      <input
                        type="text"
                        value={getInputValue('department')}
                        onChange={(e) => handleFilterChange('department', e.target.value)}
                        onFocus={() => handleInputFocus('department')}
                        onBlur={() => handleInputBlur('department')}
                        placeholder="e.g., Legislative Department"
                        className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E65AD] focus:border-[#1E65AD] bg-white"
                        style={{ fontFamily: "'Heebo', sans-serif" }}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5" style={{ fontFamily: "'Heebo', sans-serif" }}>
                        Year
                      </label>
                      <select
                        value={filters.year || ''}
                        onChange={(e) => handleSelectFilterChange('year', e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E65AD] focus:border-[#1E65AD] bg-white"
                        style={{ fontFamily: "'Heebo', sans-serif" }}
                      >
                        <option value="">All Years</option>
                        {years.map(year => (
                          <option key={year} value={year}>{year}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5" style={{ fontFamily: "'Heebo', sans-serif" }}>
                        Type
                      </label>
                      <select
                        value={filters.type || ''}
                        onChange={(e) => handleSelectFilterChange('type', e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E65AD] focus:border-[#1E65AD] bg-white"
                        style={{ fontFamily: "'Heebo', sans-serif" }}
                      >
                        <option value="">All Types</option>
                        {types.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                ) : (
                  /* State Acts Filters */
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5" style={{ fontFamily: "'Heebo', sans-serif" }}>
                        State
                      </label>
                      <select
                        value={filters.state || ''}
                        onChange={(e) => handleSelectFilterChange('state', e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E65AD] focus:border-[#1E65AD] bg-white"
                        style={{ fontFamily: "'Heebo', sans-serif" }}
                      >
                        <option value="">All States</option>
                        {states.map((state) => (
                          <option key={state} value={state}>
                            {state}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5" style={{ fontFamily: "'Heebo', sans-serif" }}>
                        Act Number
                      </label>
                      <input
                        type="text"
                        value={getInputValue('act_number')}
                        onChange={(e) => handleFilterChange('act_number', e.target.value)}
                        onFocus={() => handleInputFocus('act_number')}
                        onBlur={() => handleInputBlur('act_number')}
                        placeholder="e.g., Act 12 of 2023"
                        className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E65AD] focus:border-[#1E65AD] bg-white"
                        style={{ fontFamily: "'Heebo', sans-serif" }}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5" style={{ fontFamily: "'Heebo', sans-serif" }}>
                        Department
                      </label>
                      <input
                        type="text"
                        value={getInputValue('department')}
                        onChange={(e) => handleFilterChange('department', e.target.value)}
                        onFocus={() => handleInputFocus('department')}
                        onBlur={() => handleInputBlur('department')}
                        placeholder="e.g., Legislative Department"
                        className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E65AD] focus:border-[#1E65AD] bg-white"
                        style={{ fontFamily: "'Heebo', sans-serif" }}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5" style={{ fontFamily: "'Heebo', sans-serif" }}>
                        Year
                      </label>
                      <select
                        value={filters.year || ''}
                        onChange={(e) => handleSelectFilterChange('year', e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E65AD] focus:border-[#1E65AD] bg-white"
                        style={{ fontFamily: "'Heebo', sans-serif" }}
                      >
                        <option value="">All Years</option>
                        {years.map(year => (
                          <option key={year} value={year}>{year}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
                </div>

                {/* Filter Actions */}
                <div className="flex flex-col gap-2 pt-4 mt-4 border-t border-gray-200">
                  <button
                    onClick={() => {
                      applyFilters();
                      setMobileSidebarOpen(false);
                    }}
                    disabled={loading}
                    className="w-full px-4 py-2 text-white rounded-lg font-semibold shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-xs transition-all"
                    style={{ fontFamily: "'Heebo', sans-serif", backgroundColor: '#1E65AD' }}
                  >
                    {loading ? (
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
                      handleClearFilters();
                      setMobileSidebarOpen(false);
                    }}
                    disabled={loading}
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
                {Object.values(filters).some(val => {
                  if (!val) return false;
                  if (typeof val === 'string') return val.trim() !== '';
                  if (typeof val === 'number') return val !== 0;
                  return val !== '';
                }) && (
                  <div className="mt-3 p-2 bg-[#E6F0F8] border border-[#B3D4ED] rounded-lg">
                    <h3 className="text-xs font-medium mb-1.5" style={{ fontFamily: "'Heebo', sans-serif", color: '#1E65AD' }}>
                      Active Filters:
                    </h3>
                    <div className="flex flex-wrap gap-1.5">
                      {Object.entries(filters).map(([key, value]) => {
                        const hasValue = value && (
                          typeof value === 'string' ? value.trim() !== '' :
                          typeof value === 'number' ? value !== 0 :
                          value !== ''
                        );
                        if (!hasValue) return null;
                        
                        let label = key;
                        if (key === 'act_id') label = 'Act ID';
                        else if (key === 'act_number') label = 'Act Number';
                        else label = key.charAt(0).toUpperCase() + key.slice(1);
                        
                        return (
                          <span key={key} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-[#CCE0F0] text-[#1E65AD] break-words">
                            {label}: "{value}"
                          </span>
                        );
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
          top: isScrolled ? '64px' : '320px',
          width: '280px'
        }}
      >
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 h-full overflow-y-auto" style={{ width: '100%', maxHeight: isScrolled ? 'calc(100vh - 80px)' : 'calc(100vh - 220px)' }}>
          {/* Section Toggle */}
          <div className="mb-4">
            <label className="block text-xs font-semibold text-gray-700 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
              Act Type
            </label>
            <div className="relative inline-flex items-center bg-gray-100 rounded-xl p-1 shadow-inner w-full">
              <motion.div
                className="absolute top-0.5 bottom-0.5 rounded-lg z-0"
                initial={false}
                animate={{
                  left: activeSection === 'central' ? '2px' : 'calc(50% + 1px)',
                  backgroundColor: activeSection === 'central' ? '#1E65AD' : '#CF9B63',
                }}
                transition={{ 
                  type: "spring", 
                  stiffness: 300, 
                  damping: 30 
                }}
                style={{
                  width: 'calc(50% - 2px)',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                }}
              />
              <motion.button
                onClick={() => {
                  setActiveSection('central');
                  navigate(`${location.pathname}?section=central`, { replace: true });
                }}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className={`flex-1 px-2 py-2 rounded-lg font-semibold transition-all duration-300 relative z-10 text-xs ${
                  activeSection === 'central'
                    ? 'text-white'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
                style={{ fontFamily: 'Roboto, sans-serif' }}
              >
                Central Acts
              </motion.button>
              <motion.button
                onClick={() => {
                  setActiveSection('state');
                  navigate(`${location.pathname}?section=state`, { replace: true });
                }}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className={`flex-1 px-2 py-2 rounded-lg font-semibold transition-all duration-300 relative z-10 text-xs ${
                  activeSection === 'state'
                    ? 'text-white'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
                style={{ fontFamily: 'Roboto, sans-serif' }}
              >
                State Acts
              </motion.button>
            </div>
          </div>
          
          {/* Filter Fields Section */}
          <div className="space-y-3">
          {activeSection === "central" ? (
            /* Central Acts Filters */
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  Act ID
                </label>
                <input
                  type="text"
                  value={getInputValue('act_id')}
                  onChange={(e) => handleFilterChange('act_id', e.target.value)}
                  onFocus={() => handleInputFocus('act_id')}
                  onBlur={() => handleInputBlur('act_id')}
                  placeholder="e.g., 186901"
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E65AD] focus:border-[#1E65AD] bg-white"
                  style={{ fontFamily: 'Roboto, sans-serif' }}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  Ministry
                </label>
                <select
                  value={filters.ministry || ''}
                  onChange={(e) => handleSelectFilterChange('ministry', e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E65AD] focus:border-[#1E65AD] bg-white"
                  style={{ fontFamily: 'Roboto, sans-serif' }}
                >
                  <option value="">All Ministries</option>
                  {ministries.map((ministry) => (
                    <option key={ministry} value={ministry}>
                      {ministry}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  Department
                </label>
                <input
                  type="text"
                  value={getInputValue('department')}
                  onChange={(e) => handleFilterChange('department', e.target.value)}
                  onFocus={() => handleInputFocus('department')}
                  onBlur={() => handleInputBlur('department')}
                  placeholder="e.g., Legislative Department"
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E65AD] focus:border-[#1E65AD] bg-white"
                  style={{ fontFamily: 'Roboto, sans-serif' }}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  Year
                </label>
                <select
                  value={filters.year || ''}
                  onChange={(e) => handleSelectFilterChange('year', e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E65AD] focus:border-[#1E65AD] bg-white"
                  style={{ fontFamily: 'Roboto, sans-serif' }}
                >
                  <option value="">All Years</option>
                  {years.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  Type
                </label>
                <select
                  value={filters.type || ''}
                  onChange={(e) => handleSelectFilterChange('type', e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E65AD] focus:border-[#1E65AD] bg-white"
                  style={{ fontFamily: 'Roboto, sans-serif' }}
                >
                  <option value="">All Types</option>
                  {types.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ) : (
            /* State Acts Filters */
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  State
                </label>
                <select
                  value={filters.state || ''}
                  onChange={(e) => handleSelectFilterChange('state', e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E65AD] focus:border-[#1E65AD] bg-white"
                  style={{ fontFamily: 'Roboto, sans-serif' }}
                >
                  <option value="">All States</option>
                  {states.map((state) => (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  Act Number
                </label>
                <input
                  type="text"
                  value={getInputValue('act_number')}
                  onChange={(e) => handleFilterChange('act_number', e.target.value)}
                  onFocus={() => handleInputFocus('act_number')}
                  onBlur={() => handleInputBlur('act_number')}
                  placeholder="e.g., Act 12 of 2023"
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E65AD] focus:border-[#1E65AD] bg-white"
                  style={{ fontFamily: 'Roboto, sans-serif' }}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  Department
                </label>
                <input
                  type="text"
                  value={getInputValue('department')}
                  onChange={(e) => handleFilterChange('department', e.target.value)}
                  onFocus={() => handleInputFocus('department')}
                  onBlur={() => handleInputBlur('department')}
                  placeholder="e.g., Legislative Department"
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E65AD] focus:border-[#1E65AD] bg-white"
                  style={{ fontFamily: 'Roboto, sans-serif' }}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  Year
                </label>
                <select
                  value={filters.year || ''}
                  onChange={(e) => handleSelectFilterChange('year', e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E65AD] focus:border-[#1E65AD] bg-white"
                  style={{ fontFamily: 'Roboto, sans-serif' }}
                >
                  <option value="">All Years</option>
                  {years.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
          </div>

          {/* Filter Actions */}
          <div className="flex flex-col gap-2 pt-4 mt-4 border-t border-gray-200">
            <button
              onClick={applyFilters}
              disabled={loading}
              className="w-full px-4 py-2 text-white rounded-lg font-semibold shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-xs transition-all"
              style={{ fontFamily: 'Roboto, sans-serif', backgroundColor: '#1E65AD' }}
            >
              {loading ? (
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
              onClick={handleClearFilters}
              disabled={loading}
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
          {Object.values(filters).some(val => {
            if (!val) return false;
            if (typeof val === 'string') return val.trim() !== '';
            if (typeof val === 'number') return val !== 0;
            return val !== '';
          }) && (
            <div className="mt-3 p-2 bg-[#E6F0F8] border border-[#B3D4ED] rounded-lg">
              <h3 className="text-xs font-medium mb-1.5" style={{ fontFamily: 'Roboto, sans-serif', color: '#1E65AD' }}>
                Active Filters:
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(filters).map(([key, value]) => {
                  const hasValue = value && (
                    typeof value === 'string' ? value.trim() !== '' :
                    typeof value === 'number' ? value !== 0 :
                    value !== ''
                  );
                  if (!hasValue) return null;
                  
                  let label = key;
                  if (key === 'act_id') label = 'Act ID';
                  else if (key === 'act_number') label = 'Act Number';
                  else label = key.charAt(0).toUpperCase() + key.slice(1);
                  
                  return (
                    <span key={key} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-[#CCE0F0] text-[#1E65AD] break-words">
                      {label}: "{value}"
                    </span>
                  );
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
            <div className="w-full max-w-4xl mx-auto">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3" style={{ backgroundColor: '#FFFFFF' }}>
                <div className="relative">
                  <input
                    type="text"
                    value={getInputValue('search')}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    onFocus={() => handleInputFocus('search')}
                    onBlur={() => handleInputBlur('search')}
                    placeholder={activeSection === "central" 
                      ? "Search in PDF content (e.g., 'Section 302', 'murder', 'penalty')..." 
                      : `Search ${sectionLabel.toLowerCase()}...`}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !loading) {
                        e.preventDefault();
                        applyFilters();
                      }
                    }}
                    className="w-full px-4 py-2.5 pl-10 pr-10 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#1E65AD] focus:border-[#1E65AD] text-sm shadow-sm bg-white transition-all"
                    style={{ fontFamily: "'Heebo', sans-serif", backgroundColor: '#FFFFFF' }}
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5" style={{ color: '#1E65AD' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <button
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                    title="Voice Search"
                    type="button"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Results Section */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg md:text-xl font-bold mb-1" style={{ color: '#1E65AD', fontFamily: "'Bricolage Grotesque', sans-serif" }}>
                  {Object.values(filters).some(val => {
                    if (!val) return false;
                    if (typeof val === 'string') return val.trim() !== '';
                    if (typeof val === 'number') return val !== 0;
                    return val !== '';
                  }) 
                    ? `Search Results - ${sectionLabel}` 
                    : `Latest ${sectionLabel}`}
                </h2>
                <p className="text-xs text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  {searchInfo ? (
                    <>
                      Found {searchInfo.total_matches} {searchInfo.total_matches === 1 ? 'match' : 'matches'} using {searchInfo.search_engine}
                      {searchInfo.took_ms && ` (${searchInfo.took_ms}ms)`}
                    </>
                  ) : Object.values(filters).some(val => {
                    if (!val) return false;
                    if (typeof val === 'string') return val.trim() !== '';
                    if (typeof val === 'number') return val !== 0;
                    return val !== '';
                  }) 
                    ? `Showing ${sectionLabel.toLowerCase()} matching your search criteria` 
                    : `Showing the most recent ${sectionLabel.toLowerCase()} first`}
                </p>
              </div>
              <div className="text-right">
                <div className="text-xs font-semibold text-gray-700" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  {acts.length} {acts.length === 1 ? 'Act' : 'Acts'}
                </div>
                {pagination?.has_more && !loading && (
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
                        Error Loading {sectionLabel}
                      </h4>
                      <p className="text-red-700 text-xs break-words" style={{ fontFamily: 'Roboto, sans-serif' }}>
                        {error}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setError(null);
                      fetchActs(false);
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
              {loading && acts.length === 0 ? (
                <motion.div
                  key="loading-skeletons"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                >
                  <SkeletonGrid count={3} />
                </motion.div>
              ) : acts.length === 0 && !error ? (
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
                  No {sectionLabel.toLowerCase()} found
                </h3>
                <p className="text-xs sm:text-sm md:text-base text-gray-600 mb-4 sm:mb-6 max-w-md mx-auto px-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  {Object.values(filters).some(val => {
                    if (!val) return false;
                    if (typeof val === 'string') return val.trim() !== '';
                    if (typeof val === 'number') return val !== 0;
                    return val !== '';
                  })
                    ? 'No acts match your current search criteria. Try adjusting your filters or search terms.'
                    : `No ${sectionLabel.toLowerCase()} are currently available. Please check back later.`}
                </p>
                {Object.values(filters).some(val => {
                  if (!val) return false;
                  if (typeof val === 'string') return val.trim() !== '';
                  if (typeof val === 'number') return val !== 0;
                  return val !== '';
                }) && (
                  <button
                    onClick={handleClearFilters}
                    className="px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 bg-[#1E65AD] text-white rounded-lg hover:bg-[#1A5490] transition-colors font-medium text-xs sm:text-sm md:text-base"
                    style={{ fontFamily: 'Roboto, sans-serif' }}
                  >
                    Clear All Filters
                  </button>
                )}
                </motion.div>
              ) : (
                <motion.div 
                  key="acts-list-container"
                  className="relative space-y-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                >
                  <AnimatePresence mode="popLayout">
                    {acts.map((act, index) => (
                    <motion.div
                      key={act.id || act.act_id || `act-${index}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div 
                        onClick={() => viewActDetails(act)}
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
                                  // Display highlights if available (Elasticsearch search results)
                                  if (act.highlights && act.highlights.short_title) {
                                    if (Array.isArray(act.highlights.short_title) && act.highlights.short_title.length > 0) {
                                      return act.highlights.short_title[0];
                                    } else if (typeof act.highlights.short_title === 'string') {
                                      return act.highlights.short_title;
                                    }
                                  }
                                  // Fallback to regular title
                                  const title = act.short_title || act.long_title || 'Untitled Act';
                                  return title.replace(/</g, '&lt;').replace(/>/g, '&gt;');
                                })()
                              }}
                            />
                            {index === 0 && !loading && !searchInfo && (
                                <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold flex-shrink-0" style={{ backgroundColor: '#D1FAE5', color: '#065F46' }}>
                                Latest
                              </span>
                            )}
                            </div>
                          </div>

                          {/* Details Grid - Mobile: Single Column, Desktop: Two Column */}
                          <div className="space-y-3 sm:space-y-0">
                            {/* Mobile: Single Column Layout */}
                            <div className="sm:hidden space-y-3">
                              {act.year && (
                                <div className="flex items-start gap-2">
                                  <svg className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#CF9B63' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs text-gray-500 mb-1" style={{ fontFamily: "'Heebo', sans-serif" }}>Year</p>
                                    <p className="text-sm font-medium text-gray-700" style={{ fontFamily: "'Heebo', sans-serif", fontWeight: 500 }}>{act.year}</p>
                                  </div>
                                </div>
                              )}

                              {activeSection === 'central' && act.act_id && (
                                <div className="flex items-start gap-2">
                                  <svg className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#1E65AD' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                                  </svg>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs text-gray-500 mb-1" style={{ fontFamily: "'Heebo', sans-serif" }}>Act ID</p>
                                    <p 
                                      className="text-sm font-medium text-gray-700 font-mono break-all" 
                                      style={{ fontFamily: "'Heebo', sans-serif", fontWeight: 500 }}
                                      dangerouslySetInnerHTML={{
                                        __html: (() => {
                                          if (act.highlights && act.highlights.act_id) {
                                            if (Array.isArray(act.highlights.act_id) && act.highlights.act_id.length > 0) {
                                              return act.highlights.act_id[0];
                                            } else if (typeof act.highlights.act_id === 'string') {
                                              return act.highlights.act_id;
                                            }
                                          }
                                          return (act.act_id || '').replace(/</g, '&lt;').replace(/>/g, '&gt;');
                                        })()
                                      }}
                                    />
                                  </div>
                                </div>
                              )}

                              {activeSection === 'state' && act.act_number && (
                                <div className="flex items-start gap-2">
                                  <svg className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#1E65AD' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                                  </svg>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs text-gray-500 mb-1" style={{ fontFamily: "'Heebo', sans-serif" }}>Act Number</p>
                                    <p className="text-sm font-medium text-gray-700 break-words" style={{ fontFamily: "'Heebo', sans-serif", fontWeight: 500 }}>{act.act_number}</p>
                                  </div>
                                </div>
                              )}

                              {activeSection === 'central' && act.ministry && (
                                <div className="flex items-start gap-2">
                                  <svg className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#1E65AD' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                  </svg>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs text-gray-500 mb-1" style={{ fontFamily: "'Heebo', sans-serif" }}>Ministry</p>
                                    <p 
                                      className="text-sm font-medium text-gray-700 break-words" 
                                      style={{ fontFamily: "'Heebo', sans-serif", fontWeight: 500 }}
                                      dangerouslySetInnerHTML={{
                                        __html: (() => {
                                          if (act.highlights && act.highlights.ministry) {
                                            if (Array.isArray(act.highlights.ministry) && act.highlights.ministry.length > 0) {
                                              return act.highlights.ministry[0];
                                            } else if (typeof act.highlights.ministry === 'string') {
                                              return act.highlights.ministry;
                                            }
                                          }
                                          return (act.ministry || '').replace(/</g, '&lt;').replace(/>/g, '&gt;');
                                        })()
                                      }}
                                    />
                                  </div>
                                </div>
                              )}

                              {act.department && (
                                <div className="flex items-start gap-2">
                                  <svg className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#1E65AD' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                  </svg>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs text-gray-500 mb-1" style={{ fontFamily: "'Heebo', sans-serif" }}>Department</p>
                                    {act.highlights && act.highlights.department && act.highlights.department.length > 0 ? (
                                      <p 
                                        className="text-sm font-medium text-gray-700 break-words" 
                                        style={{ fontFamily: "'Heebo', sans-serif", fontWeight: 500 }}
                                        dangerouslySetInnerHTML={{ __html: act.highlights.department[0] }}
                                      />
                                    ) : (
                                      <p className="text-sm font-medium text-gray-700 break-words" style={{ fontFamily: "'Heebo', sans-serif", fontWeight: 500 }}>{act.department}</p>
                                    )}
                                  </div>
                                </div>
                              )}

                              {activeSection === 'state' && act.state && (
                                <div className="flex items-start gap-2">
                                  <svg className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#CF9B63' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs text-gray-500 mb-1" style={{ fontFamily: "'Heebo', sans-serif" }}>State</p>
                                    {act.highlights && act.highlights.state && act.highlights.state.length > 0 ? (
                                      <p 
                                        className="text-sm font-medium text-gray-700 break-words" 
                                        style={{ fontFamily: "'Heebo', sans-serif", fontWeight: 500 }}
                                        dangerouslySetInnerHTML={{ __html: act.highlights.state[0] }}
                                      />
                                    ) : (
                                      <p className="text-sm font-medium text-gray-700 break-words" style={{ fontFamily: "'Heebo', sans-serif", fontWeight: 500 }}>{act.state}</p>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Desktop: Two Column Grid */}
                            <div className="hidden sm:flex items-start justify-between gap-4">
                            <div className="flex-1 grid grid-cols-2 gap-4">
                              {/* Left Column: Year and Act ID (for Central) or Act Number and State (for State) */}
                              <div className="space-y-2.5">
                                {act.year && (
                                  <div className="flex items-start gap-1.5">
                                    <svg className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#CF9B63' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs text-gray-500 mb-0.5" style={{ fontFamily: "'Heebo', sans-serif" }}>Year</p>
                                        <p className="text-xs font-medium text-gray-700" style={{ fontFamily: "'Heebo', sans-serif", fontWeight: 500 }}>{act.year}</p>
                                    </div>
                                  </div>
                                )}

                                {activeSection === 'central' && act.act_id && (
                                  <div className="flex items-start gap-1.5">
                                    <svg className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#1E65AD' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                                    </svg>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs text-gray-500 mb-0.5" style={{ fontFamily: "'Heebo', sans-serif" }}>Act ID</p>
                                      <p 
                                          className="text-xs font-medium text-gray-700 font-mono" 
                                          style={{ fontFamily: "'Heebo', sans-serif", fontWeight: 500 }}
                                        dangerouslySetInnerHTML={{
                                          __html: (() => {
                                            if (act.highlights && act.highlights.act_id) {
                                              if (Array.isArray(act.highlights.act_id) && act.highlights.act_id.length > 0) {
                                                return act.highlights.act_id[0];
                                              } else if (typeof act.highlights.act_id === 'string') {
                                                return act.highlights.act_id;
                                              }
                                            }
                                            return (act.act_id || '').replace(/</g, '&lt;').replace(/>/g, '&gt;');
                                          })()
                                        }}
                                      />
                                    </div>
                                  </div>
                                )}

                                {activeSection === 'state' && act.act_number && (
                                  <div className="flex items-start gap-1.5">
                                    <svg className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#1E65AD' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                                    </svg>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs text-gray-500 mb-0.5" style={{ fontFamily: "'Heebo', sans-serif" }}>Act Number</p>
                                        <p className="text-xs font-medium text-gray-700" style={{ fontFamily: "'Heebo', sans-serif", fontWeight: 500 }}>{act.act_number}</p>
                                    </div>
                                  </div>
                                )}
                              </div>
                              
                              {/* Right Column: Ministry/Department (for Central) or State/Department (for State) */}
                              <div className="space-y-2.5">
                                {activeSection === 'central' && act.ministry && (
                                  <div className="flex items-start gap-1.5">
                                    <svg className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#1E65AD' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs text-gray-500 mb-0.5" style={{ fontFamily: "'Heebo', sans-serif" }}>Ministry</p>
                                      <p 
                                          className="text-xs font-medium text-gray-700 line-clamp-1" 
                                          style={{ fontFamily: "'Heebo', sans-serif", fontWeight: 500 }}
                                        dangerouslySetInnerHTML={{
                                          __html: (() => {
                                            if (act.highlights && act.highlights.ministry) {
                                              if (Array.isArray(act.highlights.ministry) && act.highlights.ministry.length > 0) {
                                                return act.highlights.ministry[0];
                                              } else if (typeof act.highlights.ministry === 'string') {
                                                return act.highlights.ministry;
                                              }
                                            }
                                            return (act.ministry || '').replace(/</g, '&lt;').replace(/>/g, '&gt;');
                                          })()
                                        }}
                                      />
                                    </div>
                                  </div>
                                )}

                                {act.department && (
                                  <div className="flex items-start gap-1.5">
                                    <svg className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#1E65AD' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs text-gray-500 mb-0.5" style={{ fontFamily: "'Heebo', sans-serif" }}>Department</p>
                                      {act.highlights && act.highlights.department && act.highlights.department.length > 0 ? (
                                        <p 
                                            className="text-xs font-medium text-gray-700 line-clamp-1" 
                                            style={{ fontFamily: "'Heebo', sans-serif", fontWeight: 500 }}
                                          dangerouslySetInnerHTML={{ __html: act.highlights.department[0] }}
                                        />
                                      ) : (
                                          <p className="text-xs font-medium text-gray-700 line-clamp-1" style={{ fontFamily: "'Heebo', sans-serif", fontWeight: 500 }}>{act.department}</p>
                                      )}
                                    </div>
                                  </div>
                                )}

                                {activeSection === 'state' && act.state && (
                                  <div className="flex items-start gap-1.5">
                                    <svg className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#CF9B63' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs text-gray-500 mb-0.5" style={{ fontFamily: "'Heebo', sans-serif" }}>State</p>
                                      {act.highlights && act.highlights.state && act.highlights.state.length > 0 ? (
                                        <p 
                                            className="text-xs font-medium text-gray-700 line-clamp-1" 
                                            style={{ fontFamily: "'Heebo', sans-serif", fontWeight: 500 }}
                                          dangerouslySetInnerHTML={{ __html: act.highlights.state[0] }}
                                        />
                                      ) : (
                                          <p className="text-xs font-medium text-gray-700 line-clamp-1" style={{ fontFamily: "'Heebo', sans-serif", fontWeight: 500 }}>{act.state}</p>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>

                              {/* View Details Button on Right - Desktop Only */}
                            <div className="flex-shrink-0">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  viewActDetails(act);
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
                          </div>

                          {/* View Details Button - Mobile Only (Full Width) */}
                          <div className="sm:hidden mt-4 pt-4 border-t border-gray-200">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                viewActDetails(act);
                              }}
                              className="w-full px-4 py-3 bg-[#1E65AD] text-white rounded-lg hover:bg-[#1A5490] active:bg-[#164373] transition-colors font-semibold text-sm shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#1E65AD] focus:ring-offset-2 flex items-center justify-center gap-2"
                              style={{ fontFamily: "'Heebo', sans-serif" }}
                              aria-label="View act details"
                            >
                              <span>View Details</span>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </button>
                          </div>
                          
                          {/* PDF Content Highlights (Elasticsearch) - For Central Acts */}
                          {activeSection === 'central' && act.highlights && act.highlights.content && act.highlights.content.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-gray-100">
                              <p className="text-xs text-gray-500 mb-1.5 font-medium" style={{ fontFamily: 'Roboto, sans-serif' }}>
                                Search Matches:
                              </p>
                              <div className="space-y-1.5">
                                {act.highlights.content.slice(0, 2).map((fragment, idx) => (
                                  <p 
                                    key={`content-highlight-${idx}`}
                                    className="text-xs text-gray-700 line-clamp-2" 
                                    style={{ fontFamily: 'Roboto, sans-serif' }}
                                    dangerouslySetInnerHTML={{ __html: fragment }}
                                  />
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {/* PDF Content Highlights (Elasticsearch) - For State Acts */}
                          {activeSection === 'state' && act.highlights && act.highlights.pdf_content && act.highlights.pdf_content.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-gray-100">
                              <p className="text-xs text-gray-500 mb-1.5 font-medium" style={{ fontFamily: 'Roboto, sans-serif' }}>
                                Search Matches:
                              </p>
                              <div className="space-y-1.5">
                                {act.highlights.pdf_content.slice(0, 2).map((fragment, idx) => (
                                  <p 
                                    key={`pdf-content-highlight-${idx}`}
                                    className="text-xs text-gray-700 line-clamp-2" 
                                    style={{ fontFamily: 'Roboto, sans-serif' }}
                                    dangerouslySetInnerHTML={{ __html: fragment }}
                                  />
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  </AnimatePresence>
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Infinite Scroll Loader */}
            {acts.length > 0 && (
              <div ref={loadingRef} className="mt-4 py-6 flex items-center justify-center" style={{ minHeight: '100px' }}>
                {isLoadingMore ? (
                  <div className="flex flex-col items-center gap-3">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1E65AD]"></div>
                    <p className="text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      Loading more acts...
                    </p>
                  </div>
                ) : pagination?.has_more ? (
                  <p className="text-sm text-gray-500" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    Scroll down to load more
                  </p>
                ) : (
                  <p className="text-sm text-gray-500" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    No more acts to load
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



