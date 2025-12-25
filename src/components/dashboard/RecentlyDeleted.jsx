import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import apiService from '../../services/api';
import { 
  Trash2,
  ArrowLeft,
  FileText,
  Bookmark,
  Clock,
  RotateCcw,
  X
} from 'lucide-react';

const RecentlyDeleted = ({ onBack }) => {
  const { isAuthenticated, user } = useAuth();
  const [deletedNotes, setDeletedNotes] = useState([]);
  const [deletedBookmarks, setDeletedBookmarks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'notes', 'bookmarks'

  useEffect(() => {
    if (isAuthenticated && user) {
      loadDeletedItems();
    }
  }, [isAuthenticated, user]);

  const loadDeletedItems = async () => {
    setLoading(true);
    try {
      // Note: This assumes the API has endpoints for deleted items
      // For now, we'll show a placeholder message
      // You can implement actual API calls when the backend supports it
      setDeletedNotes([]);
      setDeletedBookmarks([]);
    } catch (error) {
      console.error('Error loading deleted items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (item, type) => {
    try {
      if (type === 'note') {
        // Implement restore note API call
        console.log('Restore note:', item.id);
        // await apiService.restoreNote(item.id);
        setDeletedNotes(prev => prev.filter(n => n.id !== item.id));
      } else if (type === 'bookmark') {
        // Implement restore bookmark API call
        console.log('Restore bookmark:', item.id);
        // await apiService.restoreBookmark(item.id);
        setDeletedBookmarks(prev => prev.filter(b => b.id !== item.id));
      }
    } catch (error) {
      console.error('Error restoring item:', error);
      alert('Failed to restore item. Please try again.');
    }
  };

  const handlePermanentDelete = async (item, type) => {
    if (!window.confirm('Are you sure you want to permanently delete this item? This action cannot be undone.')) {
      return;
    }

    try {
      if (type === 'note') {
        // Implement permanent delete note API call
        console.log('Permanently delete note:', item.id);
        // await apiService.permanentDeleteNote(item.id);
        setDeletedNotes(prev => prev.filter(n => n.id !== item.id));
      } else if (type === 'bookmark') {
        // Implement permanent delete bookmark API call
        console.log('Permanently delete bookmark:', item.id);
        // await apiService.permanentDeleteBookmark(item.id);
        setDeletedBookmarks(prev => prev.filter(b => b.id !== item.id));
      }
    } catch (error) {
      console.error('Error permanently deleting item:', error);
      alert('Failed to permanently delete item. Please try again.');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleString();
  };

  const allDeletedItems = [
    ...deletedNotes.map(note => ({ ...note, itemType: 'note' })),
    ...deletedBookmarks.map(bookmark => ({ ...bookmark, itemType: 'bookmark' }))
  ].sort((a, b) => {
    const dateA = new Date(a.deleted_at || a.updated_at || 0);
    const dateB = new Date(b.deleted_at || b.updated_at || 0);
    return dateB - dateA;
  });

  const filteredItems = activeTab === 'all' 
    ? allDeletedItems 
    : activeTab === 'notes'
    ? deletedNotes.map(note => ({ ...note, itemType: 'note' }))
    : deletedBookmarks.map(bookmark => ({ ...bookmark, itemType: 'bookmark' }));

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-white to-gray-50 rounded-xl border border-gray-200 p-4 sm:p-6 shadow-sm">
        <div className="flex flex-col gap-3 sm:gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 sm:gap-0">
            {/* Mobile Back Button */}
            {onBack && (
              <button
                onClick={onBack}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors mr-2"
                aria-label="Back to Dashboard"
              >
                <ArrowLeft className="h-5 w-5 text-gray-700" />
              </button>
            )}
            <div>
              <h1 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2" style={{ color: '#1E65AD', fontFamily: "'Bricolage Grotesque', sans-serif" }}>
                Recently Deleted
              </h1>
              <p className="text-gray-600 text-xs sm:text-sm" style={{ fontFamily: 'Roboto, sans-serif' }}>
                Restore or permanently delete your deleted items
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-gray-200 p-3 sm:p-4 shadow-sm">
        <div className="flex gap-2 sm:gap-3">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-lg font-medium text-xs sm:text-sm transition-all duration-200 ${
              activeTab === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            style={{ fontFamily: 'Roboto, sans-serif' }}
          >
            All Items
          </button>
          <button
            onClick={() => setActiveTab('notes')}
            className={`px-4 py-2 rounded-lg font-medium text-xs sm:text-sm transition-all duration-200 ${
              activeTab === 'notes'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            style={{ fontFamily: 'Roboto, sans-serif' }}
          >
            Notes ({deletedNotes.length})
          </button>
          <button
            onClick={() => setActiveTab('bookmarks')}
            className={`px-4 py-2 rounded-lg font-medium text-xs sm:text-sm transition-all duration-200 ${
              activeTab === 'bookmarks'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            style={{ fontFamily: 'Roboto, sans-serif' }}
          >
            Bookmarks ({deletedBookmarks.length})
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 shadow-sm">
        {loading ? (
          <div className="text-center py-8 sm:py-12">
            <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-blue-600 mx-auto mb-3 sm:mb-4"></div>
            <p className="text-gray-500 text-xs sm:text-sm" style={{ fontFamily: 'Roboto, sans-serif' }}>
              Loading deleted items...
            </p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-8 sm:py-12">
            <Trash2 className="h-12 w-12 sm:h-16 sm:w-16 text-gray-300 mx-auto mb-3 sm:mb-4" />
            <p className="text-gray-500 text-xs sm:text-sm" style={{ fontFamily: 'Roboto, sans-serif' }}>
              No deleted items found. Items you delete will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {filteredItems.map((item) => (
              <div
                key={`${item.itemType}-${item.id}`}
                className="p-4 sm:p-5 rounded-lg border border-gray-200 hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-start justify-between gap-3 sm:gap-4">
                  <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
                    <div className={`p-2 sm:p-3 rounded-lg flex-shrink-0 ${
                      item.itemType === 'note' ? 'bg-blue-100' : 'bg-orange-100'
                    }`}>
                      {item.itemType === 'note' ? (
                        <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                      ) : (
                        <Bookmark className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 sm:mb-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] sm:text-xs font-medium ${
                          item.itemType === 'note' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-orange-100 text-orange-800'
                        }`} style={{ fontFamily: 'Roboto, sans-serif' }}>
                          {item.itemType === 'note' ? 'Note' : 'Bookmark'}
                        </span>
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-1 sm:mb-2 text-sm sm:text-base truncate" style={{ fontFamily: 'Roboto, sans-serif' }}>
                        {item.title || item.name || 'Untitled'}
                      </h3>
                      <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-500" style={{ fontFamily: 'Roboto, sans-serif' }}>
                        <Clock className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                        <span>Deleted: {formatDate(item.deleted_at || item.updated_at)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleRestore(item, item.itemType)}
                      className="p-2 rounded-lg hover:bg-green-100 transition-colors"
                      title="Restore"
                    >
                      <RotateCcw className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                    </button>
                    <button
                      onClick={() => handlePermanentDelete(item, item.itemType)}
                      className="p-2 rounded-lg hover:bg-red-100 transition-colors"
                      title="Permanently Delete"
                    >
                      <X className="h-4 w-4 sm:h-5 sm:w-5 text-red-600" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentlyDeleted;

