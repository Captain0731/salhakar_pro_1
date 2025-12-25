import React, { useState } from 'react';
import { 
  Download, 
  Upload, 
  FileText, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Loader2,
  Share2,
  Copy,
  ExternalLink
} from 'lucide-react';
import apiService from '../../services/api';

/**
 * Bookmark Import/Export Component
 * Handles importing and exporting bookmarks
 */
const BookmarkImportExport = ({ onImportComplete }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [exportFormat, setExportFormat] = useState('json');
  const [importFile, setImportFile] = useState(null);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const exportBookmarks = async () => {
    setIsExporting(true);
    setError(null);
    setMessage(null);

    try {
      // Get all bookmarks
      const response = await apiService.getUserBookmarks({ limit: 1000 });
      const bookmarks = response.bookmarks || [];

      if (bookmarks.length === 0) {
        setMessage({ type: 'warning', text: 'No bookmarks to export' });
        return;
      }

      let exportData;
      let filename;
      let mimeType;

      switch (exportFormat) {
        case 'json':
          exportData = JSON.stringify({
            version: '1.0',
            exportDate: new Date().toISOString(),
            bookmarks: bookmarks.map(bookmark => ({
              id: bookmark.id,
              type: bookmark.type,
              title: bookmark.item?.title || 'Untitled',
              description: bookmark.item?.description || '',
              url: bookmark.item?.url || '',
              tags: bookmark.tags || [],
              is_favorite: bookmark.is_favorite || false,
              folder_id: bookmark.folder_id,
              created_at: bookmark.created_at,
              item: bookmark.item
            }))
          }, null, 2);
          filename = `bookmarks-${new Date().toISOString().split('T')[0]}.json`;
          mimeType = 'application/json';
          break;

        case 'csv':
          const csvHeaders = 'Title,Type,Description,URL,Tags,Favorite,Folder,Created Date\n';
          const csvRows = bookmarks.map(bookmark => {
            const item = bookmark.item || bookmark;
            return [
              `"${(item.title || 'Untitled').replace(/"/g, '""')}"`,
              bookmark.type,
              `"${(item.description || '').replace(/"/g, '""')}"`,
              `"${(item.url || '').replace(/"/g, '""')}"`,
              `"${(bookmark.tags || []).join(', ')}"`,
              bookmark.is_favorite ? 'Yes' : 'No',
              bookmark.folder_id || '',
              new Date(bookmark.created_at).toLocaleDateString()
            ].join(',');
          }).join('\n');
          exportData = csvHeaders + csvRows;
          filename = `bookmarks-${new Date().toISOString().split('T')[0]}.csv`;
          mimeType = 'text/csv';
          break;

        case 'html':
          const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <title>My Bookmarks Export</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .bookmark { border: 1px solid #ddd; margin: 10px 0; padding: 15px; border-radius: 5px; }
        .title { font-size: 18px; font-weight: bold; color: #333; }
        .type { background: #f0f0f0; padding: 2px 8px; border-radius: 3px; font-size: 12px; }
        .description { color: #666; margin: 5px 0; }
        .tags { color: #0066cc; font-size: 12px; }
        .favorite { color: #ff6b35; }
    </style>
</head>
<body>
    <h1>My Bookmarks Export</h1>
    <p>Exported on ${new Date().toLocaleDateString()}</p>
    ${bookmarks.map(bookmark => {
      const item = bookmark.item || bookmark;
      return `
        <div class="bookmark">
          <div class="title">${item.title || 'Untitled'}</div>
          <div class="type">${bookmark.type}</div>
          <div class="description">${item.description || ''}</div>
          ${item.url ? `<div><a href="${item.url}" target="_blank">${item.url}</a></div>` : ''}
          ${bookmark.tags && bookmark.tags.length > 0 ? `<div class="tags">Tags: ${bookmark.tags.join(', ')}</div>` : ''}
          ${bookmark.is_favorite ? '<div class="favorite">★ Favorite</div>' : ''}
          <div>Created: ${new Date(bookmark.created_at).toLocaleDateString()}</div>
        </div>
      `;
    }).join('')}
</body>
</html>`;
          exportData = htmlContent;
          filename = `bookmarks-${new Date().toISOString().split('T')[0]}.html`;
          mimeType = 'text/html';
          break;

        default:
          throw new Error('Unsupported export format');
      }

      // Create and download file
      const blob = new Blob([exportData], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setMessage({ 
        type: 'success', 
        text: `Successfully exported ${bookmarks.length} bookmarks as ${exportFormat.toUpperCase()}` 
      });

    } catch (err) {
      setError(err.message || 'Failed to export bookmarks');
      console.error('Export error:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const importBookmarks = async () => {
    if (!importFile) {
      setError('Please select a file to import');
      return;
    }

    setIsImporting(true);
    setError(null);
    setMessage(null);

    try {
      const fileContent = await readFileContent(importFile);
      let bookmarks;

      // Parse file based on extension
      if (importFile.name.endsWith('.json')) {
        const data = JSON.parse(fileContent);
        bookmarks = data.bookmarks || data;
      } else if (importFile.name.endsWith('.csv')) {
        bookmarks = parseCSV(fileContent);
      } else {
        throw new Error('Unsupported file format. Please use JSON or CSV.');
      }

      if (!Array.isArray(bookmarks)) {
        throw new Error('Invalid file format. Expected an array of bookmarks.');
      }

      // Import bookmarks
      let successCount = 0;
      let errorCount = 0;

      for (const bookmark of bookmarks) {
        try {
          // Validate bookmark data
          if (!bookmark.type || !bookmark.title) {
            console.warn('Skipping invalid bookmark:', bookmark);
            errorCount++;
            continue;
          }

          // Add bookmark using appropriate API method
          switch (bookmark.type) {
            case 'judgement':
              await apiService.bookmarkJudgement(bookmark.item?.id || bookmark.id);
              break;
            case 'central_act':
              await apiService.bookmarkAct('central', bookmark.item?.id || bookmark.id);
              break;
            case 'state_act':
              await apiService.bookmarkAct('state', bookmark.item?.id || bookmark.id);
              break;
            case 'bsa_iea_mapping':
              await apiService.bookmarkMapping('bsa_iea', bookmark.item?.id || bookmark.id);
              break;
            case 'bns_ipc_mapping':
              await apiService.bookmarkMapping('bns_ipc', bookmark.item?.id || bookmark.id);
              break;
            default:
              // Use generic bookmark method for unknown types
              await apiService.addBookmark({
                type: bookmark.type,
                title: bookmark.title,
                description: bookmark.description,
                url: bookmark.url,
                tags: bookmark.tags,
                is_favorite: bookmark.is_favorite
              });
          }
          successCount++;
        } catch (err) {
          console.error('Error importing bookmark:', bookmark, err);
          errorCount++;
        }
      }

      if (successCount > 0) {
        setMessage({ 
          type: 'success', 
          text: `Successfully imported ${successCount} bookmarks${errorCount > 0 ? ` (${errorCount} failed)` : ''}` 
        });
        if (onImportComplete) {
          onImportComplete();
        }
      } else {
        setError('No bookmarks were successfully imported');
      }

    } catch (err) {
      setError(err.message || 'Failed to import bookmarks');
      console.error('Import error:', err);
    } finally {
      setIsImporting(false);
      setImportFile(null);
    }
  };

  const readFileContent = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = (e) => reject(e);
      reader.readAsText(file);
    });
  };

  const parseCSV = (csvContent) => {
    const lines = csvContent.split('\n');
    const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
    const bookmarks = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const values = line.split(',').map(v => v.replace(/"/g, '').trim());
      const bookmark = {};

      headers.forEach((header, index) => {
        const value = values[index] || '';
        switch (header.toLowerCase()) {
          case 'title':
            bookmark.title = value;
            break;
          case 'type':
            bookmark.type = value;
            break;
          case 'description':
            bookmark.description = value;
            break;
          case 'url':
            bookmark.url = value;
            break;
          case 'tags':
            bookmark.tags = value ? value.split(',').map(t => t.trim()) : [];
            break;
          case 'favorite':
            bookmark.is_favorite = value.toLowerCase() === 'yes';
            break;
          case 'folder':
            bookmark.folder_id = value;
            break;
          case 'created date':
            bookmark.created_at = value;
            break;
        }
      });

      if (bookmark.title && bookmark.type) {
        bookmarks.push(bookmark);
      }
    }

    return bookmarks;
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImportFile(file);
      setError(null);
      setMessage(null);
    }
  };

  const shareBookmarks = async () => {
    try {
      const response = await apiService.getUserBookmarks({ limit: 100 });
      const bookmarks = response.bookmarks || [];
      
      const shareData = {
        title: 'My Legal Bookmarks',
        text: `Check out my ${bookmarks.length} legal bookmarks!`,
        url: window.location.href
      };

      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(shareData.url);
        setMessage({ type: 'success', text: 'Bookmark page URL copied to clipboard!' });
      }
    } catch (err) {
      setError('Failed to share bookmarks');
      console.error('Share error:', err);
    }
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Import & Export Bookmarks</h3>

      {/* Export Section */}
      <div className="mb-8">
        <h4 className="text-md font-medium text-gray-800 mb-4">Export Bookmarks</h4>
        <div className="flex items-center space-x-4">
          <select
            value={exportFormat}
            onChange={(e) => setExportFormat(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="json">JSON</option>
            <option value="csv">CSV</option>
            <option value="html">HTML</option>
          </select>
          
          <button
            onClick={exportBookmarks}
            disabled={isExporting}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {isExporting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            {isExporting ? 'Exporting...' : 'Export'}
          </button>
        </div>
        <p className="text-sm text-gray-600 mt-2">
          Export your bookmarks in {exportFormat.toUpperCase()} format for backup or sharing.
        </p>
      </div>

      {/* Import Section */}
      <div className="mb-8">
        <h4 className="text-md font-medium text-gray-800 mb-4">Import Bookmarks</h4>
        <div className="flex items-center space-x-4">
          <input
            type="file"
            accept=".json,.csv"
            onChange={handleFileChange}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          
          <button
            onClick={importBookmarks}
            disabled={isImporting || !importFile}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            {isImporting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Upload className="h-4 w-4 mr-2" />
            )}
            {isImporting ? 'Importing...' : 'Import'}
          </button>
        </div>
        <p className="text-sm text-gray-600 mt-2">
          Import bookmarks from JSON or CSV files. Supported formats: JSON, CSV.
        </p>
      </div>

      {/* Share Section */}
      <div className="mb-6">
        <h4 className="text-md font-medium text-gray-800 mb-4">Share Bookmarks</h4>
        <button
          onClick={shareBookmarks}
          className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          <Share2 className="h-4 w-4 mr-2" />
          Share Bookmark Page
        </button>
        <p className="text-sm text-gray-600 mt-2">
          Share your bookmark page with others or copy the link to clipboard.
        </p>
      </div>

      {/* Messages */}
      {message && (
        <div className={`p-4 rounded-lg mb-4 ${
          message.type === 'success' ? 'bg-green-100 text-green-800' : 
          message.type === 'warning' ? 'bg-yellow-100 text-yellow-800' : 
          'bg-red-100 text-red-800'
        }`}>
          <div className="flex items-center">
            {message.type === 'success' ? (
              <CheckCircle className="h-5 w-5 mr-2" />
            ) : message.type === 'warning' ? (
              <AlertCircle className="h-5 w-5 mr-2" />
            ) : (
              <XCircle className="h-5 w-5 mr-2" />
            )}
            {message.text}
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-lg mb-4 bg-red-100 text-red-800">
          <div className="flex items-center">
            <XCircle className="h-5 w-5 mr-2" />
            {error}
          </div>
        </div>
      )}
    </div>
  );
};

export default BookmarkImportExport;
