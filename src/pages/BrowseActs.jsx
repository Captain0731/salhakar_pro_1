import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/landing/Navbar";
import apiService from "../services/api";

export default function BrowseActs() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    category: "",
    year: "",
    ministry: "",
    status: "",
    type: ""
  });
  const [acts, setActs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedAct, setSelectedAct] = useState(null);
  const [showActDetails, setShowActDetails] = useState(false);


  const categories = [
    "Criminal Law",
    "Civil Law",
    "Constitutional Law",
    "Corporate Law",
    "Consumer Law",
    "Administrative Law",
    "Transport Law",
    "Evidence Law",
    "Family Law",
    "Property Law"
  ];

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

  const statuses = ["Active", "Repealed", "Amended", "Superseded"];
  const types = ["Central Act", "State Act", "Constitutional Document", "Ordinance", "Rule", "Regulation"];
  const years = Array.from({ length: 20 }, (_, i) => new Date().getFullYear() - i);

  const handleSearch = async () => {
    setLoading(true);
    setError("");
    
    try {
      // Build API parameters for Central Acts search
      const apiParams = {
        limit: 20,
        offset: 0
      };

      // Add search query if provided
      if (searchQuery.trim()) {
        apiParams.search = searchQuery.trim();
      }

      // Add filters only if they have values
      if (filters.category && filters.category.trim()) {
        apiParams.category = filters.category.trim();
      }
      if (filters.year && filters.year.trim()) {
        apiParams.year = parseInt(filters.year);
      }
      if (filters.ministry && filters.ministry.trim()) {
        apiParams.ministry = filters.ministry.trim();
      }
      if (filters.status && filters.status.trim()) {
        apiParams.status = filters.status.trim();
      }
      if (filters.type && filters.type.trim()) {
        apiParams.type = filters.type.trim();
      }

      const data = await apiService.getCentralActsWithOffset(0, 20, apiParams);
      setActs(data.data || []);
    } catch (err) {
      setError(err.message || "Failed to fetch acts. Please try again.");
      setActs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      category: "",
      year: "",
      ministry: "",
      status: "",
      type: ""
    });
    setSearchQuery("");
    setActs([]);
    // Trigger search with cleared filters
    setTimeout(() => handleSearch(), 100);
  };

  // Auto-apply filters when they change (with debounce)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery || Object.values(filters).some(value => value.trim())) {
        handleSearch();
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [searchQuery, filters]);

  const viewActDetails = (act) => {
    setSelectedAct(act);
    setShowActDetails(true);
  };

  const downloadAct = (act) => {
    // In a real app, this would trigger a download
    console.log("Downloading act:", act.title);
    alert(`Downloading: ${act.title}\n\nThis would download the PDF file in a real application.`);
  };

  const closeActDetails = () => {
    setShowActDetails(false);
    setSelectedAct(null);
  };

  useEffect(() => {
    // TODO: Load initial acts from API
    setActs([]);
  }, []);

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F9FAFC' }}>
      <Navbar />
      <div className="p-6 pt-24">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: '#1E65AD', fontFamily: "'Bricolage Grotesque', sans-serif" }}>
              Browse Acts
            </h1>
            <p className="text-lg" style={{ color: '#8C969F', fontFamily: 'Roboto, sans-serif' }}>
              Search and browse through legal acts, regulations, and statutes
            </p>
          </div>

          {/* Search Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4" style={{ color: '#1E65AD', fontFamily: "'Bricolage Grotesque', sans-serif" }}>
              Search Acts & Regulations
            </h2>
            
            {/* Main Search Bar */}
            <div className="mb-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by act name, short title, or keywords..."
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                    style={{ fontFamily: 'Roboto, sans-serif', '--tw-ring-color': '#1E65AD' }}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </div>
                <button
                  onClick={handleSearch}
                  disabled={loading}
                  className="px-8 py-3 rounded-lg font-semibold text-white transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  style={{ backgroundColor: '#1E65AD', fontFamily: 'Roboto, sans-serif', minHeight: '44px' }}
                >
                  {loading ? "Searching..." : "Search"}
                </button>
              </div>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: '#1E65AD', fontFamily: 'Roboto, sans-serif' }}>
                  Category
                </label>
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                  style={{ fontFamily: 'Roboto, sans-serif', '--tw-ring-color': '#1E65AD' }}
                >
                  <option value="">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: '#1E65AD', fontFamily: 'Roboto, sans-serif' }}>
                  Year
                </label>
                <select
                  value={filters.year}
                  onChange={(e) => handleFilterChange('year', e.target.value)}
                  className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                  style={{ fontFamily: 'Roboto, sans-serif', '--tw-ring-color': '#1E65AD' }}
                >
                  <option value="">All Years</option>
                  {years.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: '#1E65AD', fontFamily: 'Roboto, sans-serif' }}>
                  Ministry
                </label>
                <select
                  value={filters.ministry}
                  onChange={(e) => handleFilterChange('ministry', e.target.value)}
                  className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                  style={{ fontFamily: 'Roboto, sans-serif', '--tw-ring-color': '#1E65AD' }}
                >
                  <option value="">All Ministries</option>
                  {ministries.map(ministry => (
                    <option key={ministry} value={ministry}>{ministry}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: '#1E65AD', fontFamily: 'Roboto, sans-serif' }}>
                  Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                  style={{ fontFamily: 'Roboto, sans-serif', '--tw-ring-color': '#1E65AD' }}
                >
                  <option value="">All Status</option>
                  {statuses.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: '#1E65AD', fontFamily: 'Roboto, sans-serif' }}>
                  Type
                </label>
                <select
                  value={filters.type}
                  onChange={(e) => handleFilterChange('type', e.target.value)}
                  className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                  style={{ fontFamily: 'Roboto, sans-serif', '--tw-ring-color': '#1E65AD' }}
                >
                  <option value="">All Types</option>
                  {types.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleSearch}
                disabled={loading}
                className="px-6 py-2 rounded-lg font-semibold text-white transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                style={{ backgroundColor: '#1E65AD', fontFamily: 'Roboto, sans-serif' }}
              >
                {loading ? "Searching..." : "Apply Filters"}
              </button>
              <button
                onClick={clearFilters}
                className="px-6 py-2 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 border-2"
                style={{ 
                  color: '#8C969F', 
                  borderColor: '#8C969F', 
                  fontFamily: 'Roboto, sans-serif' 
                }}
              >
                Clear All
              </button>
            </div>
          </div>

          {/* Results Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold" style={{ color: '#1E65AD', fontFamily: "'Bricolage Grotesque', sans-serif" }}>
                Acts & Regulations
              </h2>
              <span className="text-sm" style={{ color: '#8C969F', fontFamily: 'Roboto, sans-serif' }}>
                {acts.length} acts found
              </span>
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Searching acts...</p>
                </div>
              </div>
            ) : acts.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-500 text-lg mb-2">No acts found</div>
                <p className="text-gray-400">Try adjusting your search criteria</p>
              </div>
            ) : (
              <div className="space-y-4">
                {acts.map((act) => (
                  <div
                    key={act.id}
                    className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow duration-200"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-start gap-3 mb-3">
                          <h3 className="text-xl font-semibold" style={{ color: '#1E65AD', fontFamily: "'Bricolage Grotesque', sans-serif" }}>
                            {act.title}
                          </h3>
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                            {act.shortTitle}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4">
                          <div>
                            <span className="font-medium text-gray-800">Category:</span>
                            <span className="ml-2" style={{ color: '#8C969F' }}>{act.category}</span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-800">Year:</span>
                            <span className="ml-2" style={{ color: '#8C969F' }}>{act.year}</span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-800">Ministry:</span>
                            <span className="ml-2" style={{ color: '#8C969F' }}>{act.ministry}</span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-800">Status:</span>
                            <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                              act.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {act.status}
                            </span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-800">Type:</span>
                            <span className="ml-2" style={{ color: '#8C969F' }}>{act.type}</span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-800">Sections:</span>
                            <span className="ml-2" style={{ color: '#8C969F' }}>{act.sections}</span>
                          </div>
                        </div>

                        <p className="text-gray-600 mb-4" style={{ fontFamily: 'Roboto, sans-serif' }}>
                          {act.description}
                        </p>

                        <div className="flex flex-wrap gap-2 mb-4">
                          {act.keywords.map((keyword, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs"
                              style={{ fontFamily: 'Roboto, sans-serif' }}
                            >
                              {keyword}
                            </span>
                          ))}
                        </div>

                        <div className="text-xs" style={{ color: '#8C969F', fontFamily: 'Roboto, sans-serif' }}>
                          Last amended: {new Date(act.lastAmended).toLocaleDateString()}
                        </div>
                      </div>

                      <div className="flex-shrink-0 flex flex-col gap-2">
                        <button
                          onClick={() => viewActDetails(act)}
                          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm hover:shadow-md"
                          style={{ fontFamily: 'Roboto, sans-serif' }}
                        >
                          View Details
                        </button>
                        <button
                          onClick={() => downloadAct(act)}
                          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                          style={{ fontFamily: 'Roboto, sans-serif' }}
                        >
                          Download PDF
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Act Details Modal */}
      {showActDetails && selectedAct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold" style={{ color: '#1E65AD', fontFamily: "'Bricolage Grotesque', sans-serif" }}>
                  {selectedAct.title}
                </h2>
                <button
                  onClick={closeActDetails}
                  className="text-gray-400 hover:text-gray-600 p-2"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="font-semibold mb-2" style={{ color: '#1E65AD' }}>Basic Information</h3>
                  <div className="space-y-2 text-sm">
                    <div><strong>Short Title:</strong> {selectedAct.shortTitle}</div>
                    <div><strong>Category:</strong> {selectedAct.category}</div>
                    <div><strong>Year:</strong> {selectedAct.year}</div>
                    <div><strong>Type:</strong> {selectedAct.type}</div>
                    <div><strong>Status:</strong> {selectedAct.status}</div>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2" style={{ color: '#1E65AD' }}>Administrative Details</h3>
                  <div className="space-y-2 text-sm">
                    <div><strong>Ministry:</strong> {selectedAct.ministry}</div>
                    <div><strong>Sections:</strong> {selectedAct.sections}</div>
                    <div><strong>Last Amended:</strong> {new Date(selectedAct.lastAmended).toLocaleDateString()}</div>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="font-semibold mb-2" style={{ color: '#1E65AD' }}>Description</h3>
                <p className="text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  {selectedAct.description}
                </p>
              </div>

              <div className="mb-6">
                <h3 className="font-semibold mb-2" style={{ color: '#1E65AD' }}>Keywords</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedAct.keywords.map((keyword, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                      style={{ fontFamily: 'Roboto, sans-serif' }}
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => downloadAct(selectedAct)}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                  style={{ fontFamily: 'Roboto, sans-serif' }}
                >
                  Download PDF
                </button>
                <button
                  onClick={closeActDetails}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  style={{ fontFamily: 'Roboto, sans-serif' }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
