import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bookmark, BookmarkCheck, Star, StarOff, Loader2, CheckCircle, XCircle, Folder, X, FolderPlus } from 'lucide-react';
import apiService from '../services/api';
import { useAuth } from '../contexts/AuthContext';

/**
 * Perfect Bookmark Button Component
 * Handles bookmarking for different content types with real-time status checking
 */
const BookmarkButton = ({ 
  item, 
  type, 
  actType = null, 
  mappingType = null, 
  size = 'default',
  showText = true,
  onBookmarkChange = null,
  autoCheckStatus = true,
  showNotifications = true,
  className = ''
}) => {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);
  const [bookmarkId, setBookmarkId] = useState(null);
  const [showFolderSelector, setShowFolderSelector] = useState(false);
  const [folders, setFolders] = useState([]);
  const [showCreateFolderInput, setShowCreateFolderInput] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const folderSelectorRef = useRef(null);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // Check if user is authenticated
  const isUserAuthenticated = () => {
    const token = localStorage.getItem('access_token') || 
                  localStorage.getItem('accessToken') || 
                  localStorage.getItem('token');
    const hasValidToken = !!token && token !== 'null' && token !== 'undefined';
    return isAuthenticated && hasValidToken;
  };

  // Load folders on mount
  useEffect(() => {
    if (isUserAuthenticated()) {
      loadFolders();
    }
  }, [isAuthenticated]);

  // Check bookmark status on mount
  useEffect(() => {
    if (autoCheckStatus && item?.id && isUserAuthenticated()) {
      checkBookmarkStatus();
    }
  }, [item?.id, type, isAuthenticated]);

  // Close folder selector when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (folderSelectorRef.current && !folderSelectorRef.current.contains(event.target)) {
        setShowFolderSelector(false);
      }
    };

    if (showFolderSelector) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showFolderSelector]);

  const loadFolders = async () => {
    try {
      const response = await apiService.getBookmarkFolders();
      setFolders(response.folders || []);
    } catch (err) {
      console.error('Error loading folders:', err);
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim() || isCreatingFolder) return;

    try {
      setIsCreatingFolder(true);
      await apiService.createBookmarkFolder(newFolderName.trim());
      setNewFolderName('');
      setShowCreateFolderInput(false);
      await loadFolders(); // Reload folders to show the new one
    } catch (err) {
      console.error('Error creating folder:', err);
      alert('Failed to create folder. Please try again.');
    } finally {
      setIsCreatingFolder(false);
    }
  };

  const checkBookmarkStatus = async () => {
    // For state acts, check both item.id and item.act_id
    let itemId = item?.id;
    if ((type === 'state_act' || type === 'central_act') && !itemId && item?.act_id) {
      itemId = item.act_id;
    }
    if (!itemId) {
      console.warn('⚠️ No item ID found for bookmark status check:', { item, type });
      return;
    }
    
    setIsCheckingStatus(true);
    try {
      // For mapping types, also check the normalized type (e.g., 'bnss_crpc' for 'bnss_crpc_mapping')
      // Backend might store/return bookmarks with normalized type
      let normalizedType = type;
      if (type === 'bsa_iea_mapping') normalizedType = 'bsa_iea';
      else if (type === 'bns_ipc_mapping') normalizedType = 'bns_ipc';
      else if (type === 'bnss_crpc_mapping') normalizedType = 'bnss_crpc';
      
      // Try to get bookmarks with type filter first
      // If that fails (e.g., backend doesn't support bnss_crpc_mapping filter), get all bookmarks
      let response;
      try {
        response = await apiService.getUserBookmarks({
          limit: 1000, // Get all bookmarks to check status
          type: type
        });
      } catch (typeFilterError) {
        // If type filter fails (e.g., backend doesn't support bnss_crpc_mapping), 
        // get all bookmarks and filter on frontend
        console.warn('Type filter failed, fetching all bookmarks:', typeFilterError.message);
        response = await apiService.getUserBookmarks({
          limit: 1000
        });
      }
      
      // For state acts, use the correct itemId (might be from item.id or item.act_id)
      const checkItemId = parseInt(item.id || item.act_id);
      const checkItemIdString = String(item.id || item.act_id);
      
      const existingBookmark = response.bookmarks?.find(bookmark => {
        const bookmarkItem = bookmark.item || bookmark;
        // Compare IDs - handle both string and numeric, and also check act_id field
        const bookmarkItemId = parseInt(bookmarkItem.id);
        const bookmarkItemIdString = String(bookmarkItem.id);
        const bookmarkActId = bookmarkItem.act_id ? parseInt(bookmarkItem.act_id) : null;
        
        // Multiple ID comparison strategies
        const idMatches = 
          bookmarkItemId === checkItemId || 
          bookmarkItemIdString === checkItemIdString ||
          bookmarkItem.id === item.id ||
          bookmarkItem.id === item.act_id ||
          (bookmarkActId !== null && bookmarkActId === checkItemId) ||
          (item.act_id && bookmarkItem.id === parseInt(item.act_id));
        
        // Check both the original type and normalized type (backend might return normalized type)
        const typeMatches = bookmark.type === type || bookmark.type === normalizedType;
        
        // Debug logging for state acts
        if (type === 'state_act') {
          console.log('🔍 Checking state act bookmark:', {
            bookmarkType: bookmark.type,
            expectedType: type,
            itemId: item.id,
            itemActId: item.act_id,
            checkItemId,
            checkItemIdString,
            bookmarkItemId: bookmarkItem.id,
            bookmarkItemIdString,
            bookmarkActId,
            idMatches,
            typeMatches,
            bookmarkItem: bookmarkItem
          });
        }
        
        return idMatches && typeMatches;
      });
      
      if (existingBookmark) {
        console.log('✅ Found existing bookmark for state act:', existingBookmark);
        setIsBookmarked(true);
        setBookmarkId(existingBookmark.id);
      } else {
        if (type === 'state_act') {
          console.log('⚠️ No existing bookmark found for state act:', {
            itemId: item.id,
            itemActId: item.act_id,
            totalBookmarks: response.bookmarks?.length || 0,
            stateActBookmarks: response.bookmarks?.filter(b => b.type === 'state_act').length || 0,
            allStateActBookmarks: response.bookmarks?.filter(b => b.type === 'state_act')
          });
        }
        setIsBookmarked(false);
        setBookmarkId(null);
      }
    } catch (err) {
      // Silently handle errors - don't show error for status check
      // 404 errors are expected if user has no bookmarks or is not authenticated
      if (err.message && !err.message.includes('404')) {
        console.warn('Bookmark status check failed (non-critical):', err.message);
      }
      // Assume not bookmarked on any error
      setIsBookmarked(false);
      setBookmarkId(null);
    } finally {
      setIsCheckingStatus(false);
    }
  };

  const showNotificationMessage = (message, type = 'success') => {
    if (!showNotifications) return;
    
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleBookmarkToggle = async (folderId = null) => {
    if (isLoading || !item) return;
    
    // Check authentication first
    if (!isUserAuthenticated()) {
      navigate('/login');
      return;
    }
    
    // If not bookmarked and folders exist, show folder selector
    if (!isBookmarked && folders.length > 0 && folderId === null) {
      setShowFolderSelector(true);
      return;
    }
    
    // Close folder selector
    setShowFolderSelector(false);
    
    // For acts, ensure we have a valid numeric ID
    let itemId = item.id;
    if ((type === 'central_act' || type === 'state_act') && !itemId) {
      // Fallback: try act_id if id is not available
      itemId = item.act_id;
      console.warn('⚠️ Using act_id fallback:', { item, type, itemId });
    }
    
    // For state acts, also check if id is valid numeric
    if ((type === 'central_act' || type === 'state_act') && itemId) {
      const numericId = parseInt(itemId);
      if (isNaN(numericId)) {
        // Try act_id as fallback
        if (item.act_id) {
          const numericActId = parseInt(item.act_id);
          if (!isNaN(numericActId)) {
            itemId = numericActId;
            console.warn('⚠️ Using act_id because id is not numeric:', { originalId: item.id, actId: item.act_id, using: itemId });
          }
        }
      }
    }
    
    if (!itemId) {
      console.error('❌ No valid ID found for bookmark:', { item, type, itemId, actId: item.act_id });
      // Only set error if showText is true
      if (showText) {
        setError('Item ID is missing. Cannot bookmark.');
      }
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    console.log('🔖 BookmarkButton: Toggling bookmark', { type, itemId, item, isBookmarked, folderId });
    
    try {
      let success = false;
      let message = '';
      
      if (isBookmarked) {
        // Remove bookmark
        switch (type) {
          case 'judgement':
            await apiService.removeJudgementBookmark(item.id);
            message = 'Judgment removed from bookmarks';
            break;
          case 'central_act':
            // Ensure numeric ID - backend requires numeric item.id, not string act_id
            const centralActId = parseInt(item.id);
            if (isNaN(centralActId)) {
              throw new Error('Invalid central act ID');
            }
            console.log('🔖 Removing central act bookmark:', { id: centralActId, originalId: item.id, item });
            await apiService.removeActBookmark('central', centralActId);
            message = 'Central act removed from bookmarks';
            break;
          case 'state_act':
            // Ensure numeric ID - backend requires numeric item.id, not string act_id
            // Try multiple ID fields for state acts
            let stateActId = parseInt(item.id);
            if (isNaN(stateActId) && item.act_id) {
              stateActId = parseInt(item.act_id);
            }
            if (isNaN(stateActId)) {
              console.error('❌ Invalid state act ID for removal:', { item, itemId: item.id, actId: item.act_id });
              throw new Error('Invalid state act ID. Expected numeric id or act_id field.');
            }
            console.log('🔖 Removing state act bookmark:', { 
              id: stateActId, 
              originalId: item.id,
              actId: item.act_id,
              item,
              actType: 'state'
            });
            await apiService.removeActBookmark('state', stateActId);
            message = 'State act removed from bookmarks';
            break;
          case 'bsa_iea_mapping':
            await apiService.removeMappingBookmark('bsa_iea', item.id);
            message = 'BSA-IEA mapping removed from bookmarks';
            break;
          case 'bns_ipc_mapping':
            await apiService.removeMappingBookmark('bns_ipc', item.id);
            message = 'BNS-IPC mapping removed from bookmarks';
            break;
          case 'bnss_crpc_mapping':
            await apiService.removeMappingBookmark('bnss_crpc', item.id);
            message = 'BNSS-CrPC mapping removed from bookmarks';
            break;
          default:
            throw new Error(`Unsupported bookmark type: ${type}`);
        }
        
        setIsBookmarked(false);
        setBookmarkId(null);
        success = true;
        
      } else {
        // Add bookmark
        let response;
        switch (type) {
          case 'judgement':
            response = await apiService.bookmarkJudgement(item.id, folderId);
            message = 'Judgment added to bookmarks';
            break;
          case 'central_act':
            // Ensure numeric ID - backend requires numeric item.id, not string act_id
            const centralActIdAdd = parseInt(item.id);
            if (isNaN(centralActIdAdd)) {
              throw new Error('Invalid central act ID');
            }
            console.log('🔖 Adding central act bookmark:', { id: centralActIdAdd, originalId: item.id, item, folderId });
            response = await apiService.bookmarkAct('central', centralActIdAdd, folderId);
            console.log('🔖 Central act bookmark response:', response);
            message = 'Central act added to bookmarks';
            break;
          case 'state_act':
            // Ensure numeric ID - backend requires numeric item.id, not string act_id
            // Try multiple ID fields for state acts
            let stateActIdAdd = parseInt(item.id);
            if (isNaN(stateActIdAdd) && item.act_id) {
              stateActIdAdd = parseInt(item.act_id);
            }
            if (isNaN(stateActIdAdd)) {
              console.error('❌ Invalid state act ID for addition:', { item, itemId: item.id, actId: item.act_id });
              throw new Error('Invalid state act ID. Expected numeric id or act_id field.');
            }
            console.log('🔖 Adding state act bookmark:', { 
              id: stateActIdAdd, 
              originalId: item.id,
              actId: item.act_id,
              item, 
              folderId,
              actType: 'state',
              fullItem: JSON.stringify(item, null, 2)
            });
            try {
              // API endpoint: POST /api/bookmarks/acts/state/{act_id}
              // Pass 'state' as actType (not 'state_act')
              response = await apiService.bookmarkAct('state', stateActIdAdd, folderId);
              console.log('✅ State act bookmark response:', response);
              message = 'State act added to bookmarks';
            } catch (bookmarkError) {
              console.error('❌ State act bookmark error:', bookmarkError);
              console.error('❌ Error details:', {
                message: bookmarkError.message,
                stack: bookmarkError.stack,
                actId: stateActIdAdd,
                actType: 'state'
              });
              throw bookmarkError;
            }
            break;
          case 'bsa_iea_mapping':
            response = await apiService.bookmarkMapping('bsa_iea', item.id, folderId);
            message = 'BSA-IEA mapping added to bookmarks';
            break;
          case 'bns_ipc_mapping':
            response = await apiService.bookmarkMapping('bns_ipc', item.id, folderId);
            message = 'BNS-IPC mapping added to bookmarks';
            break;
          case 'bnss_crpc_mapping':
            response = await apiService.bookmarkMapping('bnss_crpc', item.id, folderId);
            message = 'BNSS-CrPC mapping added to bookmarks';
            break;
          default:
            throw new Error(`Unsupported bookmark type: ${type}`);
        }
        
        setIsBookmarked(true);
        if (response?.bookmark?.id) {
          setBookmarkId(response.bookmark.id);
        }
        success = true;
        
        // After successful bookmark, re-check status to ensure UI is updated
        if (type === 'state_act') {
          console.log('🔄 Re-checking bookmark status after successful bookmark...');
          setTimeout(() => {
            checkBookmarkStatus();
          }, 500);
        }
      }
      
      if (success) {
        showNotificationMessage(message, 'success');
        if (onBookmarkChange) {
          onBookmarkChange(isBookmarked, item.id, bookmarkId);
        }
      }
      
    } catch (err) {
      const errorMessage = err.message || 'Failed to update bookmark';
      // Only set error if showText is true, otherwise just log it
      if (showText) {
        setError(errorMessage);
        showNotificationMessage(errorMessage, 'error');
      } else {
        // For icon-only mode, just log the error silently
        console.error('Bookmark error:', err);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getButtonStyles = () => {
    const baseStyles = "flex items-center justify-center transition-all duration-200 font-medium rounded-lg shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2";
    
    // For icon-only buttons, use square padding and no width constraint
    // Match share button sizing: p-1.5 sm:p-2
    if (!showText) {
      if (size === 'small') {
        return `${baseStyles} p-1.5 sm:p-2`;
      } else if (size === 'large') {
        return `${baseStyles} p-3 sm:p-4`;
      } else {
        return `${baseStyles} p-2 sm:p-2.5`;
      }
    }
    
    // For buttons with text, use horizontal padding and full width
    if (size === 'small') {
      return `${baseStyles} px-3 py-1.5 text-sm w-full`;
    } else if (size === 'large') {
      return `${baseStyles} px-6 py-3 text-lg w-full`;
    } else {
      return `${baseStyles} px-4 py-2 text-sm w-full`;
    }
  };

  const getIconSize = () => {
    // Match share button icon sizing: h-4 w-4 sm:h-5 sm:w-5
    if (size === 'small') return 'h-4 w-4 sm:h-5 sm:w-5';
    if (size === 'large') return 'h-6 w-6 sm:h-7 sm:w-7';
    return 'h-5 w-5 sm:h-6 sm:w-6';
  };

  const getButtonContent = () => {
    const iconStyle = { color: '#FFFFFF' };
    
    if (isCheckingStatus) {
      return (
        <>
          <Loader2 className={`${getIconSize()} ${showText ? 'mr-2' : ''} animate-spin`} style={iconStyle} />
          {showText && 'Checking...'}
        </>
      );
    }

    if (isLoading) {
      return (
        <>
          <Loader2 className={`${getIconSize()} ${showText ? 'mr-2' : ''} animate-spin`} style={iconStyle} />
          {showText && 'Processing...'}
        </>
      );
    }

    if (isBookmarked) {
      return (
        <>
          <BookmarkCheck className={`${getIconSize()} ${showText ? 'mr-2' : ''}`} style={iconStyle} />
          {showText && 'Bookmarked'}
        </>
      );
    }

    return (
      <>
        <Bookmark className={`${getIconSize()} ${showText ? 'mr-2' : ''}`} style={iconStyle} />
        {showText && 'Bookmark'}
      </>
    );
  };

  const getButtonColors = () => {
    // Always use the same blue background as share button
    return 'text-white';
  };

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => handleBookmarkToggle()}
        disabled={isLoading || isCheckingStatus}
        className={`${getButtonStyles()} ${getButtonColors()}`}
        style={{ 
          backgroundColor: '#1E65AD',
          color: '#FFFFFF'
        }}
        onMouseEnter={(e) => {
          if (!isLoading && !isCheckingStatus) {
            e.target.style.backgroundColor = '#1a5a9a';
          }
        }}
        onMouseLeave={(e) => {
          if (!isLoading && !isCheckingStatus) {
            e.target.style.backgroundColor = '#1E65AD';
          }
        }}
        title={isBookmarked ? 'Remove from bookmarks' : 'Add to bookmarks'}
        aria-label={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
      >
        {getButtonContent()}
      </button>

      {/* Folder Selector Popup */}
      {showFolderSelector && (
        <div
          ref={folderSelectorRef}
          className="absolute top-full right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[200px] max-w-[300px]"
          style={{ fontFamily: 'Roboto, sans-serif' }}
        >
          <div className="p-3 border-b border-gray-200 flex items-center justify-between">
            <h4 className="text-sm font-semibold text-gray-900">Select Folder</h4>
            <button
              onClick={() => setShowFolderSelector(false)}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>
          <div className="max-h-64 overflow-y-auto">
            <button
              onClick={() => handleBookmarkToggle(null)}
              className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 transition-colors"
            >
              <Bookmark className="w-4 h-4 text-gray-500" />
              <span className="text-gray-700">No Folder</span>
            </button>
            {folders.map((folder) => (
              <button
                key={folder.id}
                onClick={() => handleBookmarkToggle(folder.id)}
                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 transition-colors"
              >
                <Folder className="w-4 h-4 text-gray-500" />
                <span className="text-gray-700 flex-1">{folder.name}</span>
                <span className="text-xs text-gray-400">{folder.bookmark_count || 0}</span>
              </button>
            ))}
            
            {/* Create Folder Section */}
            {showCreateFolderInput ? (
              <div className="p-3 border-t border-gray-200 bg-gray-50">
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="text"
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && newFolderName.trim() && !isCreatingFolder) {
                        handleCreateFolder();
                      } else if (e.key === 'Escape') {
                        setShowCreateFolderInput(false);
                        setNewFolderName('');
                      }
                    }}
                    placeholder="Folder name"
                    className="flex-1 px-2 py-1.5 text-sm border border-blue-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={{ fontFamily: 'Roboto, sans-serif' }}
                    autoFocus
                    disabled={isCreatingFolder}
                  />
                  <button
                    onClick={handleCreateFolder}
                    disabled={isCreatingFolder || !newFolderName.trim()}
                    className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ fontFamily: 'Roboto, sans-serif' }}
                  >
                    {isCreatingFolder ? 'Creating...' : 'Create'}
                  </button>
                  <button
                    onClick={() => {
                      setShowCreateFolderInput(false);
                      setNewFolderName('');
                    }}
                    disabled={isCreatingFolder}
                    className="px-2 py-1.5 text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowCreateFolderInput(true)}
                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 transition-colors border-t border-gray-200 text-blue-600 font-medium"
              >
                <FolderPlus className="w-4 h-4" />
                <span>Create New Folder</span>
              </button>
            )}
          </div>
          {folders.length === 0 && !showCreateFolderInput && (
            <div className="p-3 text-center text-xs text-gray-500 border-t border-gray-200">
              No folders yet. Create one below.
            </div>
          )}
        </div>
      )}
      
      {/* Error Tooltip - Only show if showText is true */}
      {error && showText && (
        <div className="absolute top-full left-0 mt-1 p-2 bg-red-100 border border-red-300 rounded text-xs text-red-700 whitespace-nowrap z-10 shadow-lg">
          <div className="flex items-center">
            <XCircle className="h-3 w-3 mr-1" />
            {error}
          </div>
        </div>
      )}
      
      {/* Success Notification - Only show if showText is true */}
      {notification && notification.type === 'success' && showText && (
        <div className="absolute top-full left-0 mt-1 p-2 bg-green-100 border border-green-300 rounded text-xs text-green-700 whitespace-nowrap z-10 shadow-lg">
          <div className="flex items-center">
            <CheckCircle className="h-3 w-3 mr-1" />
            {notification.message}
          </div>
        </div>
      )}
      
      {/* Error Notification - Only show if showText is true */}
      {notification && notification.type === 'error' && showText && (
        <div className="absolute top-full left-0 mt-1 p-2 bg-red-100 border border-red-300 rounded text-xs text-red-700 whitespace-nowrap z-10 shadow-lg">
          <div className="flex items-center">
            <XCircle className="h-3 w-3 mr-1" />
            {notification.message}
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Compact Bookmark Icon Component
 * Just shows the bookmark icon without text - uses the same logic as BookmarkButton
 */
export const BookmarkIcon = ({ 
  item, 
  type, 
  actType = null, 
  mappingType = null, 
  onBookmarkChange = null,
  autoCheckStatus = true,
  showNotifications = false
}) => {
  return (
    <BookmarkButton
      item={item}
      type={type}
      actType={actType}
      mappingType={mappingType}
      size="small"
      showText={false}
      onBookmarkChange={onBookmarkChange}
      autoCheckStatus={autoCheckStatus}
      showNotifications={showNotifications}
    />
  );
};

export default BookmarkButton;
