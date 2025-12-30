import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../components/landing/Navbar";
import apiService from "../services/api";
import { useURLFilters } from "../hooks/useURLFilters";
import ScrollToTopButton from "../components/ScrollToTopButton";
import { 
  EnhancedJudgmentSkeleton, 
  SkeletonGrid,
  SmoothTransitionWrapper 
} from "../components/EnhancedLoadingComponents";
import { AutoComplete } from "primereact/autocomplete";
import "primereact/resources/themes/lara-light-cyan/theme.css";

// Add custom CSS animations
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
  
  @keyframes scaleIn {
    from { 
      opacity: 0; 
      transform: scale(0.9); 
    }
    to { 
      opacity: 1; 
      transform: scale(1); 
    }
  }
  
  @keyframes slideInFromRight {
    from { 
      opacity: 0; 
      transform: translateX(30px); 
    }
    to { 
      opacity: 1; 
      transform: translateX(0); 
    }
  }
  
  .animate-fade-in-up {
    animation: fadeInUp 0.6s ease-out forwards;
  }
  
  .animate-slide-in-bottom {
    animation: slideInFromBottom 0.8s ease-out forwards;
  }
  
  .animate-scale-in {
    animation: scaleIn 0.5s ease-out forwards;
  }
  
  .animate-slide-in-right {
    animation: slideInFromRight 0.6s ease-out forwards;
  }
  
  /* PrimeReact AutoComplete styling to match original design */
  .p-autocomplete {
    width: 100%;
  }
  
  .p-autocomplete .p-inputtext {
    width: 100% !important;
  }
  
  .p-autocomplete-panel {
    display: none !important;
  }
  
  /* Elasticsearch highlight styling */
  mark {
    background-color: #fef08a;
    color: #1f2937;
    padding: 0.125rem 0.25rem;
    border-radius: 0.25rem;
    font-weight: 600;
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.type = "text/css";
  styleSheet.innerText = customStyles;
  document.head.appendChild(styleSheet);
}

