import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  Calendar, 
  Tag, 
  Star,
  Bookmark,
  FileText,
  Scale,
  Map,
  Clock,
  Users,
  Download,
  Share2
} from 'lucide-react';
import apiService from '../../services/api';

/**
 * Bookmark Analytics Component
 * Provides insights and statistics about user's bookmarks
 */
const BookmarkAnalytics = () => {
  const [analytics, setAnalytics] = useState({
    totalBookmarks: 0,
    bookmarksByType: {},
    bookmarksByMonth: [],
    recentActivity: [],
    topTags: [],
    favoriteStats: {},
    folderStats: {},
    courtStats: {},
    ministryStats: {},
    yearStats: {}
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('30'); // 7, 30, 90, 365 days

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Get all bookmarks for analytics
      const response = await apiService.getUserBookmarks({
        limit: 1000,
        include_analytics: true,
        time_range: timeRange
      });

      // Process analytics data
      const bookmarks = response.bookmarks || [];
      const processedAnalytics = processAnalyticsData(bookmarks);
      setAnalytics(processedAnalytics);
      
    } catch (err) {
      setError(err.message || 'Failed to load analytics');
      console.error('Error loading analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const processAnalyticsData = (bookmarks) => {
    const analytics = {
      totalBookmarks: bookmarks.length,
      bookmarksByType: {},
      bookmarksByMonth: [],
      recentActivity: [],
      topTags: [],
      favoriteStats: { total: 0, percentage: 0 },
      folderStats: {},
      courtStats: {},
      ministryStats: {},
      yearStats: {}
    };

    // Process each bookmark
    bookmarks.forEach(bookmark => {
      const item = bookmark.item || bookmark;
      
      // Count by type
      analytics.bookmarksByType[bookmark.type] = (analytics.bookmarksByType[bookmark.type] || 0) + 1;
      
      // Count favorites
      if (bookmark.is_favorite) {
        analytics.favoriteStats.total++;
      }
      
      // Count by folder
      if (bookmark.folder_id) {
        analytics.folderStats[bookmark.folder_id] = (analytics.folderStats[bookmark.folder_id] || 0) + 1;
      }
      
      // Count by court (for judgments)
      if (bookmark.type === 'judgement' && item.court) {
        analytics.courtStats[item.court] = (analytics.courtStats[item.court] || 0) + 1;
      }
      
      // Count by ministry (for acts)
      if ((bookmark.type === 'central_act' || bookmark.type === 'state_act') && item.ministry) {
        analytics.ministryStats[item.ministry] = (analytics.ministryStats[item.ministry] || 0) + 1;
      }
      
      // Count by year
      if (item.year) {
        analytics.yearStats[item.year] = (analytics.yearStats[item.year] || 0) + 1;
      }
      
      // Process tags
      if (bookmark.tags && Array.isArray(bookmark.tags)) {
        bookmark.tags.forEach(tag => {
          const existingTag = analytics.topTags.find(t => t.name === tag);
          if (existingTag) {
            existingTag.count++;
          } else {
            analytics.topTags.push({ name: tag, count: 1 });
          }
        });
      }
      
      // Recent activity
      analytics.recentActivity.push({
        id: bookmark.id,
        type: bookmark.type,
        title: item.title || 'Untitled',
        date: bookmark.created_at,
        action: 'bookmarked'
      });
    });

    // Calculate percentages
    analytics.favoriteStats.percentage = analytics.totalBookmarks > 0 
      ? Math.round((analytics.favoriteStats.total / analytics.totalBookmarks) * 100)
      : 0;

    // Sort top tags
    analytics.topTags.sort((a, b) => b.count - a.count);

    // Sort recent activity by date
    analytics.recentActivity.sort((a, b) => new Date(b.date) - new Date(a.date));

    return analytics;
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'judgement': return <Scale className="h-4 w-4" />;
      case 'central_act': return <FileText className="h-4 w-4" />;
      case 'state_act': return <FileText className="h-4 w-4" />;
      case 'bsa_iea_mapping': return <Map className="h-4 w-4" />;
      case 'bns_ipc_mapping': return <Map className="h-4 w-4" />;
      default: return <Bookmark className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'judgement': return 'bg-blue-100 text-blue-800';
      case 'central_act': return 'bg-green-100 text-green-800';
      case 'state_act': return 'bg-purple-100 text-purple-800';
      case 'bsa_iea_mapping': return 'bg-orange-100 text-orange-800';
      case 'bns_ipc_mapping': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <div className="text-center text-red-600">
          <p>Failed to load analytics: {error}</p>
          <button 
            onClick={loadAnalytics}
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Bookmark Analytics</h2>
          <p className="text-gray-600">Insights about your bookmarks</p>
        </div>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
          <option value="365">Last year</option>
        </select>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Bookmark className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Bookmarks</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.totalBookmarks}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Star className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Favorites</p>
              <p className="text-2xl font-bold text-gray-900">
                {analytics.favoriteStats.total} ({analytics.favoriteStats.percentage}%)
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Tag className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Unique Tags</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.topTags.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">This Period</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.recentActivity.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bookmarks by Type */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Bookmarks by Type</h3>
        <div className="space-y-3">
          {Object.entries(analytics.bookmarksByType).map(([type, count]) => (
            <div key={type} className="flex items-center justify-between">
              <div className="flex items-center">
                <div className={`p-2 rounded-lg mr-3 ${getTypeColor(type)}`}>
                  {getTypeIcon(type)}
                </div>
                <span className="font-medium text-gray-900 capitalize">
                  {type.replace('_', ' ')}
                </span>
              </div>
              <div className="flex items-center">
                <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${(count / analytics.totalBookmarks) * 100}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-gray-600 w-8 text-right">
                  {count}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Tags */}
      {analytics.topTags.length > 0 && (
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Most Used Tags</h3>
          <div className="flex flex-wrap gap-2">
            {analytics.topTags.slice(0, 10).map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
              >
                <Tag className="h-3 w-3 mr-1" />
                {tag.name} ({tag.count})
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Court Statistics (for judgments) */}
      {Object.keys(analytics.courtStats).length > 0 && (
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Courts</h3>
          <div className="space-y-2">
            {Object.entries(analytics.courtStats)
              .sort(([,a], [,b]) => b - a)
              .slice(0, 5)
              .map(([court, count]) => (
                <div key={court} className="flex items-center justify-between">
                  <span className="text-gray-700">{court}</span>
                  <span className="text-sm font-medium text-gray-600">{count} judgments</span>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Ministry Statistics (for acts) */}
      {Object.keys(analytics.ministryStats).length > 0 && (
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Ministries</h3>
          <div className="space-y-2">
            {Object.entries(analytics.ministryStats)
              .sort(([,a], [,b]) => b - a)
              .slice(0, 5)
              .map(([ministry, count]) => (
                <div key={ministry} className="flex items-center justify-between">
                  <span className="text-gray-700">{ministry}</span>
                  <span className="text-sm font-medium text-gray-600">{count} acts</span>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {analytics.recentActivity.slice(0, 10).map((activity) => (
            <div key={activity.id} className="flex items-center justify-between">
              <div className="flex items-center">
                <div className={`p-2 rounded-lg mr-3 ${getTypeColor(activity.type)}`}>
                  {getTypeIcon(activity.type)}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                  <p className="text-xs text-gray-500 capitalize">
                    {activity.type.replace('_', ' ')} • {new Date(activity.date).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <span className="text-xs text-gray-500">
                <Clock className="h-3 w-3 inline mr-1" />
                {new Date(activity.date).toLocaleTimeString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BookmarkAnalytics;
