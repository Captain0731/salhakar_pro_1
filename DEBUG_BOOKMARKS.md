# Bookmark Issues Debug Guide

## Issues Fixed

### 1. Title Extraction ✅
- **Problem**: Acts and mappings showing "Untitled"
- **Solution**: Created `getBookmarkTitle()` helper function that:
  - Uses `short_title` or `long_title` for acts
  - Uses `subject` or constructs from section numbers for mappings
  - Falls back appropriately for each type

### 2. State Acts Navigation ✅
- **Problem**: State acts not redirecting properly
- **Solution**: 
  - Added better error handling
  - Ensured `location` field is set to identify state acts
  - Added fallback logic

### 3. Debug Logging Added ✅
- Console logs now show:
  - Bookmark API response structure
  - Type distribution
  - State acts specifically

## Testing Instructions

1. **Open Browser Console** (F12)
2. **Navigate to Bookmarks page**
3. **Check Console Output**:
   - Look for `📋 Bookmark API Response`
   - Check `📋 Bookmark types distribution` to see if state_act appears
   - If state_act bookmarks exist, check `📋 Sample State Act`

4. **Test Title Display**:
   - Check if central acts show `short_title` or `long_title` instead of "Untitled"
   - Check if mappings show `subject` or section-based titles instead of "Untitled"

5. **Test State Acts**:
   - Click on a state act bookmark
   - Check console for `🔍 Navigating to state act` logs
   - Verify it navigates to `/act-details` page

## Expected API Response Structure

Based on API documentation, bookmarks should have this structure:

```json
{
  "bookmarks": [
    {
      "id": 123,
      "type": "state_act",
      "item": {
        "id": 456,
        "short_title": "Act Title",
        "long_title": "Full Act Title",
        "year": 2024,
        "ministry": "Ministry Name",
        "location": "state"  // This identifies it as state act
      },
      "created_at": "2024-01-20T10:30:00"
    }
  ]
}
```

## If State Acts Don't Appear

1. Check if API returns state_act bookmarks:
   - Look in console for type distribution
   - If state_act count is 0, the issue is with the API/backend

2. Check if filtering is working:
   - Try selecting "State Acts" from filter dropdown
   - Check if any state acts appear

3. Check API endpoint:
   - Verify `/api/bookmarks?type=state_act` returns results
   - Test with curl if needed:
   ```bash
   curl -H "Authorization: Bearer YOUR_TOKEN" \
     "https://unquestioned-gunnar-medially.ngrok-free.dev/api/bookmarks?type=state_act"
   ```

## Next Steps

If issues persist:
1. Share console logs showing the API response
2. Test with curl to verify API behavior
3. Check backend API implementation for state_act bookmarks