export default function LegalJudgments() {
  const navigate = useNavigate();
  const location = useLocation();
  const isMountedRef = useRef(true);

  // Court type state - check URL params, location state, localStorage, then default to highcourt
  const [courtType, setCourtType] = useState(() => {
    // Priority 1: Check URL query parameter (for browser back button support)
    const urlParams = new URLSearchParams(location.search);
    const urlCourtType = urlParams.get('court');
    if (urlCourtType === 'supremecourt' || urlCourtType === 'highcourt') {
      return urlCourtType;
    }
    
    // Priority 2: Check navigation state
    const stateCourtType = location.state?.courtType;
    if (stateCourtType === 'supremecourt' || stateCourtType === 'highcourt') {
      return stateCourtType;
    }
    
    // Priority 3: Check localStorage (for browser back button support)
    const storedCourtType = localStorage.getItem('lastCourtType');
    if (storedCourtType === 'supremecourt' || storedCourtType === 'highcourt') {
      return storedCourtType;
    }
    
    return "highcourt";
  });

  // Filter visibility state
  const [showFilters, setShowFilters] = useState(false);
  
  // Update court type from URL params, location state, or localStorage
  useEffect(() => {
    // Check URL query parameter first
    const urlParams = new URLSearchParams(location.search);
    const urlCourtType = urlParams.get('court');
    if (urlCourtType === 'supremecourt' || urlCourtType === 'highcourt') {
      if (urlCourtType !== courtType) {
        setCourtType(urlCourtType);
        // Store in localStorage for future reference
        localStorage.setItem('lastCourtType', urlCourtType);
      }
      // Clean up URL param after reading
      if (urlParams.has('court')) {
        urlParams.delete('court');
        const newSearch = urlParams.toString();
        navigate(`${location.pathname}${newSearch ? '?' + newSearch : ''}`, { replace: true, state: {} });
      }
      return;
    }
    
    // Check navigation state
    const stateCourtType = location.state?.courtType;
    if (stateCourtType === 'supremecourt' || stateCourtType === 'highcourt') {
      if (stateCourtType !== courtType) {
        setCourtType(stateCourtType);
        // Store in localStorage for browser back button support
        localStorage.setItem('lastCourtType', stateCourtType);
      }
      // Clear the state to prevent it from persisting on subsequent navigations
      if (location.state?.courtType) {
        navigate(location.pathname, { replace: true, state: {} });
      }
      return;
    }
    
    // Check localStorage as fallback (for browser back button)
    const storedCourtType = localStorage.getItem('lastCourtType');
    if (storedCourtType === 'supremecourt' || storedCourtType === 'highcourt') {
      if (storedCourtType !== courtType) {
        setCourtType(storedCourtType);
      }
    }
  }, [location.search, location.state, courtType, navigate, location.pathname]);

  // Data states
  const [judgments, setJudgments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [nextCursor, setNextCursor] = useState(null);
  const [currentOffset, setCurrentOffset] = useState(0); // For Elasticsearch offset-based pagination
  const [isUsingElasticsearch, setIsUsingElasticsearch] = useState(false); // Track if using ES (offset) or PostgreSQL (cursor)
  const [searchInfo, setSearchInfo] = useState(null); // Elasticsearch search metadata
  const [isScrolled, setIsScrolled] = useState(false); // Track if user has scrolled
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false); // Mobile sidebar state
  const nextCursorRef = useRef(null);
  const currentOffsetRef = useRef(0);
  const fetchJudgmentsRef = useRef(null);
  const isInitialMountRef = useRef(true);
  const isFetchingRef = useRef(false);

  const pageSize = 10; // Increased to show more judgments per load

  // Get filter fields based on court type
  const getFilterFields = () => {
    if (courtType === "supremecourt") {
      return {
        search: '',
        title: '',
        cnr: '',
        judge: '',
        petitioner: '',
        respondent: '',
        decisionDateFrom: ''
      };
    } else {
      return {
        search: '',
        title: '',
        cnr: '',
        highCourt: '',
        judge: '',
        decisionDateFrom: ''
      };
    }
  };

  // Use URL-persisted filters hook
  const [filters, setFilters, clearFilters] = useURLFilters(
    getFilterFields(),
    { replace: false, syncOnMount: true }
  );

  // Update filters when court type changes (preserve common filters)
  useEffect(() => {
    const newFilterFields = getFilterFields();
    // Merge existing filters with new defaults, preserving common filters
    const mergedFilters = { ...newFilterFields };
    Object.keys(filters).forEach(key => {
      if (newFilterFields.hasOwnProperty(key) && filters[key]) {
        mergedFilters[key] = filters[key];
      }
    });
    setFilters(mergedFilters);
    
    setJudgments([]);
    setNextCursor(null);
    setCurrentOffset(0);
    currentOffsetRef.current = 0;
    setHasMore(true);
    setError(null);
    setSearchInfo(null); // Reset search info when court type changes
    setIsUsingElasticsearch(false); // Reset pagination type
    // Reset fetching state when court type changes
    isFetchingRef.current = false;
    setLoading(false);
    setIsSearching(false);
  }, [courtType]);

  // Store filters in ref to always get latest values
  const filtersRef = useRef(filters);
  useEffect(() => {
    filtersRef.current = filters;
  }, [filters]);

  // Fetch judgments function with cursor-based pagination
  const fetchJudgments = useCallback(async (isLoadMore = false, customFilters = null) => {
    if (!isMountedRef.current) return;
    
    // Prevent duplicate simultaneous requests for initial load only
    if (isFetchingRef.current && !isLoadMore) {
      if (process.env.NODE_ENV === 'development') {
        console.log('Already fetching, skipping duplicate request');
      }
      return;
    }
    
    try {
      if (isLoadMore) {
        setIsSearching(true);
      } else {
        isFetchingRef.current = true;
        setLoading(true);
        setError(null);
      }
      
      // Use custom filters if provided, otherwise use current filters from ref
      const activeFilters = customFilters !== null ? customFilters : filtersRef.current;
      const currentNextCursor = nextCursorRef.current;
      const currentOffsetValue = currentOffsetRef.current;
      
      // Check if we're using Elasticsearch (any search/filter that triggers ES)
      const hasElasticsearchFilters = !!(activeFilters.search || activeFilters.title || activeFilters.judge || activeFilters.cnr || activeFilters.highCourt);
      
      // Reduced logging for production - only log important info
      if (process.env.NODE_ENV === 'development') {
        console.log(`Fetching ${courtType} judgments with params:`, { 
          isLoadMore, 
          filters: activeFilters, 
          currentNextCursor,
          currentOffset: currentOffsetValue,
          usingElasticsearch: hasElasticsearchFilters
        });
      }
      
      // Prepare params based on court type
      const params = {
        limit: pageSize,
      };
      
      // Add offset for Elasticsearch queries (when loading more)
      if (hasElasticsearchFilters && isLoadMore) {
        params.offset = currentOffsetValue;
      } else if (hasElasticsearchFilters && !isLoadMore) {
        // Reset offset for new searches
        params.offset = 0;
        currentOffsetRef.current = 0;
      }

      // Add filters - remove empty ones and map to API format
      Object.keys(activeFilters).forEach(key => {
        const value = activeFilters[key];
        // Skip empty values
        if (!value || (typeof value === 'string' && value.trim() === '')) {
          return;
        }
        
        // Map filter keys to API parameter names
        if (key === 'highCourt') {
          params.court_name = value;
        } else if (key === 'decisionDateFrom') {
          // Validate date format (YYYY-MM-DD) before adding to params
          if (value && value.trim() !== '' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
          params.decision_date_from = value;
          } else if (value && value.trim() !== '') {
            console.warn('Invalid decisionDateFrom format:', value, 'Expected YYYY-MM-DD');
          }
        } else if (key === 'decisionDateTo') {
          // Validate date format (YYYY-MM-DD) before adding to params
          if (value && value.trim() !== '' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
            params.decision_date_to = value;
          } else if (value && value.trim() !== '') {
            console.warn('Invalid decisionDateTo format:', value, 'Expected YYYY-MM-DD');
          }
        } else if (key === 'decisionDate') {
          // Validate date format before adding to params
          if (value && value.trim() !== '' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
            params.decision_date = value;
          } else if (value && value.trim() !== '') {
            console.warn('Invalid decisionDate format:', value, 'Expected YYYY-MM-DD');
          }
        } else if (key === 'search') {
          // Search parameter - enable highlights for Elasticsearch (only for High Court)
          params.search = value;
          if (courtType === "highcourt") {
            params.highlight = true; // Enable highlights for full-text search
          }
        } else if (key === 'disposalNature') {
          params.disposal_nature = value;
        } else if (key === 'judge' || key === 'cnr' || key === 'title') {
          // Enable highlights for judge, CNR, and title searches (only for High Court)
          params[key] = value;
          if (courtType === "highcourt") {
            params.highlight = true; // Enable highlights for field-specific searches
          }
        } else {
          // Direct mapping for: petitioner, respondent, year
          params[key] = value;
        }
      });

      // Add cursor for pagination if loading more (only for PostgreSQL queries, not Elasticsearch)
      // According to API docs:
      // - High Court uses dual cursor: cursor_decision_date (YYYY-MM-DD) + cursor_id
      // - Supreme Court uses single cursor: cursor_id only
      // - Elasticsearch queries use offset instead of cursor
      if (isLoadMore && currentNextCursor && !hasElasticsearchFilters) {
        if (courtType === "supremecourt") {
          // Supreme Court: Only cursor_id needed
          if (currentNextCursor.id) {
            params.cursor_id = currentNextCursor.id;
          }
        } else {
          // High Court: Both cursor_decision_date and cursor_id needed
          if (currentNextCursor.decision_date) {
            params.cursor_decision_date = currentNextCursor.decision_date;
          }
          if (currentNextCursor.id) {
            params.cursor_id = currentNextCursor.id;
          }
        }
      }

      // Remove empty params
      Object.keys(params).forEach(key => {
        if (params[key] === "" || params[key] === null || params[key] === undefined) {
          delete params[key];
        }
      });

      // Log params for debugging
      if (process.env.NODE_ENV === 'development') {
        console.log(`${courtType} - Calling API with params:`, params);
      }

      // Call appropriate API based on court type
      let data;
      if (courtType === "supremecourt") {
        // Check for search query - use Elasticsearch endpoint if search exists
        const searchValue = (activeFilters.search || '').trim();
        const titleValue = (activeFilters.title || '').trim();
        const hasSearchQuery = !!(searchValue || titleValue);
        
        console.log('🔍 Supreme Court - Search check:', {
          hasSearchQuery,
          searchValue,
          titleValue,
          'activeFilters.search': activeFilters.search,
          'activeFilters.title': activeFilters.title,
          allParams: params
        });
        
        if (hasSearchQuery) {
          // Use Elasticsearch search endpoint (same pattern as High Court)
          const currentOffsetValue = isLoadMore ? currentOffsetRef.current : 0;
          
          const esParams = {
            q: searchValue || titleValue || '',
            size: pageSize,
            offset: currentOffsetValue
          };
          
          // Add filters
          if (activeFilters.judge) esParams.judge = activeFilters.judge;
          if (activeFilters.petitioner) esParams.petitioner = activeFilters.petitioner;
          if (activeFilters.respondent) esParams.respondent = activeFilters.respondent;
          if (activeFilters.cnr) esParams.cnr = activeFilters.cnr;
          if (activeFilters.decisionDateFrom) {
            const year = new Date(activeFilters.decisionDateFrom).getFullYear();
            if (year) esParams.year = year;
          }
          
          console.log('🔍 Calling Supreme Court Elasticsearch with params:', esParams);
          const esResponse = await apiService.searchSupremeCourtJudgements(esParams);
          
          console.log('🔍 Supreme Court ES Response:', {
            success: esResponse?.success,
            hasResults: !!esResponse?.results,
            resultsCount: esResponse?.results?.length,
            isArray: Array.isArray(esResponse?.results),
            response: esResponse
          });
          
          // Use results if available (work like High Court - use results if they exist)
          if (esResponse && esResponse.results && Array.isArray(esResponse.results) && esResponse.results.length > 0) {
            console.log('✅ Using Elasticsearch results for Supreme Court');
            // Map results and attach highlights to each judgment
            const mappedResults = (esResponse.results || []).map((result, idx) => {
              // Process highlights - check both 'highlight' and 'highlights' keys
              const highlightObj = result.highlight || result.highlights || {};
              
              // Debug log to see highlight structure for first result
              if (idx === 0) {
                console.log('🔍 First Result Highlight Structure:', {
                  resultId: result.id,
                  resultTitle: result.title,
                  hasHighlight: !!result.highlight,
                  hasHighlights: !!result.highlights,
                  highlightObj: highlightObj,
                  highlightKeys: Object.keys(highlightObj),
                  highlightTitle: highlightObj.title,
                  highlightPdfText: highlightObj.pdf_text,
                  highlightTitleType: typeof highlightObj.title,
                  highlightPdfTextType: typeof highlightObj.pdf_text,
                  highlightTitleIsArray: Array.isArray(highlightObj.title),
                  highlightPdfTextIsArray: Array.isArray(highlightObj.pdf_text)
                });
              }
              
              // Ensure highlights object has the expected structure
              // Handle both array and single value formats
              // API returns highlights for: pdf_text, title, judge, petitioner, respondent, cnr
              const processedHighlights = {
                title: Array.isArray(highlightObj.title) 
                  ? highlightObj.title 
                  : (highlightObj.title ? [highlightObj.title] : []),
                pdf_text: Array.isArray(highlightObj.pdf_text) 
                  ? highlightObj.pdf_text 
                  : (highlightObj.pdf_text ? [highlightObj.pdf_text] : []),
                judge: Array.isArray(highlightObj.judge) 
                  ? highlightObj.judge 
                  : (highlightObj.judge ? [highlightObj.judge] : []),
                petitioner: Array.isArray(highlightObj.petitioner) 
                  ? highlightObj.petitioner 
                  : (highlightObj.petitioner ? [highlightObj.petitioner] : []),
                respondent: Array.isArray(highlightObj.respondent) 
                  ? highlightObj.respondent 
                  : (highlightObj.respondent ? [highlightObj.respondent] : []),
                cnr: Array.isArray(highlightObj.cnr) 
                  ? highlightObj.cnr 
                  : (highlightObj.cnr ? [highlightObj.cnr] : [])
              };
              
              // Additional debug: Check if highlight object has any data
              if (idx === 0 && Object.keys(highlightObj).length === 0) {
                console.warn('⚠️ No highlights found in result object. Full result:', result);
              }
              
              // Debug for first result
              if (idx === 0) {
                console.log('🔍 Processed Highlights:', {
                  title: processedHighlights.title,
                  pdf_text: processedHighlights.pdf_text,
                  titleLength: processedHighlights.title.length,
                  pdfTextLength: processedHighlights.pdf_text.length
                });
              }
              
              // Create the mapped result object
              // IMPORTANT: Spread result first, then override with processed highlights
              const mappedResult = {
                ...result,
                // Attach processed highlights to judgment for rendering
                highlights: processedHighlights,
                // Also keep original highlight for backward compatibility
                highlight: highlightObj
              };
              
              // Debug: Verify highlights are attached
              if (idx === 0) {
                console.log('🔍 Mapped Result Highlights Check:', {
                  hasHighlights: !!mappedResult.highlights,
                  highlightsKeys: mappedResult.highlights ? Object.keys(mappedResult.highlights) : [],
                  highlightsTitle: mappedResult.highlights?.title,
                  highlightsPdfText: mappedResult.highlights?.pdf_text,
                  hasHighlight: !!mappedResult.highlight,
                  highlightKeys: mappedResult.highlight ? Object.keys(mappedResult.highlight) : []
                });
              }
              
              return mappedResult;
            });
            
            // Debug: Log first mapped result
            if (mappedResults.length > 0) {
              console.log('🔍 First Mapped Result:', {
                id: mappedResults[0].id,
                title: mappedResults[0].title,
                hasHighlights: !!mappedResults[0].highlights,
                highlights: mappedResults[0].highlights,
                hasHighlight: !!mappedResults[0].highlight,
                highlight: mappedResults[0].highlight,
                highlightsTitle: mappedResults[0].highlights?.title,
                highlightsPdfText: mappedResults[0].highlights?.pdf_text
              });
            }
            
            // Use pagination_info from API response (offset-based pagination)
            const paginationInfo = esResponse.pagination_info || {};
            const totalReturned = esResponse.returned_results || 0;
            const totalAvailable = esResponse.total_results || 0;
            const nextOffset = paginationInfo.next_offset !== null && paginationInfo.next_offset !== undefined 
              ? paginationInfo.next_offset 
              : (currentOffsetValue + totalReturned);
            const hasMoreResults = paginationInfo.has_more !== undefined 
              ? paginationInfo.has_more 
              : (nextOffset < totalAvailable);
            
            data = {
              data: mappedResults,
              pagination_info: {
                offset: paginationInfo.offset || currentOffsetValue,
                next_offset: nextOffset,
                has_more: hasMoreResults,
                current_page_size: paginationInfo.current_page_size || totalReturned
              },
              total_results: totalAvailable,
              returned_results: totalReturned,
              search_engine: esResponse.search_engine,
              search_info: {
                total_results: totalAvailable,
                returned_results: totalReturned,
                query: esResponse.query
              }
            };
            
            // Update offset for next page using API's next_offset
            if (isLoadMore) {
              currentOffsetRef.current = nextOffset;
              setCurrentOffset(nextOffset);
            } else {
              // Reset offset for new search
              currentOffsetRef.current = 0;
              setCurrentOffset(0);
            }
            
            setIsUsingElasticsearch(true);
            setSearchInfo({
              total_results: totalAvailable,
              returned_results: totalReturned,
              query: esResponse.query
            });
          } else {
            // Fallback to regular API if ES search fails
            data = await apiService.getSupremeCourtJudgements(params);
          }
        } else {
          // Use regular API for non-search queries
          data = await apiService.getSupremeCourtJudgements(params);
        }
      } else {
        // Use getJudgements for High Court (it uses /api/judgements endpoint as per API docs)
        data = await apiService.getJudgements(params);
      }
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`${courtType} - API Response:`, { 
          fullResponse: data,
          dataCount: data?.data?.length, 
          hasMore: data?.pagination_info?.has_more,
          nextCursor: data?.next_cursor,
          dataType: Array.isArray(data?.data) ? 'array' : typeof data?.data
        });
      }
      
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid API response: Expected object but got ' + typeof data);
      }
      
      // Handle different response structures with null safety
      let judgmentsArray = [];
      if (data && data.data !== null && data.data !== undefined) {
      if (Array.isArray(data.data)) {
        judgmentsArray = data.data;
        } else {
          // If data.data exists but isn't an array, try to convert
          console.warn(`${courtType}: API response data is not an array:`, data.data);
          judgmentsArray = [];
        }
      } else if (Array.isArray(data)) {
        // If API returns array directly
        judgmentsArray = data;
      } else if (data && !data.data) {
        // If data exists but data.data is null/undefined, set empty array
        console.warn(`${courtType}: API response has no data field or data is null`);
        judgmentsArray = [];
      } else {
        // Fallback: empty array
        console.warn(`${courtType}: Unexpected API response structure:`, data);
        judgmentsArray = [];
      }
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`${courtType} - Processed judgments:`, judgmentsArray.length, 'items');
      }
      
      if (!isMountedRef.current) return;
      
      // Safely get pagination info
      const paginationInfo = (data && data.pagination_info) ? data.pagination_info : {};
      
      if (isLoadMore) {
        setJudgments(prev => {
          const combined = [...prev, ...judgmentsArray];
          if (process.env.NODE_ENV === 'development') {
            console.log(`${courtType} - Total judgments after load more:`, combined.length);
          }
          return combined;
        });
      } else {
        if (process.env.NODE_ENV === 'development') {
          console.log(`${courtType} - Setting judgments:`, judgmentsArray.length, 'items');
        }
        setJudgments(judgmentsArray);
      }
      
      // Determine if we're using Elasticsearch based on search_info in response
      const usingElasticsearch = !!(data && data.search_info);
      setIsUsingElasticsearch(usingElasticsearch);
      
      // Update pagination based on type (Elasticsearch uses offset, PostgreSQL uses cursor)
      if (usingElasticsearch) {
        // Elasticsearch: Use offset-based pagination
        if (paginationInfo.next_offset !== undefined) {
          setCurrentOffset(paginationInfo.next_offset);
          currentOffsetRef.current = paginationInfo.next_offset;
        } else if (isLoadMore) {
          // If no next_offset but we're loading more, increment offset
          const newOffset = currentOffsetValue + judgmentsArray.length;
          setCurrentOffset(newOffset);
          currentOffsetRef.current = newOffset;
        }
        // Clear cursor for Elasticsearch queries
        setNextCursor(null);
        nextCursorRef.current = null;
      } else {
        // PostgreSQL: Use cursor-based pagination
        const newCursor = (data && data.next_cursor) ? data.next_cursor : null;
        setNextCursor(newCursor);
        nextCursorRef.current = newCursor;
        // Reset offset for PostgreSQL queries
        setCurrentOffset(0);
        currentOffsetRef.current = 0;
      }
      
      // Update hasMore from pagination_info (works for both ES and PostgreSQL)
      setHasMore(paginationInfo.has_more === true);
      
      // Handle Elasticsearch search metadata (only for High Court)
      if (data && data.search_info && courtType === "highcourt") {
        setSearchInfo(data.search_info);
        // Update total count from search results if available
        if (data.search_info.total_matches !== undefined) {
          setTotalCount(data.search_info.total_matches);
        }
      } else {
        setSearchInfo(null);
        if (!isLoadMore) {
          setTotalCount(judgmentsArray.length + (paginationInfo.has_more ? 1 : 0));
        }
      }
      
      // If no search info and not loading more, set total count from pagination
      if (!data.search_info && !isLoadMore) {
        if (paginationInfo.total_count !== undefined) {
          setTotalCount(paginationInfo.total_count);
        } else {
          setTotalCount(judgmentsArray.length + (paginationInfo.has_more ? 1 : 0));
        }
      }
      
    } catch (error) {
      if (!isMountedRef.current) return;
      console.error(`${courtType} Error fetching judgments:`, error);
      
      // Enhanced error handling with specific messages
      const currentCourtLabel = courtType === "supremecourt" ? "Supreme Court" : "High Court";
      let errorMessage = `Failed to fetch ${currentCourtLabel.toLowerCase()} judgments. Please try again.`;
      
      if (error.message.includes('401') || error.message.includes('Authentication')) {
        errorMessage = "Authentication required. Please log in to access judgments.";
      } else if (error.message.includes('403') || error.message.includes('Forbidden')) {
        errorMessage = "Access denied. Please check your permissions.";
      } else if (error.message.includes('500') || error.message.includes('Internal Server')) {
        errorMessage = "Server error. Please try again later.";
      } else if (error.message.includes('Network') || error.message.includes('fetch') || error.message.includes('Failed to fetch')) {
        errorMessage = "Network error. Please check your internet connection and try again.";
      } else if (error.message.includes('timeout') || error.message.includes('Timeout')) {
        errorMessage = "Request timed out. Please try again.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      
      // Clear judgments on error (except when loading more)
      if (!isLoadMore) {
        setJudgments([]);
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
        setIsSearching(false);
        // Reset isFetchingRef for both initial load and load more
        isFetchingRef.current = false;
      }
    }
  }, [courtType, pageSize]);

  // Store fetchJudgments in ref
  useEffect(() => {
    fetchJudgmentsRef.current = fetchJudgments;
  }, [fetchJudgments]);

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
  const handleFilterChange = (filterName, value) => {
    // Update local input immediately (no re-render from URL update)
    setLocalInputs(prev => ({
      ...prev,
      [filterName]: value
    }));
    
    // Clear existing debounce timer for this input
    if (debounceTimersRef.current[filterName]) {
      clearTimeout(debounceTimersRef.current[filterName]);
    }
    
    // Debounce the URL/filter update to prevent cursor jumping
    debounceTimersRef.current[filterName] = setTimeout(() => {
      setFilters(prev => ({
        ...prev,
        [filterName]: value
      }));
    }, 300); // 300ms debounce
  };

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

  // Handle scroll to move sidebar and search bar to top
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY || document.documentElement.scrollTop;
      // Header height is approximately 200px (pt-20 pb-8 = ~200px)
      // When scrolled past header, move sidebar and search bar to top
      setIsScrolled(scrollPosition > 150);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleClearFilters = () => {
    // Clear all debounce timers
    Object.values(debounceTimersRef.current).forEach(timer => {
      if (timer) clearTimeout(timer);
    });
    
    const emptyFilters = getFilterFields();
    
    // Clear local inputs
    setLocalInputs({});
    
    setFilters(emptyFilters);
    // Don't clear judgments immediately - keep existing data visible during loading
    setHasMore(true);
    setNextCursor(null);
    setCurrentOffset(0);
    currentOffsetRef.current = 0;
    setIsUsingElasticsearch(false);
    
    // Fetch immediately without delay
    if (fetchJudgmentsRef.current) {
      fetchJudgmentsRef.current(false, emptyFilters);
    }
  };

  const applyFilters = () => {
    if (isFetchingRef.current) return;
    
    // Clear all debounce timers first
    Object.values(debounceTimersRef.current).forEach(timer => {
      if (timer) clearTimeout(timer);
    });
    
    // Sync all local inputs to filters immediately (CRITICAL for search to work)
    const mergedFilters = { ...filters };
    Object.keys(localInputs).forEach(key => {
      if (localInputs[key] !== undefined) {
        // Include the value even if it's an empty string (user might have cleared the input)
        mergedFilters[key] = localInputs[key];
      }
    });
    
    // Also check if there are any filter fields that should be included
    // This ensures all filter fields from getFilterFields() are present
    const filterFields = getFilterFields();
    Object.keys(filterFields).forEach(key => {
      if (mergedFilters[key] === undefined) {
        mergedFilters[key] = filterFields[key]; // Use default empty value
      }
    });
    
    // IMPORTANT: Log to verify search value is included
    console.log('🔍 applyFilters - Merged filters:', {
      'mergedFilters.search': mergedFilters.search,
      'localInputs.search': localInputs.search,
      'filters.search': filters.search,
      hasSearch: !!(mergedFilters.search && mergedFilters.search.trim()),
      allMergedFilters: mergedFilters
    });
    
    // Update filters state with merged values
    setFilters(mergedFilters);
    
    // Don't clear judgments immediately - keep existing data visible during loading
    // This prevents the "flash/refresh" effect
    setHasMore(true);
    setNextCursor(null);
    setCurrentOffset(0);
    currentOffsetRef.current = 0;
    setIsUsingElasticsearch(false);
    setError(null);
    
    // Fetch immediately without delay for smoother experience
    if (fetchJudgmentsRef.current) {
      fetchJudgmentsRef.current(false, mergedFilters);
    }
  };

  // Sync nextCursor and offset refs with state
  useEffect(() => {
    nextCursorRef.current = nextCursor;
  }, [nextCursor]);
  
  useEffect(() => {
    currentOffsetRef.current = currentOffset;
  }, [currentOffset]);

  // Scroll detection to hide header and move sidebar/search bar to top
  useEffect(() => {
    const scrollArea = document.getElementById('main-scroll-area');
    if (!scrollArea) return;

    const handleScroll = () => {
      const scrollTop = scrollArea.scrollTop;
      // Hide header and move sidebar/search bar to top when scrolled down more than 50px
      setIsScrolled(scrollTop > 50);
    };

    scrollArea.addEventListener('scroll', handleScroll);
    return () => scrollArea.removeEventListener('scroll', handleScroll);
  }, []);

  // Auto-apply filters removed to prevent duplicate fetches and refresh effect
  // Filters are now applied manually via the Apply Filters button or Enter key

  // Load initial data when court type changes - Only fetch once
  useEffect(() => {
    if (isInitialMountRef.current) {
      // On initial mount, fetch after a short delay to ensure everything is set up
      const timer = setTimeout(() => {
        if (!isFetchingRef.current && fetchJudgmentsRef.current) {
          fetchJudgmentsRef.current(false);
        }
      }, 100);
      isInitialMountRef.current = false;
      return () => clearTimeout(timer);
    } else {
      // On court type change, reset fetching state and fetch immediately
      isFetchingRef.current = false;
      setLoading(true);
      setError(null);
      // Use setTimeout to ensure state updates are processed
      const timer = setTimeout(() => {
        if (fetchJudgmentsRef.current) {
          fetchJudgmentsRef.current(false);
        }
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [courtType]);

  // Custom infinite scroll using window scroll events
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const loadingRef = useRef(null);
  const infiniteScrollTimeoutRef = useRef(null);

  const loadMoreData = useCallback(() => {
    if (fetchJudgmentsRef.current && hasMore && !loading && !isSearching && !isLoadingMore && !isFetchingRef.current) {
      if (process.env.NODE_ENV === 'development') {
        console.log('🔄 Loading more data...');
      }
      setIsLoadingMore(true);
      isFetchingRef.current = true;
      fetchJudgmentsRef.current(true).finally(() => {
        setIsLoadingMore(false);
        isFetchingRef.current = false;
      });
    } else if (process.env.NODE_ENV === 'development') {
      console.log('⏸️ Cannot load more:', { 
        hasFetchRef: !!fetchJudgmentsRef.current, 
        hasMore, 
        loading, 
        isSearching, 
        isLoadingMore, 
        isFetching: isFetchingRef.current 
      });
    }
  }, [hasMore, loading, isSearching, isLoadingMore]);

  // Intersection Observer for infinite scroll (primary method - more reliable)
  useEffect(() => {
    if (!hasMore || loading || isSearching || isLoadingMore || !judgments.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && hasMore && !loading && !isSearching && !isLoadingMore && !isFetchingRef.current) {
          if (process.env.NODE_ENV === 'development') {
            console.log('👁️ IntersectionObserver triggered - loading more');
          }
          loadMoreData();
        }
      },
      {
        root: null,
        rootMargin: '300px', // Trigger 300px before the element is visible
        threshold: 0.1,
      }
    );

    const currentRef = loadingRef.current;
    if (currentRef) {
      observer.observe(currentRef);
      if (process.env.NODE_ENV === 'development') {
        console.log('👁️ IntersectionObserver attached to loadingRef');
      }
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [hasMore, loading, isSearching, isLoadingMore, loadMoreData, judgments.length]);

  // Window scroll event handler for infinite scroll (backup method)
  useEffect(() => {
    if (!hasMore || loading || isSearching || isLoadingMore || !judgments.length) return;

    const handleScroll = () => {
      if (infiniteScrollTimeoutRef.current) {
        clearTimeout(infiniteScrollTimeoutRef.current);
      }

      infiniteScrollTimeoutRef.current = setTimeout(() => {
        if (!hasMore || loading || isSearching || isLoadingMore || isFetchingRef.current) return;

        // Calculate if user is near bottom (within 300px)
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;

        // Check if user is within 300px of bottom
        if (scrollTop + windowHeight >= documentHeight - 300) {
          if (process.env.NODE_ENV === 'development') {
            console.log('📜 Window scroll triggered - loading more');
          }
          loadMoreData();
        }
      }, 200); // Throttle scroll events
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (infiniteScrollTimeoutRef.current) {
        clearTimeout(infiniteScrollTimeoutRef.current);
      }
    };
  }, [hasMore, loading, isSearching, isLoadingMore, loadMoreData, judgments.length]);

  const viewJudgment = useCallback((judgment) => {
    if (!judgment) {
      console.error('No judgment data provided');
      return;
    }
    
    const judgmentId = judgment.id || judgment.cnr;
    
    if (!judgmentId) {
      console.error('No judgment ID or CNR available');
      setError('Unable to open judgment: Missing identification number.');
      return;
    }
    
    // Use court-specific URLs
    const courtPath = courtType === 'supremecourt' 
      ? 'supreme-court' 
      : 'high-court';
    const url = `/judgment/${courtPath}/${judgmentId}`;
    
    // Store current court type in localStorage before navigating
    localStorage.setItem('lastCourtType', courtType);
    
    // Navigate with error handling
    try {
    navigate(url, { state: { judgment, courtType } });
    } catch (error) {
      console.error('Navigation error:', error);
      setError('Unable to navigate to judgment details. Please try again.');
    }
  }, [courtType, navigate]);


  // Cleanup effect
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const courtTypeLabel = courtType === "supremecourt" ? "Supreme Court" : "High Court";
  const highCourts = [
    "All High Courts",
    "Allahabad High Court",
    "Bombay High Court",
    "Calcutta High Court",
    "Gauhati High Court",
    "High Court for State of Telangana",
    "High Court of Andhra Pradesh",
    "High Court of Chhattisgarh",
    "High Court of Delhi",
    "High Court of Gujarat",
    "High Court of Himachal Pradesh",
    "High Court of Jammu and Kashmir",
    "High Court of Jharkhand",
    "High Court of Karnataka",
    "High Court of Kerala",
    "High Court of Madhya Pradesh",
    "High Court of Manipur",
    "High Court of Meghalaya",
    "High Court of Orissa",
    "High Court of Punjab and Haryana",
    "High Court of Rajasthan",
    "High Court of Sikkim",
    "High Court of Tripura",
    "High Court of Uttarakhand",
    "Madras High Court",
    "Patna High Court",
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F9FAFC' }}>
      <Navbar />
      
      {/* Mobile Sticky Header with Hamburger Menu and Search Bar - Mobile Only, At Top (Visible Before Scroll) */}
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
                    placeholder="Search by case title, parties, judges..."
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
                    inputStyle={{ fontFamily: 'Roboto, sans-serif', backgroundColor: '#FFFFFF' }}
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
              Legal Judgments
            </h1>
            {/* Thick Orange-Brown Line */}
            <div className="w-16 sm:w-20 h-1 mx-auto mb-4 sm:mb-5" style={{ backgroundColor: '#CF9B63' }}></div>
            {/* Subtitle */}
            <p className="text-sm sm:text-base md:text-lg text-gray-600 max-w-3xl mx-auto px-4" style={{ fontFamily: 'Roboto, sans-serif' }}>
              Search and access legal judgments from High Courts and Supreme Court of India
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
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 bottom-0 w-80 bg-white border-r border-gray-200 z-[70] md:hidden overflow-y-auto shadow-2xl flex flex-col"
            >
              {/* Header with Hamburger and Close Button */}
              <div className="flex items-center justify-between p-4 pt-20 border-b border-gray-200 bg-white sticky top-0 z-10 shadow-sm">
                {/* Hamburger Menu Icon (Static) */}
                <div className="flex items-center">
                  <div className="p-2" style={{ color: '#1E65AD' }}>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </div>
                  <h2 className="ml-2 text-lg font-bold" style={{ color: '#1E65AD', fontFamily: "'Bricolage Grotesque', sans-serif" }}>
                    Filters
                  </h2>
                </div>
                
                {/* Close Button - More Visible */}
                <button
                  onClick={() => setMobileSidebarOpen(false)}
                  className="p-2.5 rounded-lg hover:bg-gray-100 active:bg-gray-200 transition-colors flex items-center justify-center"
                  aria-label="Close filters menu"
                  style={{ 
                    color: '#1E65AD',
                    backgroundColor: 'rgba(30, 101, 173, 0.1)'
                  }}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {/* Mobile Sidebar Content - Scrollable */}
              <div className="flex-1 overflow-y-auto p-4">
                <div className="space-y-4">
                  {/* Court Type Toggle */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      Court Type
                    </label>
                    <div className="relative inline-flex items-center bg-gray-100 rounded-xl p-1 shadow-inner w-full">
                      <motion.div
                        className="absolute top-0.5 bottom-0.5 rounded-lg z-0"
                        initial={false}
                        animate={{
                          left: courtType === 'highcourt' ? '2px' : 'calc(50% + 1px)',
                          backgroundColor: courtType === 'highcourt' ? '#1E65AD' : '#CF9B63',
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
                          setCourtType('highcourt');
                          localStorage.setItem('lastCourtType', 'highcourt');
                        }}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        className={`flex-1 px-2 py-2 rounded-lg font-semibold transition-all duration-300 relative z-10 text-sm ${
                          courtType === 'highcourt'
                            ? 'text-white'
                            : 'text-gray-600 hover:text-gray-800'
                        }`}
                        style={{
                          fontFamily: 'Roboto, sans-serif',
                        }}
                      >
                        High Court
                      </motion.button>
                      <motion.button
                        onClick={() => {
                          setCourtType('supremecourt');
                          localStorage.setItem('lastCourtType', 'supremecourt');
                        }}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        className={`flex-1 px-2 py-2 rounded-lg font-semibold transition-all duration-300 relative z-10 text-sm ${
                          courtType === 'supremecourt'
                            ? 'text-white'
                            : 'text-gray-600 hover:text-gray-800'
                        }`}
                        style={{
                          fontFamily: 'Roboto, sans-serif',
                        }}
                      >
                        Supreme Court
                      </motion.button>
                    </div>
                  </div>
                  
                  {/* Filter Fields Section */}
                  <div className="space-y-4">
                    {courtType === "supremecourt" ? (
                      /* Supreme Court Filters */
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                            Case Title
                          </label>
                          <input
                            type="text"
                            value={getInputValue('title')}
                            onChange={(e) => handleFilterChange('title', e.target.value)}
                            onFocus={() => handleInputFocus('title')}
                            onBlur={() => handleInputBlur('title')}
                            placeholder="e.g., State vs John Doe"
                            className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E65AD] focus:border-[#1E65AD] bg-white"
                            style={{ fontFamily: 'Roboto, sans-serif' }}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                            Judge Name
                          </label>
                          <input
                            type="text"
                            value={getInputValue('judge')}
                            onChange={(e) => handleFilterChange('judge', e.target.value)}
                            onFocus={() => handleInputFocus('judge')}
                            onBlur={() => handleInputBlur('judge')}
                            placeholder="e.g., Justice Singh"
                            className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E65AD] focus:border-[#1E65AD] bg-white"
                            style={{ fontFamily: 'Roboto, sans-serif' }}
                          />
                        </div>
                      </div>
                    ) : (
                      /* High Court Filters */
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                            Case Title
                          </label>
                          <input
                            type="text"
                            value={getInputValue('title')}
                            onChange={(e) => handleFilterChange('title', e.target.value)}
                            onFocus={() => handleInputFocus('title')}
                            onBlur={() => handleInputBlur('title')}
                            placeholder="e.g., State vs John Doe"
                            className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E65AD] focus:border-[#1E65AD] bg-white"
                            style={{ fontFamily: 'Roboto, sans-serif' }}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                            Judge Name
                          </label>
                          <input
                            type="text"
                            value={getInputValue('judge')}
                            onChange={(e) => handleFilterChange('judge', e.target.value)}
                            onFocus={() => handleInputFocus('judge')}
                            onBlur={() => handleInputBlur('judge')}
                            placeholder="e.g., Justice Singh"
                            className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E65AD] focus:border-[#1E65AD] bg-white"
                            style={{ fontFamily: 'Roboto, sans-serif' }}
                          />
                        </div>
                      </div>
                    )}
                    
                    <div className="space-y-4">
                      {/* CNR Filter */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                          CNR Number
                        </label>
                        <input
                          type="text"
                          value={getInputValue('cnr')}
                          onChange={(e) => handleFilterChange('cnr', e.target.value)}
                          onFocus={() => handleInputFocus('cnr')}
                          onBlur={() => handleInputBlur('cnr')}
                          placeholder={courtType === "supremecourt" ? "e.g., SC-123456-2023" : "e.g., HPHC010019512005"}
                          className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E65AD] focus:border-[#1E65AD] bg-white"
                          style={{ fontFamily: 'Roboto, sans-serif' }}
                        />
                      </div>

                      {/* High Court Filter - Only for High Court */}
                      {courtType === "highcourt" && (
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                            High Court
                          </label>
                          <select
                            value={filters.highCourt}
                            onChange={(e) => handleFilterChange('highCourt', e.target.value)}
                            className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E65AD] focus:border-[#1E65AD] bg-white"
                            style={{ fontFamily: 'Roboto, sans-serif' }}
                          >
                            {highCourts.map((court) => (
                              <option key={court} value={court === "All High Courts" ? "" : court}>
                                {court}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      {/* Decision Date From */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                          Decision Date From
                        </label>
                        <input
                          type="date"
                          value={getInputValue('decisionDateFrom') || ''}
                          onChange={(e) => {
                            const newValue = e.target.value;
                            if (!newValue || /^\d{4}-\d{2}-\d{2}$/.test(newValue)) {
                              handleFilterChange('decisionDateFrom', newValue || '');
                            }
                          }}
                          onFocus={() => handleInputFocus('decisionDateFrom')}
                          onBlur={() => {
                            handleInputBlur('decisionDateFrom');
                            const value = getInputValue('decisionDateFrom');
                            if (value && value.trim() !== '' && !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
                              handleFilterChange('decisionDateFrom', '');
                            }
                          }}
                          max={new Date().toISOString().split('T')[0]}
                          className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E65AD] focus:border-[#1E65AD] bg-white"
                          style={{ fontFamily: 'Roboto, sans-serif' }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Filter Actions */}
                  <div className="flex flex-col gap-3 pt-4 mt-4 border-t border-gray-200">
                    <button
                      onClick={() => {
                        applyFilters();
                        setMobileSidebarOpen(false);
                      }}
                      disabled={loading || isFetchingRef.current}
                      aria-label="Apply search filters"
                      className="w-full px-4 py-3 bg-[#1E65AD] text-white rounded-lg hover:bg-[#1A5490] active:bg-[#164373] font-semibold shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#1E65AD] focus:ring-offset-2"
                      style={{ fontFamily: 'Roboto, sans-serif', backgroundColor: '#1E65AD' }}
                    >
                      {loading ? (
                        <>
                          <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Searching...
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                          Apply Filters
                        </>
                      )}
                    </button>
                    
                    <button
                      onClick={() => {
                        handleClearFilters();
                      }}
                      disabled={loading || isFetchingRef.current}
                      aria-label="Clear all search filters"
                      className="w-full px-4 py-3 bg-white text-gray-700 border-2 border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 active:bg-gray-100 font-semibold shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
                      style={{ fontFamily: 'Roboto, sans-serif' }}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Clear All
                    </button>
                  </div>

                  {/* Active Filters Display */}
                  {Object.values(filters).some(val => val && val.trim() !== '') && (
                    <div className="mt-4 p-3 bg-[#E6F0F8] border border-[#B3D4ED] rounded-lg">
                      <h3 className="text-sm font-medium text-[#1E65AD] mb-2" style={{ fontFamily: 'Roboto, sans-serif', color: '#1E65AD' }}>
                        Active Filters:
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(filters).map(([key, value]) => {
                          if (value && value.trim() !== '') {
                            return (
                              <span key={key} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-[#CCE0F0] text-[#1E65AD] break-words">
                                {key === 'highCourt' ? 'Court' : key.charAt(0).toUpperCase() + key.slice(1)}: "{value}"
                              </span>
                            );
                          }
                          return null;
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* LEFT: FIXED SIDEBAR - Desktop Only */}
      <aside 
        className="hidden md:block fixed left-3 bottom-4 z-20 transition-all duration-300"
        style={{ 
          top: isScrolled ? '100px' : '290px',
          width: '320px'
        }}
      >
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 h-full overflow-y-auto" style={{ width: '100%', maxHeight: isScrolled ? 'calc(100vh - 80px)' : 'calc(100vh - 220px)' }}>
          {/* Court Type Toggle */}
          <div className="mb-4">
            <label className="block text-xs font-semibold text-gray-700 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
              Court Type
            </label>
            <div className="relative inline-flex items-center bg-gray-100 rounded-xl p-1 shadow-inner w-full">
              {/* Sliding background indicator */}
              <motion.div
                className="absolute top-0.5 bottom-0.5 rounded-lg z-0"
                initial={false}
                animate={{
                  left: courtType === 'highcourt' ? '2px' : 'calc(50% + 1px)',
                  backgroundColor: courtType === 'highcourt' ? '#1E65AD' : '#CF9B63',
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
                    setCourtType('highcourt');
                    localStorage.setItem('lastCourtType', 'highcourt');
                  }}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className={`flex-1 px-2 py-2 rounded-lg font-semibold transition-all duration-300 relative z-10 text-xs ${
                    courtType === 'highcourt'
                      ? 'text-white'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                  style={{
                    fontFamily: 'Roboto, sans-serif',
                  }}
                >
                  High Court
                </motion.button>
                <motion.button
                  onClick={() => {
                    setCourtType('supremecourt');
                    localStorage.setItem('lastCourtType', 'supremecourt');
                  }}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className={`flex-1 px-2 py-2 rounded-lg font-semibold transition-all duration-300 relative z-10 text-xs ${
                    courtType === 'supremecourt'
                      ? 'text-white'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                  style={{
                    fontFamily: 'Roboto, sans-serif',
                  }}
                >
                  Supreme Court
                </motion.button>
              </div>
            </div>
            
          {/* Filter Fields Section */}
          <div className="space-y-3">
          {courtType === "supremecourt" ? (
            /* Supreme Court Filters */
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  Case Title
                </label>
                <input
                  type="text"
                  value={getInputValue('title')}
                  onChange={(e) => handleFilterChange('title', e.target.value)}
                  onFocus={() => handleInputFocus('title')}
                  onBlur={() => handleInputBlur('title')}
                  placeholder="e.g., State vs John Doe"
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E65AD] focus:border-[#1E65AD] bg-white"
                  style={{ fontFamily: 'Roboto, sans-serif' }}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  Judge Name
                </label>
                <input
                  type="text"
                  value={getInputValue('judge')}
                  onChange={(e) => handleFilterChange('judge', e.target.value)}
                  onFocus={() => handleInputFocus('judge')}
                  onBlur={() => handleInputBlur('judge')}
                  placeholder="e.g., Justice Singh"
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E65AD] focus:border-[#1E65AD] bg-white"
                  style={{ fontFamily: 'Roboto, sans-serif' }}
                />
              </div>
                {/* Petitioner/Respondent filters intentionally hidden for Supreme Court */}
              </div>
          ) : (
            /* High Court Filters */
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  Case Title
                </label>
                <input
                  type="text"
                  value={getInputValue('title')}
                  onChange={(e) => handleFilterChange('title', e.target.value)}
                  onFocus={() => handleInputFocus('title')}
                  onBlur={() => handleInputBlur('title')}
                  placeholder="e.g., State vs John Doe"
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E65AD] focus:border-[#1E65AD] bg-white"
                  style={{ fontFamily: 'Roboto, sans-serif' }}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  Judge Name
                </label>
                <input
                  type="text"
                  value={getInputValue('judge')}
                  onChange={(e) => handleFilterChange('judge', e.target.value)}
                  onFocus={() => handleInputFocus('judge')}
                  onBlur={() => handleInputBlur('judge')}
                  placeholder="e.g., Justice Singh"
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E65AD] focus:border-[#1E65AD] bg-white"
                  style={{ fontFamily: 'Roboto, sans-serif' }}
                />
              </div>
              </div>
            )}
            
            <div className="space-y-3">
            {/* CNR Filter */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5" style={{ fontFamily: 'Roboto, sans-serif' }}>
                CNR Number
              </label>
              <input
                type="text"
                value={getInputValue('cnr')}
                onChange={(e) => handleFilterChange('cnr', e.target.value)}
                onFocus={() => handleInputFocus('cnr')}
                onBlur={() => handleInputBlur('cnr')}
                placeholder={courtType === "supremecourt" ? "e.g., SC-123456-2023" : "e.g., HPHC010019512005"}
                className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E65AD] focus:border-[#1E65AD] bg-white"
                style={{ fontFamily: 'Roboto, sans-serif' }}
              />
            </div>

            {/* High Court Filter - Only for High Court */}
            {courtType === "highcourt" && (
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  High Court
                </label>
                <select
                  value={filters.highCourt}
                  onChange={(e) => handleFilterChange('highCourt', e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E65AD] focus:border-[#1E65AD] bg-white"
                  style={{ fontFamily: 'Roboto, sans-serif' }}
                >
                  {highCourts.map((court) => (
                    <option key={court} value={court === "All High Courts" ? "" : court}>
                      {court}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Decision Date From */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5" style={{ fontFamily: 'Roboto, sans-serif' }}>
                Decision Date From
              </label>
              <input
                type="date"
                value={getInputValue('decisionDateFrom') || ''}
                onChange={(e) => {
                  const newValue = e.target.value;
                  if (!newValue || /^\d{4}-\d{2}-\d{2}$/.test(newValue)) {
                    handleFilterChange('decisionDateFrom', newValue || '');
                  }
                }}
                onFocus={() => handleInputFocus('decisionDateFrom')}
                onBlur={() => {
                  handleInputBlur('decisionDateFrom');
                  const value = getInputValue('decisionDateFrom');
                  if (value && value.trim() !== '' && !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
                    handleFilterChange('decisionDateFrom', '');
                  }
                }}
                max={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E65AD] focus:border-[#1E65AD] bg-white"
                style={{ fontFamily: 'Roboto, sans-serif' }}
              />
            </div>
          </div>
          </div>

          {/* Filter Actions */}
          <div className="flex flex-col gap-2 pt-4 mt-4 border-t border-gray-200">
            <button
              onClick={() => {
                applyFilters();
              }}
              disabled={loading || isFetchingRef.current}
              aria-label="Apply search filters"
              className="w-full px-4 py-2 bg-[#1E65AD] text-white rounded-lg hover:bg-[#1A5490] active:bg-[#164373] font-semibold shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-xs transition-all focus:outline-none focus:ring-2 focus:ring-[#1E65AD] focus:ring-offset-2"
              style={{ fontFamily: 'Roboto, sans-serif', backgroundColor: '#1E65AD' }}
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Searching...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Apply Filters
                </>
              )}
            </button>
            
            <button
              onClick={() => {
                handleClearFilters();
              }}
              disabled={loading || isFetchingRef.current}
              aria-label="Clear all search filters"
              className="w-full px-4 py-2 bg-white text-gray-700 border-2 border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 active:bg-gray-100 font-semibold shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-xs transition-all focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
              style={{ fontFamily: 'Roboto, sans-serif' }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Clear All
            </button>
          </div>

            {/* Active Filters Display */}
            {Object.values(filters).some(val => val && val.trim() !== '') && (
              <div className="mt-3 p-2 bg-[#E6F0F8] border border-[#B3D4ED] rounded-lg">
                <h3 className="text-xs font-medium text-[#1E65AD] mb-1.5" style={{ fontFamily: 'Roboto, sans-serif', color: '#1E65AD' }}>
                  Active Filters:
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {Object.entries(filters).map(([key, value]) => {
                    if (value && value.trim() !== '') {
                      return (
                        <span key={key} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-[#CCE0F0] text-[#1E65AD] break-words">
                          {key === 'highCourt' ? 'Court' : key.charAt(0).toUpperCase() + key.slice(1)}: "{value}"
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
      <div className="max-w-6xl mx-auto px-3  sm:px-4 lg:px-6 py-4 md:ml-[320px] md:py-4 md:pt-4 pt-20" style={{ position: 'relative', zIndex: 1 }}>
        
        {/* SCROLLABLE CONTENT AREA */}
        <div className="transition-all duration-300">
          
          {/* SEARCH BAR - Desktop Only (Mobile search bar is in sticky header) */}
          <div className="mb-4 hidden md:block">
            <div className="w-full">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3" style={{ backgroundColor: '#FFFFFF' }}>
                <div className="relative">
                  <AutoComplete
                    value={getInputValue('search')}
                    onChange={(e) => {
                      const value = e.value || '';
                      handleFilterChange('search', value);
                    }}
                    onFocus={() => handleInputFocus('search')}
                    onBlur={() => handleInputBlur('search')}
                    placeholder="Search by case title, parties, judges..."
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
                    inputStyle={{ fontFamily: 'Roboto, sans-serif', backgroundColor: '#FFFFFF' }}
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

          {/* Results Section */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg md:text-xl font-bold mb-1" style={{ color: '#1E65AD', fontFamily: "'Bricolage Grotesque', sans-serif" }}>
                  {Object.values(filters).some(val => val && val.trim() !== '') 
                    ? `Search Results - ${courtTypeLabel} Judgments` 
                    : `Latest ${courtTypeLabel} Judgments`}
                </h2>
                <p className="text-xs text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  {Object.values(filters).some(val => val && val.trim() !== '') 
                    ? `Showing ${courtTypeLabel.toLowerCase()} judgments matching your search criteria` 
                    : `Showing the most recent ${courtTypeLabel.toLowerCase()} judgments first`}
                </p>
              </div>
              <div className="text-right">
                <div className="text-xs font-semibold text-gray-700" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  {judgments.length} {judgments.length === 1 ? 'Judgment' : 'Judgments'}
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
                  role="alert"
                  aria-live="assertive"
                >
                <div className="flex flex-col gap-3">
                  <div className="flex items-start flex-1">
                    <svg className="w-4 h-4 text-red-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-red-800 font-semibold mb-1 text-xs" style={{ fontFamily: 'Roboto, sans-serif' }}>
                        Error Loading Judgments
                      </h4>
                      <p className="text-red-700 text-xs break-words" style={{ fontFamily: 'Roboto, sans-serif' }}>
                        {error}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setError(null);
                      fetchJudgments(false);
                    }}
                    disabled={loading || isFetchingRef.current}
                    aria-label="Retry loading judgments"
                    className="px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 active:bg-red-800 transition-colors text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 flex-shrink-0 w-full sm:w-auto self-start sm:self-auto focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                    style={{ fontFamily: 'Roboto, sans-serif' }}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Retry
                  </button>
                </div>
              </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence mode="wait">
              {loading && judgments.length === 0 ? (
                <motion.div
                  key="loading-skeletons"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                >
                  <SkeletonGrid count={3} />
                </motion.div>
              ) : judgments.length === 0 && !error ? (
                <motion.div 
                  key="empty-state"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="text-center py-6 sm:py-8 md:py-12 lg:py-16 px-3 sm:px-4"
                  role="status"
                  aria-live="polite"
                >
                <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 mx-auto mb-3 sm:mb-4 md:mb-6 bg-[#E6F0F8] rounded-full flex items-center justify-center">
                  <svg className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 text-[#1E65AD]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-base sm:text-lg md:text-xl font-semibold text-gray-800 mb-2 sm:mb-3 px-2" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
                  No {courtTypeLabel.toLowerCase()} judgments found
                </h3>
                <p className="text-xs sm:text-sm md:text-base text-gray-600 mb-4 sm:mb-6 max-w-md mx-auto px-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  {Object.values(filters).some(val => val && val.trim() !== '')
                    ? 'No judgments match your current search criteria. Try adjusting your filters or search terms.'
                    : `No ${courtTypeLabel.toLowerCase()} judgments are currently available. Please check back later.`}
                </p>
                {Object.values(filters).some(val => val && val.trim() !== '') && (
                  <button
                    onClick={clearFilters}
                    aria-label="Clear all search filters"
                    className="px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 bg-[#1E65AD] text-white rounded-lg hover:bg-[#1A5490] active:bg-[#164373] transition-colors font-medium text-xs sm:text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-[#1E65AD] focus:ring-offset-2"
                    style={{ fontFamily: 'Roboto, sans-serif' }}
                  >
                    Clear All Filters
                  </button>
                )}
                </motion.div>
              ) : (
                <motion.div 
                  key="judgments-list-container"
                  className="relative space-y-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                >
                  <AnimatePresence mode="popLayout">
                    {judgments.map((judgment, index) => (
                      <motion.div
                        key={judgment.cnr || judgment.id || `${courtType}-${index}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                      >
                      <div 
                        onClick={() => viewJudgment(judgment)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            viewJudgment(judgment);
                          }
                        }}
                        tabIndex={0}
                        role="button"
                        aria-label={`View details for ${judgment.title || judgment.case_info || 'judgment'}`}
                        className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm hover:shadow-lg hover:border-[#1E65AD] transition-all duration-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#1E65AD] focus:ring-offset-2 transform hover:scale-[1.01]"
                        style={{ borderColor: '#E5E7EB' }}
                      >
                        {/* Card Content */}
                        <div className="px-4 sm:px-5 md:px-6 py-4 sm:py-5">
                          {/* Title and Latest Tag */}
                          <div className="mb-4 sm:mb-3">
                            <div className="flex items-start justify-between gap-2 mb-2">
                            <h3 
                                className="text-base sm:text-sm md:text-base font-medium flex-1 line-clamp-2" 
                              style={{ 
                                color: '#1E65AD', 
                                  fontFamily: "'Heebo', sans-serif",
                                  lineHeight: '1.4',
                                  fontWeight: 500
                              }}
                              dangerouslySetInnerHTML={{
                                __html: (() => {
                                  // Display highlights if available (Elasticsearch search results)
                                  // Check for highlights in different possible structures
                                  const titleHighlights = judgment.highlights?.title || 
                                                         (judgment.highlight && judgment.highlight.title) ||
                                                         null;
                                  
                                  if (titleHighlights) {
                                    // Handle both array and string formats
                                    if (Array.isArray(titleHighlights) && titleHighlights.length > 0) {
                                      return titleHighlights[0]; // Use first highlight fragment
                                    } else if (typeof titleHighlights === 'string') {
                                      return titleHighlights;
                                    }
                                  }
                                  
                                  // Fallback to regular title
                                  const title = judgment.title || judgment.case_info || judgment.case_title || judgment.case_number || 'Untitled Judgment';
                                  return title.replace(/</g, '&lt;').replace(/>/g, '&gt;'); // Escape HTML for safety
                                })()
                              }}
                            />
                            {index === 0 && judgments.length > 0 && !loading && (
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
                              {(judgment.court_name || judgment.court) && (
                                <div className="flex items-start gap-2">
                                  <svg className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#1E65AD' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                  </svg>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs text-gray-500 mb-1" style={{ fontFamily: "'Heebo', sans-serif" }}>Court</p>
                                    <p className="text-sm font-medium text-gray-700 break-words" style={{ fontFamily: "'Heebo', sans-serif", fontWeight: 500 }}>{judgment.court_name || judgment.court}</p>
                                  </div>
                                </div>
                              )}
                              
                              {judgment.cnr && (
                                <div className="flex items-start gap-2">
                                  <svg className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#1E65AD' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                                  </svg>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs text-gray-500 mb-1" style={{ fontFamily: "'Heebo', sans-serif" }}>CNR</p>
                                    <p 
                                      className="text-sm font-medium text-gray-700 font-mono break-all" 
                                      style={{ fontFamily: "'Heebo', sans-serif", fontWeight: 500 }}
                                      dangerouslySetInnerHTML={{
                                        __html: (() => {
                                          const cnrHighlights = judgment.highlights?.cnr || 
                                                                 (judgment.highlight && judgment.highlight.cnr) ||
                                                                 null;
                                          
                                          if (cnrHighlights) {
                                            if (Array.isArray(cnrHighlights) && cnrHighlights.length > 0) {
                                              return cnrHighlights[0];
                                            } else if (typeof cnrHighlights === 'string' && cnrHighlights.trim()) {
                                              return cnrHighlights;
                                            }
                                          }
                                          return (judgment.cnr || '').replace(/</g, '&lt;').replace(/>/g, '&gt;');
                                        })()
                                      }}
                                    />
                                  </div>
                                </div>
                              )}

                              {judgment.decision_date && (
                                <div className="flex items-start gap-2">
                                  <svg className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#CF9B63' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs text-gray-500 mb-1" style={{ fontFamily: "'Heebo', sans-serif" }}>Decision Date</p>
                                    <p className="text-sm font-medium text-gray-700" style={{ fontFamily: "'Heebo', sans-serif", fontWeight: 500 }}>{judgment.decision_date}</p>
                                  </div>
                                </div>
                              )}
                              
                              {judgment.judge && (
                                <div className="flex items-start gap-2">
                                  <svg className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#CF9B63' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                  </svg>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs text-gray-500 mb-1" style={{ fontFamily: "'Heebo', sans-serif" }}>Judge</p>
                                    <p 
                                      className="text-sm font-medium text-gray-700 break-words" 
                                      style={{ fontFamily: "'Heebo', sans-serif", fontWeight: 500 }}
                                      dangerouslySetInnerHTML={{
                                        __html: (() => {
                                          const judgeHighlights = judgment.highlights?.judge || 
                                                                         (judgment.highlight && judgment.highlight.judge) ||
                                                                         null;
                                          
                                          if (judgeHighlights) {
                                            if (Array.isArray(judgeHighlights) && judgeHighlights.length > 0) {
                                              return judgeHighlights[0];
                                            } else if (typeof judgeHighlights === 'string' && judgeHighlights.trim()) {
                                              return judgeHighlights;
                                            }
                                          }
                                          return (judgment.judge || '').replace(/</g, '&lt;').replace(/>/g, '&gt;');
                                        })()
                                      }}
                                    />
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Desktop: Two Column Grid */}
                            <div className="hidden sm:flex items-start justify-between gap-4">
                            <div className="flex-1 grid grid-cols-2 gap-4">
                              {/* Left Column: Court and CNR */}
                              <div className="space-y-2.5">
                                {(judgment.court_name || judgment.court) && (
                                  <div className="flex items-start gap-1.5">
                                    <svg className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#1E65AD' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-xs text-gray-500 mb-0.5" style={{ fontFamily: "'Heebo', sans-serif" }}>Court</p>
                                      <p className="text-xs font-medium text-gray-700" style={{ fontFamily: "'Heebo', sans-serif", fontWeight: 500 }}>{judgment.court_name || judgment.court}</p>
                                    </div>
                                  </div>
                                )}
                                
                                {judgment.cnr && (
                                  <div className="flex items-start gap-1.5">
                                    <svg className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#1E65AD' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                                    </svg>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-xs text-gray-500 mb-0.5" style={{ fontFamily: "'Heebo', sans-serif" }}>CNR</p>
                                      <p 
                                        className="text-xs font-medium text-gray-700 font-mono" 
                                        style={{ fontFamily: "'Heebo', sans-serif", fontWeight: 500 }}
                                        dangerouslySetInnerHTML={{
                                          __html: (() => {
                                            const cnrHighlights = judgment.highlights?.cnr || 
                                                               (judgment.highlight && judgment.highlight.cnr) ||
                                                               null;
                                            
                                            if (cnrHighlights) {
                                              if (Array.isArray(cnrHighlights) && cnrHighlights.length > 0) {
                                                return cnrHighlights[0];
                                              } else if (typeof cnrHighlights === 'string' && cnrHighlights.trim()) {
                                                return cnrHighlights;
                                              }
                                            }
                                            return (judgment.cnr || '').replace(/</g, '&lt;').replace(/>/g, '&gt;');
                                          })()
                                        }}
                                      />
                                    </div>
                                  </div>
                                )}
                              </div>
                              
                              {/* Right Column: Decision Date and Judge */}
                              <div className="space-y-2.5">
                                {judgment.decision_date && (
                                  <div className="flex items-start gap-1.5">
                                    <svg className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#CF9B63' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-xs text-gray-500 mb-0.5" style={{ fontFamily: "'Heebo', sans-serif" }}>Decision Date</p>
                                      <p className="text-xs font-medium text-gray-700" style={{ fontFamily: "'Heebo', sans-serif", fontWeight: 500 }}>{judgment.decision_date}</p>
                                    </div>
                                  </div>
                                )}
                                
                                {judgment.judge && (
                                  <div className="flex items-start gap-1.5">
                                    <svg className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#CF9B63' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-xs text-gray-500 mb-0.5" style={{ fontFamily: "'Heebo', sans-serif" }}>Judge</p>
                                      <p 
                                        className="text-xs font-medium text-gray-700" 
                                        style={{ fontFamily: "'Heebo', sans-serif", fontWeight: 500 }}
                                        dangerouslySetInnerHTML={{
                                          __html: (() => {
                                            const judgeHighlights = judgment.highlights?.judge || 
                                                                   (judgment.highlight && judgment.highlight.judge) ||
                                                                   null;
                                            
                                            if (judgeHighlights) {
                                              if (Array.isArray(judgeHighlights) && judgeHighlights.length > 0) {
                                                return judgeHighlights[0];
                                              } else if (typeof judgeHighlights === 'string' && judgeHighlights.trim()) {
                                                return judgeHighlights;
                                              }
                                            }
                                            return (judgment.judge || '').replace(/</g, '&lt;').replace(/>/g, '&gt;');
                                          })()
                                        }}
                                      />
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
                                  viewJudgment(judgment);
                                }}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      viewJudgment(judgment);
                                    }
                                  }}
                                  aria-label={`View full details for ${judgment.title || judgment.case_info || 'this judgment'}`}
                                  className="px-4 py-2 rounded-lg font-semibold text-xs transition-all duration-200 flex items-center justify-center gap-1.5 whitespace-nowrap hover:shadow-md hover:bg-[#1A5490] active:bg-[#164373] focus:outline-none focus:ring-2 focus:ring-[#1E65AD] focus:ring-offset-2"
                                style={{ 
                                  backgroundColor: '#1E65AD',
                                  color: '#FFFFFF',
                                  fontFamily: 'Roboto, sans-serif'
                                }}
                              >
                                <span>View Details</span>
                                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
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
                                viewJudgment(judgment);
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  viewJudgment(judgment);
                                }
                              }}
                              className="w-full px-4 py-3 bg-[#1E65AD] text-white rounded-lg hover:bg-[#1A5490] active:bg-[#164373] transition-colors font-semibold text-sm shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#1E65AD] focus:ring-offset-2 flex items-center justify-center gap-2"
                              style={{ fontFamily: 'Roboto, sans-serif' }}
                              aria-label="View judgment details"
                            >
                              <span>View Details</span>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </button>
                          </div>
                          
                          {/* PDF Text Highlights (Elasticsearch) - For both High Court and Supreme Court */}
                          {(() => {
                            const pdfHighlights = judgment.highlights?.pdf_text || 
                                                 (judgment.highlight && judgment.highlight.pdf_text) ||
                                                 null;
                            if (pdfHighlights) {
                              const highlightsArray = Array.isArray(pdfHighlights) 
                                ? pdfHighlights 
                                : (typeof pdfHighlights === 'string' ? [pdfHighlights] : []);
                              if (highlightsArray.length > 0) {
                                return (
                                  <div className="mt-4 pt-4 border-t border-gray-100">
                                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                      <p className="text-xs font-semibold text-yellow-800 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                                        Search Matches in PDF:
                                      </p>
                                      <div className="space-y-2">
                                        {highlightsArray.slice(0, 2).map((fragment, idx) => (
                                          <p 
                                            key={idx}
                                            className="text-xs text-gray-700 leading-relaxed line-clamp-2" 
                                            style={{ fontFamily: 'Roboto, sans-serif' }}
                                            dangerouslySetInnerHTML={{ __html: fragment }}
                                          />
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                );
                              }
                            }
                            return null;
                          })()}
                        </div>
                      </div>
                    </motion.div>
                    ))}
                  </AnimatePresence>
                
                  {/* Custom Infinite Scroll Loader */}
                  {judgments.length > 0 && hasMore && (
                    <div 
                      ref={loadingRef} 
                      className="mt-8 py-8 flex items-center justify-center"
                      style={{ minHeight: '100px' }}
                      role="status"
                      aria-live="polite"
                      aria-label="Loading more judgments"
                    >
                      {isLoadingMore ? (
                        <div className="flex flex-col items-center gap-3">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1E65AD]" aria-hidden="true"></div>
                          <p className="text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                            Loading more judgments...
                          </p>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500" style={{ fontFamily: 'Roboto, sans-serif' }}>
                          Scroll down to load more
                        </p>
                      )}
                    </div>
                  )}
                  {judgments.length > 0 && !hasMore && (
                    <div className="mt-8 py-8 text-center" role="status" aria-live="polite">
                      <div className="flex items-center justify-center gap-2">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      <p className="text-sm text-gray-500" style={{ fontFamily: 'Roboto, sans-serif' }}>
                          All judgments loaded
                      </p>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
      
      <ScrollToTopButton />

    </div>
  );
}

