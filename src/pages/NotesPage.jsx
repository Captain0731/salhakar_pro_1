import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  ArrowLeft,
  Edit,
  Save,
  Trash2,
  Tag,
  Calendar,
  Clock,
  Folder,
  MoreVertical,
  Share2,
  Download,
  X
} from 'lucide-react';

const NotesPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [isEditing, setIsEditing] = useState(false);
  const [note, setNote] = useState(null);
  const [editedTitle, setEditedTitle] = useState('');
  const [editedContent, setEditedContent] = useState('');

  useEffect(() => {
    // Get note from location state or fetch from API
    if (location.state?.note) {
      setNote(location.state.note);
      setEditedTitle(location.state.note.title);
      setEditedContent(location.state.note.content);
    } else {
      // In production, fetch note by ID from API
      // For now, use mock data
      const mockNote = {
        id: parseInt(id),
        title: 'Contract Law Case Analysis',
        content: `## Introduction

This case involves a dispute regarding contract enforcement under the Indian Contract Act, 1872.

## Key Points

1. **Section 10** - Essential elements of a valid contract
2. **Section 23** - Consideration and object of agreement
3. **Section 56** - Agreement to do impossible act

## Analysis

The court held that the contract was valid as all essential elements were present:
- Offer and acceptance
- Lawful consideration
- Capacity of parties
- Free consent
- Lawful object

## References

- Indian Contract Act, 1872
- Supreme Court Judgment XYZ v. ABC (2023)`,
        folderId: 1,
        createdAt: '2024-01-15',
        updatedAt: '2024-01-20',
        tags: ['Contract Law', 'Supreme Court', 'Legal Analysis']
      };
      setNote(mockNote);
      setEditedTitle(mockNote.title);
      setEditedContent(mockNote.content);
    }
  }, [id, location.state]);

  const handleSave = () => {
    // In production, save to API
    setNote({
      ...note,
      title: editedTitle,
      content: editedContent,
      updatedAt: new Date().toISOString().split('T')[0]
    });
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      // In production, delete from API
      navigate('/dashboard', { state: { activeTab: 'notes' } });
    }
  };

  if (!note) {
    return (
      <div className="flex items-center justify-center h-screen" style={{ backgroundColor: '#F9FAFC' }}>
        <div className="text-center">
          <p className="text-gray-500" style={{ fontFamily: 'Roboto, sans-serif' }}>Loading note...</p>
        </div>
      </div>
    );
  }

  const folder = location.state?.folders?.find(f => f.id === note.folderId);

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F9FAFC' }}>
      {/* Header */}
      <div className="bg-gradient-to-r from-white to-gray-50 border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard', { state: { activeTab: 'notes' } })}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                style={{ color: '#1E65AD' }}
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  {folder && (
                    <span
                      className="px-3 py-1 rounded-lg text-sm font-medium flex items-center space-x-1"
                      style={{
                        backgroundColor: `${folder.color}20`,
                        color: folder.color,
                        fontFamily: 'Roboto, sans-serif'
                      }}
                    >
                      <Folder className="h-4 w-4" />
                      <span>{folder.name}</span>
                    </span>
                  )}
                </div>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
                    className="text-2xl font-bold border-2 rounded-lg px-3 py-2 focus:outline-none focus:ring-2"
                    style={{
                      fontFamily: "'Bricolage Grotesque', sans-serif",
                      color: '#1E65AD',
                      borderColor: '#1E65AD'
                    }}
                    autoFocus
                  />
                ) : (
                  <h1 className="text-2xl font-bold" style={{ color: '#1E65AD', fontFamily: "'Bricolage Grotesque', sans-serif" }}>
                    {note.title}
                  </h1>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {isEditing ? (
                <>
                  <button
                    onClick={() => {
                      setEditedTitle(note.title);
                      setEditedContent(note.content);
                      setIsEditing(false);
                    }}
                    className="px-4 py-2 rounded-lg font-semibold transition-all duration-200 hover:shadow-lg flex items-center space-x-2 border border-gray-300"
                    style={{ fontFamily: 'Roboto, sans-serif' }}
                  >
                    <X className="h-4 w-4" />
                    <span>Cancel</span>
                  </button>
                  <button
                    onClick={handleSave}
                    className="px-4 py-2 rounded-lg font-semibold transition-all duration-200 hover:shadow-lg flex items-center space-x-2 text-white"
                    style={{ 
                      backgroundColor: '#1E65AD',
                      fontFamily: 'Roboto, sans-serif'
                    }}
                  >
                    <Save className="h-4 w-4" />
                    <span>Save</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    style={{ color: '#1E65AD' }}
                  >
                    <Edit className="h-5 w-5" />
                  </button>
                  <button
                    onClick={handleDelete}
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    style={{ color: '#DC2626' }}
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                  <button
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    style={{ color: '#1E65AD' }}
                  >
                    <MoreVertical className="h-5 w-5" />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Meta Information */}
          <div className="flex items-center space-x-6 mt-4 text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
            <div className="flex items-center space-x-1">
              <Calendar className="h-4 w-4" />
              <span>Created: {new Date(note.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="h-4 w-4" />
              <span>Updated: {new Date(note.updatedAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
          {isEditing ? (
            <textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              className="w-full min-h-[500px] border-2 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 resize-none"
              style={{
                fontFamily: 'Roboto, sans-serif',
                borderColor: '#1E65AD',
                fontSize: '16px',
                lineHeight: '1.6'
              }}
            />
          ) : (
            <div 
              className="prose max-w-none"
              style={{ 
                fontFamily: 'Roboto, sans-serif',
                color: '#374151',
                fontSize: '16px',
                lineHeight: '1.8'
              }}
            >
              <pre style={{ 
                whiteSpace: 'pre-wrap',
                wordWrap: 'break-word',
                fontFamily: 'Roboto, sans-serif'
              }}>
                {note.content}
              </pre>
            </div>
          )}

          {/* Tags */}
          {note.tags && note.tags.length > 0 && (
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex items-center space-x-2 mb-3">
                <Tag className="h-5 w-5" style={{ color: '#CF9B63' }} />
                <h3 className="font-semibold text-gray-900" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  Tags
                </h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {note.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 rounded-lg text-sm font-medium"
                    style={{
                      backgroundColor: '#CF9B6320',
                      color: '#CF9B63',
                      fontFamily: 'Roboto, sans-serif'
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotesPage;

