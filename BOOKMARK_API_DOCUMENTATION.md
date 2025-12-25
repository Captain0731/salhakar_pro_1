# Bookmark API Documentation

## Overview

The Bookmark API allows users to save and manage bookmarks for legal documents including judgements, acts, and law mappings. Users can bookmark, view, and remove bookmarks across different types of legal content.

## Authentication

All bookmark endpoints require JWT authentication. Include the following header in all requests:

```
Authorization: Bearer <your_jwt_token>
```

## API Endpoints

### 1. Bookmark a Judgement

**Endpoint:** `POST /api/bookmarks/judgements/{judgement_id}`

**Description:** Bookmark a specific court judgement for the authenticated user.

**Parameters:**
- `judgement_id` (path, integer): The ID of the judgement to bookmark

**Headers:**
- `Authorization: Bearer <token>` (required)
- `Content-Type: application/json`

**Request Body:** None

**Success Response (200):**
```json
{
  "message": "Judgement bookmarked successfully"
}
```

**Error Responses:**
- `400 Bad Request`: Judgement already bookmarked
- `404 Not Found`: Judgement not found
- `401 Unauthorized`: Invalid or missing authentication token

---

### 2. Remove Judgement Bookmark

**Endpoint:** `DELETE /api/bookmarks/judgements/{judgement_id}`

**Description:** Remove a judgement bookmark for the authenticated user.

**Parameters:**
- `judgement_id` (path, integer): The ID of the judgement to unbookmark

**Headers:**
- `Authorization: Bearer <token>` (required)

**Request Body:** None

**Success Response (200):**
```json
{
  "message": "Bookmark removed successfully"
}
```

**Error Responses:**
- `404 Not Found`: Bookmark not found
- `401 Unauthorized`: Invalid or missing authentication token

---

### 3. Bookmark an Act

**Endpoint:** `POST /api/bookmarks/acts/{act_type}/{act_id}`

**Description:** Bookmark a central or state act for the authenticated user.

**Parameters:**
- `act_type` (path, string): Type of act - must be "central" or "state"
- `act_id` (path, integer): The ID of the act to bookmark

**Headers:**
- `Authorization: Bearer <token>` (required)
- `Content-Type: application/json`

**Request Body:** None

**Success Response (200):**
```json
{
  "message": "Act bookmarked successfully"
}
```

**Error Responses:**
- `400 Bad Request`: Invalid act_type or act already bookmarked
- `404 Not Found`: Act not found
- `401 Unauthorized`: Invalid or missing authentication token

**Examples:**
- `POST /api/bookmarks/acts/central/123` - Bookmark central act with ID 123
- `POST /api/bookmarks/acts/state/456` - Bookmark state act with ID 456

---

### 4. Remove Act Bookmark

**Endpoint:** `DELETE /api/bookmarks/acts/{act_type}/{act_id}`

**Description:** Remove an act bookmark for the authenticated user.

**Parameters:**
- `act_type` (path, string): Type of act - must be "central" or "state"
- `act_id` (path, integer): The ID of the act to unbookmark

**Headers:**
- `Authorization: Bearer <token>` (required)

**Request Body:** None

**Success Response (200):**
```json
{
  "message": "Bookmark removed successfully"
}
```

**Error Responses:**
- `404 Not Found`: Bookmark not found
- `401 Unauthorized`: Invalid or missing authentication token

---

### 5. Bookmark a Mapping

**Endpoint:** `POST /api/bookmarks/mappings/{mapping_type}/{mapping_id}`

**Description:** Bookmark a law mapping (BSA-IEA or BNS-IPC) for the authenticated user.

**Parameters:**
- `mapping_type` (path, string): Type of mapping - must be "bsa_iea" or "bns_ipc"
- `mapping_id` (path, integer): The ID of the mapping to bookmark

**Headers:**
- `Authorization: Bearer <token>` (required)
- `Content-Type: application/json`

**Request Body:** None

**Success Response (200):**
```json
{
  "message": "Mapping bookmarked successfully"
}
```

**Error Responses:**
- `400 Bad Request`: Invalid mapping_type or mapping already bookmarked
- `404 Not Found`: Mapping not found
- `401 Unauthorized`: Invalid or missing authentication token

**Examples:**
- `POST /api/bookmarks/mappings/bsa_iea/123` - Bookmark BSA-IEA mapping with ID 123
- `POST /api/bookmarks/mappings/bns_ipc/456` - Bookmark BNS-IPC mapping with ID 456

---

### 6. Remove Mapping Bookmark

**Endpoint:** `DELETE /api/bookmarks/mappings/{mapping_type}/{mapping_id}`

**Description:** Remove a mapping bookmark for the authenticated user.

**Parameters:**
- `mapping_type` (path, string): Type of mapping - must be "bsa_iea" or "bns_ipc"
- `mapping_id` (path, integer): The ID of the mapping to unbookmark

**Headers:**
- `Authorization: Bearer <token>` (required)

**Request Body:** None

**Success Response (200):**
```json
{
  "message": "Bookmark removed successfully"
}
```

**Error Responses:**
- `404 Not Found`: Bookmark not found
- `401 Unauthorized`: Invalid or missing authentication token

---

### 7. Get User Bookmarks

**Endpoint:** `GET /api/bookmarks`

**Description:** Retrieve the authenticated user's bookmarks with pagination support.

**Query Parameters:**
- `limit` (optional, integer): Number of bookmarks to return (default: 50, max: 100)
- `offset` (optional, integer): Number of bookmarks to skip (default: 0)

**Headers:**
- `Authorization: Bearer <token>` (required)

