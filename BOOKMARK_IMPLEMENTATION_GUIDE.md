# 📚 Bookmark System Implementation Guide

This guide explains how to implement and use the bookmark system in your legal platform, following the documented API structure.

## 🚀 Quick Start

### 1. Import the Hook
```javascript
import useBookmarks from '../hooks/useBookmarks';
```

### 2. Use in Your Component
```javascript
const MyComponent = () => {
  const userToken = localStorage.getItem('token');
  const {
    bookmarks,
    loading,
    error,
    toggleBookmark,
    isBookmarked
  } = useBookmarks(userToken);

  return (
    <div>
      {loading && <div>Loading...</div>}
      {error && <div>Error: {error}</div>}
      {bookmarks.map(bookmark => (
        <div key={bookmark.id}>
          <h3>{bookmark.item.title}</h3>
          <button onClick={() => toggleBookmark('judgement', bookmark.item.id)}>
            {isBookmarked('judgement', bookmark.item.id) ? 'Remove' : 'Add'} Bookmark
          </button>
        </div>
      ))}
    </div>
  );
};
```

## 🔧 API Methods Available

### Core Methods
- `loadBookmarks(offset, limit)` - Load bookmarks with pagination
- `toggleBookmark(type, id, actType, mappingType)` - Toggle bookmark status
- `isBookmarked(type, id)` - Check if item is bookmarked
- `searchBookmarks(query)` - Search through bookmarks

### Specific Bookmark Methods
- `bookmarkJudgement(judgementId)` - Bookmark a judgement
- `removeJudgementBookmark(judgementId)` - Remove judgement bookmark
- `bookmarkAct(actType, actId)` - Bookmark an act (central/state)
- `removeActBookmark(actType, actId)` - Remove act bookmark
- `bookmarkMapping(mappingType, mappingId)` - Bookmark a mapping
- `removeMappingBookmark(mappingType, mappingId)` - Remove mapping bookmark

### Utility Methods
- `getBookmarksByType(type)` - Get bookmarks by type
- `loadMoreBookmarks()` - Load next page of bookmarks
- `clearError()` - Clear error state

## 📋 Supported Bookmark Types

| Type | Description | Example |
|------|-------------|---------|
| `judgement` | Court judgements/cases | Supreme Court, High Court decisions |
| `central_act` | Central government acts | IPC, BNS, etc. |
| `state_act` | State government acts | State-specific legislation |
| `bsa_iea_mapping` | BSA to IEA mappings | Bharatiya Sakshya Adhiniyam mappings |
| `bns_ipc_mapping` | BNS to IPC mappings | Bharatiya Nyaya Sanhita mappings |

## 🎯 Usage Examples

### Bookmark a Judgement
```javascript
const handleBookmarkJudgement = async (judgementId) => {
  const success = await toggleBookmark('judgement', judgementId);
  if (success) {
    console.log('Judgement bookmarked successfully');
  }
};
```

### Bookmark a Central Act
```javascript
const handleBookmarkCentralAct = async (actId) => {
  const success = await toggleBookmark('central_act', actId);
  if (success) {
    console.log('Central act bookmarked successfully');
  }
};
```

### Bookmark a Mapping
```javascript
const handleBookmarkMapping = async (mappingId) => {
  const success = await toggleBookmark('bsa_iea_mapping', mappingId);
  if (success) {
    console.log('BSA-IEA mapping bookmarked successfully');
  }
};
```

### Check if Bookmarked
```javascript
const isItemBookmarked = isBookmarked('judgement', judgementId);
```

### Search Bookmarks
```javascript
const searchResults = searchBookmarks('contract law');
```

## 🔄 Data Structure

### Bookmark Object
```javascript
{
  "id": 123,
  "type": "judgement",
  "item": {
    "id": 456,
    "title": "Case Title",
    "judge": "Justice Name",
    "decision_date": "2024-01-15",
    "court_name": "High Court",
    "year": 2024
  },
  "created_at": "2024-01-20T10:30:00",
  "tags": ["Contract Law", "Supreme Court", "2023"],
  "is_favorite": true
}
```

### Pagination Object
```javascript
{
  "limit": 50,
  "offset": 0,
  "hasMore": false
}
```

## 🛡️ Error Handling

The hook provides comprehensive error handling:

```javascript
const { error, clearError } = useBookmarks(userToken);

// Display error
{error && (
  <div className="error-message">
    {error}
    <button onClick={clearError}>Dismiss</button>
  </div>
)}
```

## ⏳ Loading States

Handle loading states for better UX:

