import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/api';

export default function SessionManagement() {
  const { sessions, loadSessions, terminateSession, terminateAllSessions } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  const handleTerminateSession = async (sessionId) => {
    try {
      setLoading(true);
      setError("");
      await terminateSession(sessionId);
      setMessage("Session terminated successfully");
    } catch (err) {
      setError(err.message || "Failed to terminate session");
    } finally {
      setLoading(false);
    }
  };

  const handleTerminateAllSessions = async () => {
    if (!window.confirm("Are you sure you want to terminate all sessions? This will log you out from all devices.")) {
      return;
    }

    try {
      setLoading(true);
      setError("");
      await terminateAllSessions();
      setMessage("All sessions terminated successfully");
    } catch (err) {
      setError(err.message || "Failed to terminate all sessions");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getDeviceInfo = (userAgent) => {
    if (!userAgent) return "Unknown";
    
    if (userAgent.includes('Mobile')) return "Mobile";
    if (userAgent.includes('Tablet')) return "Tablet";
    if (userAgent.includes('Windows')) return "Windows Desktop";
    if (userAgent.includes('Mac')) return "Mac Desktop";
    if (userAgent.includes('Linux')) return "Linux Desktop";
    return "Desktop";
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Active Sessions</h3>
          <p className="text-sm text-gray-600">Manage your active sessions across devices</p>
        </div>
        <button
          onClick={handleTerminateAllSessions}
          disabled={loading || sessions.length <= 1}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Terminating..." : "Terminate All"}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {message && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-600 text-sm">{message}</p>
        </div>
      )}

      <div className="space-y-4">
        {sessions.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-2">No active sessions found</p>
            <p className="text-sm text-gray-400">Sessions will appear here when you log in from different devices</p>
          </div>
        ) : (
          sessions.map((session) => (
            <div
              key={session.session_id}
              className={`p-4 rounded-lg border ${
                session.is_active 
                  ? 'border-green-200 bg-green-50' 
                  : 'border-gray-200 bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      session.is_active ? 'bg-green-500' : 'bg-gray-400'
                    }`}></div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {getDeviceInfo(session.user_agent)}
                      </p>
                      <p className="text-sm text-gray-600">
                        {session.ip_address} • {session.city || 'Unknown Location'}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    <p>Login: {formatDate(session.login_time)}</p>
                    {session.logout_time && (
                      <p>Logout: {formatDate(session.logout_time)}</p>
                    )}
                  </div>
                </div>
                {session.is_active && (
                  <button
                    onClick={() => handleTerminateSession(session.session_id)}
                    disabled={loading}
                    className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 disabled:opacity-50"
                  >
                    Terminate
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">Security Tips</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Review your active sessions regularly</li>
          <li>• Terminate sessions from unknown devices</li>
          <li>• Use strong, unique passwords</li>
          <li>• Enable two-factor authentication when available</li>
        </ul>
      </div>
    </div>
  );
}
