import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/api';

// Prevent body scroll when modal is open
const useBodyScrollLock = (isLocked) => {
  useEffect(() => {
    if (isLocked) {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalStyle;
      };
    }
  }, [isLocked]);
};

// DigitalOcean Spaces base URL for avatars
const AVATAR_BASE_URL = 'https://storing.sfo3.digitaloceanspaces.com/profile';

// Default avatar ID
const DEFAULT_AVATAR_ID = 1011;

const UserIcon = ({ 
  size = 'md', 
  showSelector = true, 
  className = '',
  onClick = null 
}) => {
  const { user, login } = useAuth();
  const [showIconModal, setShowIconModal] = useState(false);
  const [selectedAvatarId, setSelectedAvatarId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [availableAvatars, setAvailableAvatars] = useState([]);
  const [loadingAvatars, setLoadingAvatars] = useState(false);

  // Lock body scroll when modal is open
  useBodyScrollLock(showIconModal);

  // Fetch available avatars from API
  const fetchAvatars = async () => {
    setLoadingAvatars(true);
    try {
      const response = await apiService.listAvatars();
      if (response && response.avatars && Array.isArray(response.avatars)) {
        setAvailableAvatars(response.avatars);
      } else {
        // Fallback: generate default range if API fails
        setAvailableAvatars(Array.from({ length: 15 }, (_, i) => 1000 + i));
      }
    } catch (error) {
      console.error('Error fetching avatars:', error);
      // Fallback: generate default range
      setAvailableAvatars(Array.from({ length: 15 }, (_, i) => 1000 + i));
    } finally {
      setLoadingAvatars(false);
    }
  };

  // Fetch available avatars when modal opens
  useEffect(() => {
    if (showIconModal && availableAvatars.length === 0) {
      fetchAvatars();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showIconModal]);

  // Close modal on ESC key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && showIconModal) {
        setShowIconModal(false);
      }
    };
    if (showIconModal) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [showIconModal]);

  // Get current user avatar URL or default
  const getUserAvatarUrl = () => {
    const avatarId = user?.avatar_id || DEFAULT_AVATAR_ID;
    return `${AVATAR_BASE_URL}/${avatarId}.jpeg`;
  };

  // Size classes
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32'
  };

  const handleIconClick = (e) => {
    if (onClick) {
      onClick(e);
      return;
    }
    if (showSelector) {
      setShowIconModal(true);
    }
  };

  const handleAvatarSelect = async (avatarId) => {
    // Validate avatar ID range
    if (avatarId < 1000 || avatarId > 1014) {
      alert('Invalid avatar ID. Please select a valid avatar.');
      return;
    }

    setSelectedAvatarId(avatarId);
    setLoading(true);
    
    try {
      // Call API to set avatar
      const response = await apiService.setAvatar(avatarId);
      
      if (response && response.avatar_id) {
        // Update user data with new avatar_id
        const updatedUser = {
          ...user,
          avatar_id: response.avatar_id
        };
        
        // Update localStorage
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        // Update context
        login(updatedUser);
        
        setShowIconModal(false);
        console.log('Avatar updated successfully');
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Error updating avatar:', error);
      setSelectedAvatarId(null);
      const errorMessage = error.response?.data?.detail || error.message || 'Failed to update avatar. Please try again.';
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div
        onClick={handleIconClick}
        className={`${sizeClasses[size]} rounded-full overflow-hidden cursor-pointer transition-transform hover:scale-105 ${className}`}
        style={{
          background: 'linear-gradient(to bottom right, rgba(255,255,255,0.3), rgba(255,255,255,0.1))'
        }}
      >
        <img
          src={getUserAvatarUrl()}
          alt="User Avatar"
          className="w-full h-full object-cover"
          onError={(e) => {
            // Fallback to default avatar if image fails to load
            e.target.src = `${AVATAR_BASE_URL}/${DEFAULT_AVATAR_ID}.jpeg`;
          }}
        />
      </div>

      {/* Icon Selection Modal - Using Portal */}
      {showIconModal && typeof document !== 'undefined' && createPortal(
        <div 
          className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4"
          onClick={() => setShowIconModal(false)}
          style={{ 
            position: 'fixed', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0,
            zIndex: 99999,
            isolation: 'isolate'
          }}
        >
          <div 
            className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
            style={{ 
              position: 'relative', 
              zIndex: 100000,
              isolation: 'isolate'
            }}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
                  Select Your Icon
                </h2>
                <button
                  onClick={() => setShowIconModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="Close"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {loadingAvatars ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    <p className="mt-2 text-gray-600">Loading avatars...</p>
                  </div>
                </div>
              ) : availableAvatars.length === 0 ? (
                <div className="text-center py-12 text-gray-600">
                  <p>No avatars available. Please try again later.</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                  {availableAvatars.map((avatarId) => {
                    const isSelected = selectedAvatarId === avatarId || 
                                     (!selectedAvatarId && user?.avatar_id === avatarId) || 
                                     (!selectedAvatarId && !user?.avatar_id && avatarId === DEFAULT_AVATAR_ID);
                    return (
                      <div
                        key={avatarId}
                        onClick={() => !loading && handleAvatarSelect(avatarId)}
                        className={`relative p-2 rounded-lg cursor-pointer transition-all ${
                          isSelected
                            ? 'ring-2 ring-blue-500 bg-blue-50'
                            : 'hover:bg-gray-100'
                        } ${loading ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}`}
                      >
                        <div className="aspect-square rounded-full overflow-hidden bg-gray-200 border-2 border-transparent hover:border-gray-300 transition-colors">
                          <img
                            src={`${AVATAR_BASE_URL}/${avatarId}.jpeg`}
                            alt={`Avatar ${avatarId}`}
                            className="w-full h-full object-cover"
                            draggable="false"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        </div>
                        {isSelected && (
                          <div className="absolute top-1 right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {loading && (
                <div className="mt-4 text-center text-gray-600">
                  <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                  <span className="ml-2">Updating icon...</span>
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default UserIcon;