```javascript
const { loading, bookmarks } = useBookmarks(userToken);

if (loading && bookmarks.length === 0) {
  return <div>Loading bookmarks...</div>;
}

if (loading && bookmarks.length > 0) {
  return <div>Loading more bookmarks...</div>;
}
```

## 🔍 Search and Filter

### Search Implementation
```javascript
const [searchQuery, setSearchQuery] = useState('');
const { searchBookmarks } = useBookmarks(userToken);

const filteredBookmarks = searchQuery 
  ? searchBookmarks(searchQuery)
  : bookmarks;
```

### Filter by Type
```javascript
const [filterType, setFilterType] = useState('all');
const { getBookmarksByType } = useBookmarks(userToken);

const filteredBookmarks = filterType === 'all'
  ? bookmarks
  : getBookmarksByType(filterType);
```

## 📱 Responsive Design

The hook works seamlessly with responsive components:

```javascript
const BookmarkGrid = () => {
  const { bookmarks, loading } = useBookmarks(userToken);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {bookmarks.map(bookmark => (
        <BookmarkCard key={bookmark.id} bookmark={bookmark} />
      ))}
    </div>
  );
};
```

## 🚀 Advanced Features

### Pagination
```javascript
const { pagination, loadMoreBookmarks } = useBookmarks(userToken);

{pagination.hasMore && (
  <button onClick={loadMoreBookmarks}>
    Load More ({pagination.offset + pagination.limit} of {pagination.total})
  </button>
)}
```

### Bulk Operations
```javascript
const handleBulkBookmark = async (items, type) => {
  const promises = items.map(item => toggleBookmark(type, item.id));
  await Promise.all(promises);
};
```

## 🔧 Customization

### Custom Error Messages
```javascript
const handleBookmarkError = (error) => {
  switch (error.message) {
    case 'Judgement already bookmarked':
      return 'This judgement is already in your bookmarks';
    case 'Act not found':
      return 'The requested act could not be found';
    default:
      return 'An error occurred while bookmarking';
  }
};
```

### Custom Loading States
```javascript
const CustomLoader = () => (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    <span className="ml-2 text-gray-600">Loading bookmarks...</span>
  </div>
);
```

## 📊 Analytics Integration

Track bookmark usage:

```javascript
const trackBookmarkAction = (action, type, id) => {
  analytics.track('bookmark_action', {
    action,
    type,
    item_id: id,
    timestamp: new Date().toISOString()
  });
};

const handleBookmark = async (type, id) => {
  const success = await toggleBookmark(type, id);
  if (success) {
    trackBookmarkAction('bookmark_added', type, id);
  }
};
```

## 🧪 Testing

### Unit Tests
```javascript
import { renderHook, act } from '@testing-library/react-hooks';
import useBookmarks from '../hooks/useBookmarks';

test('should load bookmarks on mount', async () => {
  const { result } = renderHook(() => useBookmarks('test-token'));
  
  await act(async () => {
    await result.current.loadBookmarks();
  });
  
  expect(result.current.bookmarks).toBeDefined();
  expect(result.current.loading).toBe(false);
});
```

### Integration Tests
```javascript
test('should bookmark and unbookmark items', async () => {
  const { result } = renderHook(() => useBookmarks('test-token'));
  
  // Bookmark
  await act(async () => {
    await result.current.toggleBookmark('judgement', 123);
  });
  
  expect(result.current.isBookmarked('judgement', 123)).toBe(true);
  
  // Unbookmark
  await act(async () => {
    await result.current.toggleBookmark('judgement', 123);
  });
  
  expect(result.current.isBookmarked('judgement', 123)).toBe(false);
});
```

## 🚨 Common Issues

### Issue: Bookmarks not loading
**Solution:** Check if userToken is valid and user is authenticated

### Issue: Bookmark toggle not working
**Solution:** Verify the bookmark type and ID are correct

### Issue: Search not working
**Solution:** Ensure search query is not empty and properly formatted

### Issue: Pagination not working
**Solution:** Check if pagination.hasMore is true and loadMoreBookmarks is called

## 📞 Support

For issues or questions:
- Check the API documentation
- Review error messages in console
- Test with different bookmark types
- Verify authentication status

## 🔄 Migration from Old System

If migrating from the old bookmark system:

1. Replace `addBookmark()` with specific bookmark methods
2. Update bookmark type names to match new API
3. Update data structure handling
4. Test all bookmark operations

## 📈 Performance Tips

1. **Use pagination** for large bookmark collections
2. **Implement search debouncing** for better UX
3. **Cache bookmark status** for frequently accessed items
4. **Use loading states** to provide user feedback
5. **Handle errors gracefully** with user-friendly messages

---

*This implementation follows the Bookmark API Documentation and provides a robust, user-friendly bookmark system for your legal platform.*
