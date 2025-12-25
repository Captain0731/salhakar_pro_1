import React, { useState } from 'react';
import { 
  Bookmark, 
  BookmarkCheck, 
  Star, 
  StarOff, 
  Search, 
  Filter,
  Loader2,
  AlertCircle,
  X,
  FileText,
  Scale,
  Gavel
} from 'lucide-react';
import useBookmarks from '../hooks/useBookmarks';

/**
 * Example component demonstrating how to use the Bookmark API
 * This follows the documented API structure and shows best practices
 */
const BookmarkExample = ({ userToken }) => {
  const {
    bookmarks,
    loading,
    error,
    pagination,
    loadMoreBookmarks,
    toggleBookmark,
    isBookmarked,
    getBookmarksByType,
    searchBookmarks,
    clearError
  } = useBookmarks(userToken);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [selectedItem, setSelectedItem] = useState(null);

  // Example: Bookmark a judgement
  const handleBookmarkJudgement = async (judgementId) => {
    const success = await toggleBookmark('judgement', judgementId);
    if (success) {
      console.log('Judgement bookmarked successfully');
    }
  };

  // Example: Bookmark a central act
  const handleBookmarkCentralAct = async (actId) => {
    const success = await toggleBookmark('central_act', actId);
    if (success) {
      console.log('Central act bookmarked successfully');
    }
  };

  // Example: Bookmark a state act
  const handleBookmarkStateAct = async (actId) => {
    const success = await toggleBookmark('state_act', actId);
    if (success) {
      console.log('State act bookmarked successfully');
    }
  };

  // Example: Bookmark a BSA-IEA mapping
  const handleBookmarkBsaIeaMapping = async (mappingId) => {
    const success = await toggleBookmark('bsa_iea_mapping', mappingId);
    if (success) {
      console.log('BSA-IEA mapping bookmarked successfully');
    }
  };

  // Example: Bookmark a BNS-IPC mapping
  const handleBookmarkBnsIpcMapping = async (mappingId) => {
    const success = await toggleBookmark('bns_ipc_mapping', mappingId);
    if (success) {
      console.log('BNS-IPC mapping bookmarked successfully');
    }
  };

  // Get filtered and searched bookmarks
  const getFilteredBookmarks = () => {
    let filtered = bookmarks;
    
    // Apply search filter
    if (searchQuery.trim()) {
      filtered = searchBookmarks(searchQuery);
    }
    
    // Apply type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(bookmark => bookmark.type === filterType);
    }
    
    return filtered;
  };

  const filteredBookmarks = getFilteredBookmarks();

  // Get bookmark type icon
  const getBookmarkTypeIcon = (type) => {
    switch (type) {
      case 'judgement':
        return <Gavel className="h-5 w-5 text-blue-600" />;
      case 'central_act':
      case 'state_act':
        return <FileText className="h-5 w-5 text-green-600" />;
      case 'bsa_iea_mapping':
      case 'bns_ipc_mapping':
        return <Scale className="h-5 w-5 text-purple-600" />;
      default:
        return <Bookmark className="h-5 w-5 text-gray-600" />;
    }
  };

  // Get bookmark type color
  const getBookmarkTypeColor = (type) => {
    switch (type) {
      case 'judgement':
        return 'bg-blue-100 text-blue-800';
      case 'central_act':
      case 'state_act':
        return 'bg-green-100 text-green-800';
      case 'bsa_iea_mapping':
      case 'bns_ipc_mapping':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Bookmark API Example
        </h1>
        <p className="text-gray-600">
          Demonstrating how to use the Bookmark API endpoints according to the documentation
        </p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
          <AlertCircle className="h-5 w-5 text-red-600 mr-3" />
          <div className="flex-1">
            <h3 className="text-sm font-medium text-red-800">Error</h3>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
          <button
            onClick={clearError}
            className="ml-auto text-red-600 hover:text-red-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search bookmarks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Types</option>
            <option value="judgement">Judgements</option>
            <option value="central_act">Central Acts</option>
            <option value="state_act">State Acts</option>
            <option value="bsa_iea_mapping">BSA-IEA Mappings</option>
            <option value="bns_ipc_mapping">BNS-IPC Mappings</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{getBookmarksByType('judgement').length}</div>
          <div className="text-sm text-gray-600">Judgements</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{getBookmarksByType('central_act').length}</div>
          <div className="text-sm text-gray-600">Central Acts</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{getBookmarksByType('state_act').length}</div>
          <div className="text-sm text-gray-600">State Acts</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">{getBookmarksByType('bsa_iea_mapping').length}</div>
          <div className="text-sm text-gray-600">BSA-IEA</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">{getBookmarksByType('bns_ipc_mapping').length}</div>
          <div className="text-sm text-gray-600">BNS-IPC</div>
        </div>
      </div>

      {/* Example Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Example Bookmark Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <button
            onClick={() => handleBookmarkJudgement(123)}
            className="flex items-center justify-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Gavel className="h-5 w-5 text-blue-600 mr-2" />
            <span className="text-sm font-medium">Bookmark Judgement #123</span>
          </button>
          
          <button
            onClick={() => handleBookmarkCentralAct(456)}
            className="flex items-center justify-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <FileText className="h-5 w-5 text-green-600 mr-2" />
            <span className="text-sm font-medium">Bookmark Central Act #456</span>
          </button>
          
          <button
            onClick={() => handleBookmarkStateAct(789)}
            className="flex items-center justify-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <FileText className="h-5 w-5 text-green-600 mr-2" />
            <span className="text-sm font-medium">Bookmark State Act #789</span>
          </button>
          
          <button
            onClick={() => handleBookmarkBsaIeaMapping(101)}
            className="flex items-center justify-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Scale className="h-5 w-5 text-purple-600 mr-2" />
            <span className="text-sm font-medium">Bookmark BSA-IEA #101</span>
          </button>
          
          <button
            onClick={() => handleBookmarkBnsIpcMapping(202)}
            className="flex items-center justify-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Scale className="h-5 w-5 text-purple-600 mr-2" />
            <span className="text-sm font-medium">Bookmark BNS-IPC #202</span>
          </button>
        </div>
      </div>

      {/* Bookmarks List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Your Bookmarks ({filteredBookmarks.length})
          </h2>
        </div>

        {loading && bookmarks.length === 0 ? (
          <div className="p-12 text-center">
            <Loader2 className="h-8 w-8 text-blue-600 mx-auto mb-4 animate-spin" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Loading bookmarks...</h3>
            <p className="text-gray-500">Please wait while we fetch your bookmarks</p>
          </div>
        ) : filteredBookmarks.length === 0 ? (
          <div className="p-12 text-center">
            <Bookmark className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No bookmarks found</h3>
            <p className="text-gray-500">
              {searchQuery ? 'Try adjusting your search criteria' : 'Start by bookmarking some documents'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredBookmarks.map((bookmark) => (
              <div
                key={bookmark.id}
                className="p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    {getBookmarkTypeIcon(bookmark.type)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="text-sm font-medium text-gray-900 truncate">
                          {(bookmark.item || bookmark).title || 'Untitled'}
                        </h3>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getBookmarkTypeColor(bookmark.type)}`}>
                          {bookmark.type.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mb-2">
                        {(bookmark.item || bookmark).description || ''}
                      </p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>ID: {(bookmark.item || bookmark).id}</span>
                        <span>Added: {formatDate(bookmark.created_at)}</span>
                        {bookmark.tags && bookmark.tags.length > 0 && (
                          <span>Tags: {bookmark.tags.join(', ')}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => {
                        const item = bookmark.item || bookmark;
                        setSelectedItem({
                          type: bookmark.type,
                          id: item.id,
                          title: item.title
                        });
                      }}
                      className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                      title="View details"
                    >
                      <Bookmark className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Load More Button */}
        {pagination.hasMore && !loading && (
          <div className="p-4 border-t border-gray-200 text-center">
            <button
              onClick={loadMoreBookmarks}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Load More Bookmarks
            </button>
          </div>
        )}

        {/* Loading More Indicator */}
        {loading && bookmarks.length > 0 && (
          <div className="p-4 border-t border-gray-200 text-center">
            <Loader2 className="h-5 w-5 text-blue-600 mx-auto animate-spin" />
            <p className="text-sm text-gray-500 mt-2">Loading more bookmarks...</p>
          </div>
        )}
      </div>

      {/* Selected Item Details */}
      {selectedItem && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Selected Item Details</h3>
          <div className="space-y-2">
            <p><strong>Type:</strong> {selectedItem.type}</p>
            <p><strong>ID:</strong> {selectedItem.id}</p>
            <p><strong>Title:</strong> {selectedItem.title}</p>
            <p><strong>Is Bookmarked:</strong> {isBookmarked(selectedItem.type, selectedItem.id) ? 'Yes' : 'No'}</p>
          </div>
          <button
            onClick={() => setSelectedItem(null)}
            className="mt-4 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
};

export default BookmarkExample;