**Success Response (200):**
```json
{
  "bookmarks": [
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
      "created_at": "2024-01-20T10:30:00"
    },
    {
      "id": 124,
      "type": "central_act",
      "item": {
        "id": 789,
        "short_title": "Act Title",
        "long_title": "Full Act Title",
        "year": 2024,
        "ministry": "Ministry Name"
      },
      "created_at": "2024-01-19T15:45:00"
    }
  ],
  "pagination": {
    "limit": 50,
    "offset": 0,
    "has_more": false
  }
}
```

**Bookmark Types:**
- `judgement` - Court judgements/cases
- `central_act` - Central government acts
- `state_act` - State government acts
- `bsa_iea_mapping` - BSA to IEA law mappings
- `bns_ipc_mapping` - BNS to IPC law mappings

**Error Responses:**
- `401 Unauthorized`: Invalid or missing authentication token

## Frontend Integration Examples

### JavaScript/React Example

```javascript
// Bookmark a judgement
const bookmarkJudgement = async (judgementId) => {
  try {
    const response = await fetch(`/api/bookmarks/judgements/${judgementId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${userToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const result = await response.json();
      console.log(result.message); // "Judgement bookmarked successfully"
      // Update UI to show bookmarked state
    }
  } catch (error) {
    console.error('Bookmark failed:', error);
  }
};

// Get user's bookmarks
const loadUserBookmarks = async () => {
  try {
    const response = await fetch('/api/bookmarks?limit=20', {
      headers: {
        'Authorization': `Bearer ${userToken}`
      }
    });

    if (response.ok) {
      const data = await response.json();
      setBookmarks(data.bookmarks);
      setHasMore(data.pagination.has_more);
    }
  } catch (error) {
    console.error('Failed to load bookmarks:', error);
  }
};

// Remove bookmark
const removeBookmark = async (bookmarkType, itemId, typeSpecificId = null) => {
  let url;

  switch (bookmarkType) {
    case 'judgement':
      url = `/api/bookmarks/judgements/${itemId}`;
      break;
    case 'central_act':
      url = `/api/bookmarks/acts/central/${itemId}`;
      break;
    case 'state_act':
      url = `/api/bookmarks/acts/state/${itemId}`;
      break;
    case 'bsa_iea_mapping':
      url = `/api/bookmarks/mappings/bsa_iea/${itemId}`;
      break;
    case 'bns_ipc_mapping':
      url = `/api/bookmarks/mappings/bns_ipc/${itemId}`;
      break;
  }

  try {
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${userToken}`
      }
    });

    if (response.ok) {
      // Remove from local state
      setBookmarks(prev => prev.filter(b => b.item.id !== itemId));
    }
  } catch (error) {
    console.error('Remove bookmark failed:', error);
  }
};
```

### React Hook Example

```javascript
import { useState, useEffect } from 'react';

const useBookmarks = (userToken) => {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadBookmarks = async (limit = 50, offset = 0) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/bookmarks?limit=${limit}&offset=${offset}`, {
        headers: {
          'Authorization': `Bearer ${userToken}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setBookmarks(prev => offset === 0 ? data.bookmarks : [...prev, ...data.bookmarks]);
        setError(null);
      } else {
        setError('Failed to load bookmarks');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleBookmark = async (type, id, actType = null, mappingType = null) => {
    let url;
    let method;

    // Check if already bookmarked
    const existingBookmark = bookmarks.find(b =>
      b.type === type && b.item.id === id
    );

    if (existingBookmark) {
      // Remove bookmark
      method = 'DELETE';
      switch (type) {
        case 'judgement':
          url = `/api/bookmarks/judgements/${id}`;
          break;
        case 'central_act':
          url = `/api/bookmarks/acts/central/${id}`;
          break;
        case 'state_act':
          url = `/api/bookmarks/acts/state/${id}`;
          break;
        case 'bsa_iea_mapping':
          url = `/api/bookmarks/mappings/bsa_iea/${id}`;
          break;
        case 'bns_ipc_mapping':
          url = `/api/bookmarks/mappings/bns_ipc/${id}`;
          break;
      }
    } else {
      // Add bookmark
      method = 'POST';
      switch (type) {
        case 'judgement':
          url = `/api/bookmarks/judgements/${id}`;
          break;
        case 'central_act':
          url = `/api/bookmarks/acts/central/${id}`;
          break;
        case 'state_act':
          url = `/api/bookmarks/acts/state/${id}`;
          break;
        case 'bsa_iea_mapping':
          url = `/api/bookmarks/mappings/bsa_iea/${id}`;
          break;
        case 'bns_ipc_mapping':
          url = `/api/bookmarks/mappings/bns_ipc/${id}`;
          break;
      }
    }

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        if (method === 'POST') {
          // Reload bookmarks to get the new one
          await loadBookmarks();
        } else {
          // Remove from local state
          setBookmarks(prev => prev.filter(b => !(b.type === type && b.item.id === id)));
        }
      }
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    if (userToken) {
      loadBookmarks();
    }
  }, [userToken]);

  return {
    bookmarks,
    loading,
    error,
    loadBookmarks,
    toggleBookmark
  };
};

export default useBookmarks;
```

## Error Handling

All endpoints return appropriate HTTP status codes and error messages. Always check the response status and handle errors gracefully:

```javascript
const handleApiCall = async (url, options) => {
  try {
    const response = await fetch(url, options);

    if (response.ok) {
      return await response.json();
    } else {
      const error = await response.json();
      throw new Error(error.detail || 'API call failed');
    }
  } catch (error) {
    console.error('API Error:', error.message);
    throw error;
  }
};
```

## Rate Limiting

The API includes rate limiting to prevent abuse. If you exceed the rate limit, you'll receive a `429 Too Many Requests` response.

## Support

For any questions or issues with the Bookmark API, please contact the backend development team.
