# Notes Feature - Complete Working System Documentation

## Table of Contents
1. [Overview](#overview)
2. [Notes Feature Locations](#notes-feature-locations)
3. [Frontend Components](#frontend-components)
4. [User Interface & Interactions](#user-interface--interactions)
5. [Data Models](#data-models)
6. [Backend API Endpoints](#backend-api-endpoints)
7. [Integration Guide](#integration-guide)
8. [Implementation Examples](#implementation-examples)

---

## Overview

The Notes feature allows authenticated users to create, save, and manage notes associated with:
- **Judgments** (Supreme Court & High Court)
- **Acts** (Central Acts & State Acts)
- **Law Mappings** (IPC-BNS, IEA-BSA, BNSS-CrPC)

Notes can be created from multiple locations in the application and are managed through the Dashboard Notes section.

### Key Features
- ✅ Create notes from PDF viewer (ViewPDF.jsx)
- ✅ Create notes from Act details page (ActDetails.jsx)
- ✅ Create notes from Mapping details page (MappingDetails.jsx)
- ✅ Manage all notes from Dashboard Notes section
- ✅ Draggable and resizable notes popup
- ✅ Auto-populated initial content based on context
- ✅ Markdown support for note content
- ✅ Link notes to specific documents/mappings

---

## Notes Feature Locations

### 1. ViewPDF.jsx (`src/pages/ViewPDF.jsx`)
**Purpose**: Create notes while viewing judgment/act PDFs

**Trigger**: 
- User clicks "Notes" button in PDF toolbar
- Only visible if user is authenticated (`isAuthenticated`)

**Context Data**:
- Judgment/Act information (title, court/ministry, date, etc.)
- PDF URL
- Document type (judgment or act)

### 2. ActDetails.jsx (`src/pages/ActDetails.jsx`)
**Purpose**: Create notes for specific acts

**Trigger**:
- User clicks "Notes" button in act details toolbar
- Only visible if user is authenticated

**Context Data**:
- Act information (short_title, long_title, ministry, year, etc.)
- Act type (central_act or state_act)
- Act ID

### 3. MappingDetails.jsx (`src/pages/MappingDetails.jsx`)
**Purpose**: Create notes for law mappings

**Trigger**:
- User clicks "Notes" button in mapping details toolbar
- Only visible if user is authenticated

**Context Data**:
- Mapping information (subject, source section, target section)
- Mapping type (bns_ipc, bsa_iea, bnss_crpc)
- Mapping ID

### 4. Dashboard Notes (`src/components/dashboard/Notes.jsx`)
**Purpose**: Manage all user notes

**Features**:
- View all notes
- Organize notes into folders
- Search notes
- Edit/delete notes
- Filter by folder

---

## Frontend Components

### Notes Popup Component (Shared across ViewPDF, ActDetails, MappingDetails)

**State Management**:
```javascript
const [showNotesPopup, setShowNotesPopup] = useState(false);
const [notesContent, setNotesContent] = useState("");
const [popupPosition, setPopupPosition] = useState({ x: 100, y: 100 });
const [isDragging, setIsDragging] = useState(false);
const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
const [popupSize, setPopupSize] = useState({ width: 500, height: 400 });
const [isResizing, setIsResizing] = useState(false);
const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
```

**Features**:
- Draggable popup (drag by header)
- Resizable popup (drag bottom-right corner)
- Auto-positioning within viewport
- Responsive sizing
- Markdown textarea for content

**Initial Content Generation**:

**For ViewPDF.jsx (Judgments)**:
```javascript
const initialContent = `# ${judgmentInfo?.title || 'Untitled Note'}\n\n${judgmentInfo?.summary || 'No summary available.'}\n\n## Details\n\nCourt: ${judgmentInfo?.court_name || 'N/A'}\nDate: ${judgmentInfo?.decision_date || 'N/A'}`;
```

**For ViewPDF.jsx (Acts)**:
```javascript
const initialContent = `# ${judgmentInfo?.title || judgmentInfo?.short_title || 'Untitled Note'}\n\n${judgmentInfo?.summary || 'No summary available.'}\n\n## Details\n\nMinistry: ${judgmentInfo?.ministry || 'N/A'}\nDate: ${judgmentInfo?.decision_date || judgmentInfo?.year || 'N/A'}`;
```

**For ActDetails.jsx**:
```javascript
const initialContent = `# ${act?.short_title || act?.long_title || 'Untitled Act Note'}\n\n${act?.long_title || 'No description available.'}\n\n## Act Details\n\nMinistry: ${act?.ministry || 'N/A'}\nYear: ${act?.year || 'N/A'}\nAct ID: ${act?.act_id || 'N/A'}`;
```

**For MappingDetails.jsx**:
```javascript
const initialContent = `# ${mapping?.subject || mapping?.title || 'Untitled Mapping Note'}\n\n${mapping?.summary || mapping?.description || 'No summary available.'}\n\n## Mapping Details\n\nSource: ${sourceSection || 'N/A'}\nTarget: ${targetSection || 'N/A'}\nType: ${mappingInfo.title}`;
```

---

## User Interface & Interactions

### Notes Popup UI Structure

```
┌─────────────────────────────────────────┐
│ [📝 Notes] [−] [×]                      │ ← Draggable Header
├─────────────────────────────────────────┤
│                                         │
│  [Textarea for note content]            │
│  (Markdown supported)                    │
│                                         │
│                                         │
│                              [Resize] ← │ ← Resize Handle
├─────────────────────────────────────────┤
│              [Cancel] [Save Notes]      │ ← Footer
└─────────────────────────────────────────┘
```

### Interaction Flow

1. **Opening Notes Popup**:
   - User clicks "Notes" button
   - Popup appears at default position (100, 100)
   - Initial content is auto-populated
   - User can start typing immediately

2. **Dragging Popup**:
   - Click and hold on header
   - Drag to desired position
   - Popup stays within viewport bounds

3. **Resizing Popup**:
   - Click and drag bottom-right corner
   - Minimum size: 400x300px
   - Maximum size: 90% of viewport
   - Size buttons in header for quick adjustments

4. **Saving Notes**:
   - User clicks "Save Notes" button
   - Frontend sends API request with note data
   - Popup closes on success
   - Note appears in Dashboard Notes section

5. **Canceling**:
   - User clicks "Cancel" button
   - Popup closes without saving
   - Content is discarded

---

## Data Models

### Note Model

```javascript
{
  id: integer,                    // Primary key, auto-increment
  user_id: integer,               // Foreign key to users table
  title: string,                  // Note title (auto-generated or user-edited)
  content: text,                  // Note content (markdown supported)
  
  // Reference to source document
  reference_type: string,         // 'judgment', 'act', 'mapping'
  reference_id: integer,          // ID of the referenced document
  
  // Additional context (optional)
  reference_data: json,           // Store original document data for context
  
  // Organization
  folder_id: integer,             // Foreign key to folders table (nullable)
  tags: array[string],            // Tags for categorization
  
  // Metadata
  created_at: datetime,           // ISO 8601 format
  updated_at: datetime,           // ISO 8601 format
  last_viewed_at: datetime        // Last time note was viewed
}
```

### Reference Type Values

- `judgment`: Note linked to a judgment (Supreme Court or High Court)
- `central_act`: Note linked to a central act
- `state_act`: Note linked to a state act
- `bns_ipc_mapping`: Note linked to IPC-BNS mapping
- `bsa_iea_mapping`: Note linked to IEA-BSA mapping
- `bnss_crpc_mapping`: Note linked to BNSS-CrPC mapping

### Database Schema (SQL Example)

```sql
-- Notes Table
CREATE TABLE notes (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    content TEXT,
    
    -- Reference fields
    reference_type VARCHAR(50) NOT NULL,
    reference_id INTEGER NOT NULL,
    reference_data JSONB,  -- Store original document data
    
    -- Organization
    folder_id INTEGER REFERENCES folders(id) ON DELETE SET NULL,
    tags TEXT[],
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_viewed_at TIMESTAMP,
    
    -- Constraints
    CONSTRAINT valid_reference_type CHECK (
        reference_type IN (
            'judgment', 
            'central_act', 
            'state_act', 
            'bns_ipc_mapping', 
            'bsa_iea_mapping', 
            'bnss_crpc_mapping'
        )
    )
);

-- Indexes for performance
CREATE INDEX idx_notes_user_id ON notes(user_id);
CREATE INDEX idx_notes_reference ON notes(reference_type, reference_id);
CREATE INDEX idx_notes_folder_id ON notes(folder_id);
CREATE INDEX idx_notes_created_at ON notes(created_at);
CREATE INDEX idx_notes_title ON notes USING gin(to_tsvector('english', title));
CREATE INDEX idx_notes_content ON notes USING gin(to_tsvector('english', content));
```

---

## Backend API Endpoints

### Base URL
```
https://unquestioned-gunnar-medially.ngrok-free.dev/api/notes
```

### Authentication
All endpoints require JWT authentication:
```
Authorization: Bearer <access_token>
```

---

### 1. Create Note from Document

**Endpoint**: `POST /api/notes`

**Description**: Create a new note linked to a judgment, act, or mapping.

**Headers**:
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "title": "Contract Law Case Analysis",
  "content": "# Contract Law Case Analysis\n\nDetailed notes...",
  "reference_type": "judgment",
  "reference_id": 123,
  "reference_data": {
    "title": "Supreme Court Judgment XYZ",
    "court_name": "Supreme Court of India",
    "decision_date": "2024-01-15",
    "pdf_url": "https://example.com/judgment.pdf"
  },
  "folder_id": 1,
  "tags": ["Contract Law", "Supreme Court"]
}
```

**Field Descriptions**:
- `title` (string, required): Note title (max 200 characters)
- `content` (string, required): Note content (supports markdown)
- `reference_type` (string, required): Type of referenced document
  - Values: `judgment`, `central_act`, `state_act`, `bns_ipc_mapping`, `bsa_iea_mapping`, `bnss_crpc_mapping`
- `reference_id` (integer, required): ID of the referenced document
- `reference_data` (object, optional): Original document data for context
- `folder_id` (integer, optional): ID of folder to assign note to
- `tags` (array of strings, optional): Tags for categorization

**Success Response (201)**:
```json
{
  "success": true,
  "message": "Note created successfully",
  "data": {
    "note": {
      "id": 5,
      "title": "Contract Law Case Analysis",
      "content": "# Contract Law Case Analysis\n\nDetailed notes...",
      "reference_type": "judgment",
      "reference_id": 123,
      "reference_data": {
        "title": "Supreme Court Judgment XYZ",
        "court_name": "Supreme Court of India",
        "decision_date": "2024-01-15"
      },
      "folder_id": 1,
      "tags": ["Contract Law", "Supreme Court"],
      "created_at": "2024-01-25T10:30:00Z",
      "updated_at": "2024-01-25T10:30:00Z"
    }
  }
}
```

**Error Responses**:
- `400 Bad Request`: Invalid input data (missing title, invalid reference_type, etc.)
- `401 Unauthorized`: Invalid or missing authentication token
- `404 Not Found`: Referenced document not found

---

### 2. Get Note by Reference

**Endpoint**: `GET /api/notes/reference/{reference_type}/{reference_id}`

**Description**: Get note(s) linked to a specific document/mapping.

**Path Parameters**:
- `reference_type` (string, required): Type of reference
- `reference_id` (integer, required): ID of the referenced document

**Headers**:
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Success Response (200)**:
```json
{
  "success": true,
  "data": {
    "notes": [
      {
        "id": 5,
        "title": "Contract Law Case Analysis",
        "content": "# Contract Law Case Analysis\n\nDetailed notes...",
        "reference_type": "judgment",
        "reference_id": 123,
        "folder_id": 1,
        "tags": ["Contract Law", "Supreme Court"],
        "created_at": "2024-01-25T10:30:00Z",
        "updated_at": "2024-01-25T10:30:00Z"
      }
    ]
  }
}
```

**Error Responses**:
- `401 Unauthorized`: Invalid or missing authentication token
- `404 Not Found`: No notes found for this reference

---

### 3. Update Note

**Endpoint**: `PUT /api/notes/{note_id}` or `PATCH /api/notes/{note_id}`

**Description**: Update an existing note.

**Path Parameters**:
- `note_id` (integer, required): The ID of the note to update

**Headers**:
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body** (all fields optional):
```json
{
  "title": "Updated Note Title",
  "content": "Updated content...",
  "folder_id": 2,
  "tags": ["Updated", "Tags"]
}
```

**Success Response (200)**:
```json
{
  "success": true,
  "message": "Note updated successfully",
  "data": {
    "note": {
      "id": 5,
      "title": "Updated Note Title",
      "content": "Updated content...",
      "reference_type": "judgment",
      "reference_id": 123,
      "folder_id": 2,
      "tags": ["Updated", "Tags"],
      "created_at": "2024-01-25T10:30:00Z",
      "updated_at": "2024-01-25T15:20:00Z"
    }
  }
}
```

**Error Responses**:
- `400 Bad Request`: Invalid input data
- `401 Unauthorized`: Invalid or missing authentication token
- `404 Not Found`: Note not found or doesn't belong to user

---

### 4. Delete Note

**Endpoint**: `DELETE /api/notes/{note_id}`

**Description**: Delete a note.

**Path Parameters**:
- `note_id` (integer, required): The ID of the note to delete

**Headers**:
```
Authorization: Bearer <token>
```

**Success Response (200)**:
```json
{
  "success": true,
  "message": "Note deleted successfully"
}
```

**Error Responses**:
- `401 Unauthorized`: Invalid or missing authentication token
- `404 Not Found`: Note not found or doesn't belong to user

---

### 5. Get All User Notes

**Endpoint**: `GET /api/notes`

**Description**: Retrieve all notes for the authenticated user.

**Query Parameters**:
- `folder_id` (optional, integer): Filter notes by folder ID
- `reference_type` (optional, string): Filter by reference type
- `search` (optional, string): Search in title and content
- `tags` (optional, string): Comma-separated tags to filter by
- `page` (optional, integer): Page number for pagination (default: 1)
- `limit` (optional, integer): Items per page (default: 20)

**Headers**:
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Success Response (200)**:
```json
{
  "success": true,
  "data": {
    "notes": [
      {
        "id": 1,
        "title": "Contract Law Case Analysis",
        "content": "Detailed analysis...",
        "reference_type": "judgment",
        "reference_id": 123,
        "folder_id": 1,
        "tags": ["Contract Law", "Supreme Court"],
        "created_at": "2024-01-25T10:30:00Z",
        "updated_at": "2024-01-25T10:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 1,
      "pages": 1
    }
  }
}
```

---

## Integration Guide

### Step 1: Add Notes API Methods to `src/services/api.js`

```javascript
// Create note from document
async createNoteFromDocument(noteData) {
  return this.request('/api/notes', {
    method: 'POST',
    body: JSON.stringify({
      title: noteData.title,
      content: noteData.content,
      reference_type: noteData.referenceType,
      reference_id: noteData.referenceId,
      reference_data: noteData.referenceData || null,
      folder_id: noteData.folderId || null,
      tags: noteData.tags || []
    })
  });
}

// Get notes for a specific document
async getNotesByReference(referenceType, referenceId) {
  return this.request(`/api/notes/reference/${referenceType}/${referenceId}`, {
    method: 'GET'
  });
}

// Get all user notes
async getUserNotes(folderId = null, referenceType = null, search = null, tags = null, page = 1, limit = 20) {
  const params = new URLSearchParams();
  if (folderId) params.append('folder_id', folderId);
  if (referenceType) params.append('reference_type', referenceType);
  if (search) params.append('search', search);
  if (tags) params.append('tags', tags);
  params.append('page', page);
  params.append('limit', limit);

  return this.request(`/api/notes?${params.toString()}`, {
    method: 'GET'
  });
}

// Update note
async updateNote(noteId, noteData) {
  return this.request(`/api/notes/${noteId}`, {
    method: 'PUT',
    body: JSON.stringify({
      title: noteData.title,
      content: noteData.content,
      folder_id: noteData.folderId || null,
      tags: noteData.tags || []
    })
  });
}

// Delete note
async deleteNote(noteId) {
  return this.request(`/api/notes/${noteId}`, {
    method: 'DELETE'
  });
}
```

### Step 2: Update ViewPDF.jsx

**Add state for existing notes**:
```javascript
const [existingNotes, setExistingNotes] = useState([]);
const [loadingNotes, setLoadingNotes] = useState(false);
```

**Load existing notes when component mounts**:
```javascript
useEffect(() => {
  const loadExistingNotes = async () => {
    if (!isAuthenticated || !judgmentInfo) return;
    
    setLoadingNotes(true);
    try {
      const referenceType = location.state?.act ? 
        (location.state.act.act_type === 'central' ? 'central_act' : 'state_act') : 
        'judgment';
      const referenceId = judgmentInfo.id;
      
      const response = await apiService.getNotesByReference(referenceType, referenceId);
      if (response.success) {
        setExistingNotes(response.data.notes);
        // If notes exist, pre-populate with latest note
        if (response.data.notes.length > 0) {
          const latestNote = response.data.notes[0];
          setNotesContent(latestNote.content);
        }
      }
    } catch (error) {
      console.error('Error loading notes:', error);
    } finally {
      setLoadingNotes(false);
    }
  };

  loadExistingNotes();
}, [isAuthenticated, judgmentInfo, location.state]);
```

**Update Save Notes handler**:
```javascript
const handleSaveNotes = async () => {
  if (!notesContent.trim()) {
    alert('Please enter some content before saving.');
    return;
  }

  try {
    const referenceType = location.state?.act ? 
      (location.state.act.act_type === 'central' ? 'central_act' : 'state_act') : 
      'judgment';
    const referenceId = judgmentInfo.id;
    
    // Extract title from content (first line or first heading)
    const titleMatch = notesContent.match(/^#\s+(.+)$/m);
    const title = titleMatch ? titleMatch[1] : 
      (judgmentInfo?.title || judgmentInfo?.short_title || 'Untitled Note');

    const noteData = {
      title: title,
      content: notesContent,
      referenceType: referenceType,
      referenceId: referenceId,
      referenceData: {
        title: judgmentInfo?.title || judgmentInfo?.short_title,
        court_name: judgmentInfo?.court_name,
        ministry: judgmentInfo?.ministry,
        decision_date: judgmentInfo?.decision_date,
        year: judgmentInfo?.year,
        pdf_url: pdfUrl
      }
    };

    const response = await apiService.createNoteFromDocument(noteData);
    
    if (response.success) {
      setShowNotesPopup(false);
      // Optionally show success message
      alert('Note saved successfully!');
      // Reload notes list
      const notesResponse = await apiService.getNotesByReference(referenceType, referenceId);
      if (notesResponse.success) {
        setExistingNotes(notesResponse.data.notes);
      }
    } else {
      alert('Failed to save note. Please try again.');
    }
  } catch (error) {
    console.error('Error saving note:', error);
    alert('An error occurred while saving the note. Please try again.');
  }
};
```

**Update Notes button to show existing notes count**:
```javascript
{isAuthenticated && (
  <button
    onClick={() => {
      const initialContent = `# ${judgmentInfo?.title || judgmentInfo?.short_title || 'Untitled Note'}\n\n${judgmentInfo?.summary || 'No summary available.'}\n\n## Details\n\n${location.state?.act ? 'Ministry' : 'Court'}: ${location.state?.act ? (judgmentInfo?.ministry || 'N/A') : (judgmentInfo?.court_name || 'N/A')}\nDate: ${judgmentInfo?.decision_date || judgmentInfo?.year || 'N/A'}`;
      setNotesContent(initialContent);
      setShowNotesPopup(true);
    }}
    className="flex items-center justify-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 text-white rounded-lg transition-all duration-200 font-medium text-xs sm:text-sm shadow-sm hover:shadow-md whitespace-nowrap flex-shrink-0"
    style={{ 
      fontFamily: 'Roboto, sans-serif',
      background: 'linear-gradient(90deg, #1E65AD 0%, #CF9B63 100%)'
    }}
    title={`Add Notes${existingNotes.length > 0 ? ` (${existingNotes.length} existing)` : ''}`}
  >
    <StickyNote className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
    <span className="hidden sm:inline">Notes</span>
    {existingNotes.length > 0 && (
      <span className="ml-1 px-1.5 py-0.5 bg-white bg-opacity-30 rounded text-xs">
        {existingNotes.length}
      </span>
    )}
  </button>
)}
```

### Step 3: Update ActDetails.jsx

**Similar implementation as ViewPDF.jsx**:
```javascript
// Add state
const [existingNotes, setExistingNotes] = useState([]);

// Load notes
useEffect(() => {
  const loadNotes = async () => {
    if (!isAuthenticated || !act) return;
    
    try {
      const referenceType = act.act_type === 'central' ? 'central_act' : 'state_act';
      const response = await apiService.getNotesByReference(referenceType, act.id);
      if (response.success) {
        setExistingNotes(response.data.notes);
      }
    } catch (error) {
      console.error('Error loading notes:', error);
    }
  };

  loadNotes();
}, [isAuthenticated, act]);

// Save handler
const handleSaveNotes = async () => {
  if (!notesContent.trim()) return;

  try {
    const referenceType = act.act_type === 'central' ? 'central_act' : 'state_act';
    const titleMatch = notesContent.match(/^#\s+(.+)$/m);
    const title = titleMatch ? titleMatch[1] : (act?.short_title || 'Untitled Note');

    const noteData = {
      title: title,
      content: notesContent,
      referenceType: referenceType,
      referenceId: act.id,
      referenceData: {
        short_title: act?.short_title,
        long_title: act?.long_title,
        ministry: act?.ministry,
        year: act?.year,
        act_id: act?.act_id
      }
    };

    const response = await apiService.createNoteFromDocument(noteData);
    if (response.success) {
      setShowNotesPopup(false);
      alert('Note saved successfully!');
    }
  } catch (error) {
    console.error('Error saving note:', error);
    alert('Failed to save note.');
  }
};
```

### Step 4: Update MappingDetails.jsx

**Similar implementation**:
```javascript
// Determine reference type
const getReferenceType = () => {
  if (mapping?.mapping_type) {
    if (mapping.mapping_type === 'bns_ipc') return 'bns_ipc_mapping';
    if (mapping.mapping_type === 'bsa_iea') return 'bsa_iea_mapping';
    if (mapping.mapping_type === 'bnss_crpc') return 'bnss_crpc_mapping';
  }
  // Fallback logic
  if (mapping?.ipc_section || mapping?.bns_section) return 'bns_ipc_mapping';
  if (mapping?.iea_section || mapping?.bsa_section) return 'bsa_iea_mapping';
  if (mapping?.crpc_section || mapping?.bnss_section) return 'bnss_crpc_mapping';
  return 'bns_ipc_mapping';
};

// Save handler
const handleSaveNotes = async () => {
  if (!notesContent.trim()) return;

  try {
    const referenceType = getReferenceType();
    const titleMatch = notesContent.match(/^#\s+(.+)$/m);
    const title = titleMatch ? titleMatch[1] : (mapping?.subject || 'Untitled Note');

    const noteData = {
      title: title,
      content: notesContent,
      referenceType: referenceType,
      referenceId: mapping.id,
      referenceData: {
        subject: mapping?.subject,
        source_section: sourceSection,
        target_section: targetSection,
        mapping_type: mapping?.mapping_type
      }
    };

    const response = await apiService.createNoteFromDocument(noteData);
    if (response.success) {
      setShowNotesPopup(false);
      alert('Note saved successfully!');
    }
  } catch (error) {
    console.error('Error saving note:', error);
    alert('Failed to save note.');
  }
};
```

### Step 5: Update Dashboard Notes Component

**Load notes from API**:
```javascript
import { useState, useEffect } from 'react';
import apiService from '../../services/api';

const Notes = () => {
  const [folders, setFolders] = useState([]);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [foldersResponse, notesResponse] = await Promise.all([
        apiService.getFolders(),
        apiService.getUserNotes()
      ]);
      
      if (foldersResponse.success) {
        setFolders(foldersResponse.data.folders);
      }
      
      if (notesResponse.success) {
        setNotes(notesResponse.data.notes);
      }
    } catch (error) {
      console.error('Error loading notes:', error);
    } finally {
      setLoading(false);
    }
  };

  // ... rest of component
};
```

---

## Implementation Examples

### Example 1: Create Note from Judgment

```javascript
// In ViewPDF.jsx
const handleSaveNotes = async () => {
  const noteData = {
    title: "Supreme Court Judgment Analysis",
    content: notesContent,
    referenceType: "judgment",
    referenceId: judgmentInfo.id,
    referenceData: {
      title: judgmentInfo.title,
      court_name: judgmentInfo.court_name,
      decision_date: judgmentInfo.decision_date,
      pdf_url: pdfUrl
    },
    tags: ["Supreme Court", "Contract Law"]
  };

  const response = await apiService.createNoteFromDocument(noteData);
  if (response.success) {
    console.log('Note created:', response.data.note);
  }
};
```

### Example 2: Get Notes for a Document

```javascript
// Load existing notes when viewing a document
const loadNotes = async () => {
  const response = await apiService.getNotesByReference('judgment', judgmentId);
  if (response.success && response.data.notes.length > 0) {
    // Show indicator that notes exist
    console.log('Found notes:', response.data.notes);
  }
};
```

### Example 3: Filter Notes by Reference Type

```javascript
// In Dashboard Notes
const loadNotesByType = async (referenceType) => {
  const response = await apiService.getUserNotes(null, referenceType);
  if (response.success) {
    setNotes(response.data.notes);
  }
};
```

---

## Backend Implementation (Python/Flask Example)

```python
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import Note, db
from datetime import datetime

notes_bp = Blueprint('notes', __name__)

VALID_REFERENCE_TYPES = [
    'judgment',
    'central_act',
    'state_act',
    'bns_ipc_mapping',
    'bsa_iea_mapping',
    'bnss_crpc_mapping'
]

@notes_bp.route('/api/notes', methods=['POST'])
@jwt_required()
def create_note():
    user_id = get_jwt_identity()
    data = request.get_json()
    
    # Validation
    if not data.get('title'):
        return jsonify({'success': False, 'message': 'Title is required'}), 400
    
    if not data.get('content'):
        return jsonify({'success': False, 'message': 'Content is required'}), 400
    
    if data.get('reference_type') not in VALID_REFERENCE_TYPES:
        return jsonify({'success': False, 'message': 'Invalid reference_type'}), 400
    
    if not data.get('reference_id'):
        return jsonify({'success': False, 'message': 'reference_id is required'}), 400
    
    note = Note(
        user_id=user_id,
        title=data['title'],
        content=data['content'],
        reference_type=data['reference_type'],
        reference_id=data['reference_id'],
        reference_data=data.get('reference_data'),
        folder_id=data.get('folder_id'),
        tags=data.get('tags', [])
    )
    
    db.session.add(note)
    db.session.commit()
    
    return jsonify({
        'success': True,
        'message': 'Note created successfully',
        'data': {'note': note.to_dict()}
    }), 201

@notes_bp.route('/api/notes/reference/<reference_type>/<int:reference_id>', methods=['GET'])
@jwt_required()
def get_notes_by_reference(reference_type, reference_id):
    user_id = get_jwt_identity()
    
    if reference_type not in VALID_REFERENCE_TYPES:
        return jsonify({'success': False, 'message': 'Invalid reference_type'}), 400
    
    notes = Note.query.filter_by(
        user_id=user_id,
        reference_type=reference_type,
        reference_id=reference_id
    ).order_by(Note.created_at.desc()).all()
    
    return jsonify({
        'success': True,
        'data': {
            'notes': [note.to_dict() for note in notes]
        }
    }), 200

@notes_bp.route('/api/notes', methods=['GET'])
@jwt_required()
def get_user_notes():
    user_id = get_jwt_identity()
    folder_id = request.args.get('folder_id', type=int)
    reference_type = request.args.get('reference_type')
    search = request.args.get('search', '')
    page = request.args.get('page', 1, type=int)
    limit = request.args.get('limit', 20, type=int)
    
    query = Note.query.filter_by(user_id=user_id)
    
    if folder_id:
        query = query.filter_by(folder_id=folder_id)
    
    if reference_type and reference_type in VALID_REFERENCE_TYPES:
        query = query.filter_by(reference_type=reference_type)
    
    if search:
        query = query.filter(
            db.or_(
                Note.title.ilike(f'%{search}%'),
                Note.content.ilike(f'%{search}%')
            )
        )
    
    notes = query.order_by(Note.updated_at.desc()).paginate(
        page=page, 
        per_page=limit, 
        error_out=False
    )
    
    return jsonify({
        'success': True,
        'data': {
            'notes': [note.to_dict() for note in notes.items],
            'pagination': {
                'page': page,
                'limit': limit,
                'total': notes.total,
                'pages': notes.pages
            }
        }
    }), 200

@notes_bp.route('/api/notes/<int:note_id>', methods=['PUT'])
@jwt_required()
def update_note(note_id):
    user_id = get_jwt_identity()
    note = Note.query.filter_by(id=note_id, user_id=user_id).first()
    
    if not note:
        return jsonify({'success': False, 'message': 'Note not found'}), 404
    
    data = request.get_json()
    
    if 'title' in data:
        note.title = data['title']
    if 'content' in data:
        note.content = data['content']
    if 'folder_id' in data:
        note.folder_id = data['folder_id']
    if 'tags' in data:
        note.tags = data['tags']
    
    note.updated_at = datetime.utcnow()
    db.session.commit()
    
    return jsonify({
        'success': True,
        'message': 'Note updated successfully',
        'data': {'note': note.to_dict()}
    }), 200

@notes_bp.route('/api/notes/<int:note_id>', methods=['DELETE'])
@jwt_required()
def delete_note(note_id):
    user_id = get_jwt_identity()
    note = Note.query.filter_by(id=note_id, user_id=user_id).first()
    
    if not note:
        return jsonify({'success': False, 'message': 'Note not found'}), 404
    
    db.session.delete(note)
    db.session.commit()
    
    return jsonify({
        'success': True,
        'message': 'Note deleted successfully'
    }), 200
```

---

## Security Considerations

1. **Authentication**: All endpoints require valid JWT token
2. **Authorization**: Users can only access their own notes
3. **Input Validation**: Validate all user inputs on backend
4. **Reference Validation**: Verify that referenced documents exist
5. **Content Sanitization**: Sanitize note content to prevent XSS
6. **Rate Limiting**: Implement rate limiting on note creation endpoints

---

## Testing

### Frontend Testing

```javascript
// Test creating a note
const testCreateNote = async () => {
  const noteData = {
    title: "Test Note",
    content: "# Test\n\nThis is a test note.",
    referenceType: "judgment",
    referenceId: 123,
    tags: ["test"]
  };
  
  const response = await apiService.createNoteFromDocument(noteData);
  console.log('Create note response:', response);
};

// Test loading notes
const testLoadNotes = async () => {
  const response = await apiService.getNotesByReference('judgment', 123);
  console.log('Notes response:', response);
};
```

### Backend Testing (cURL)

```bash
# Create note
curl -X POST "https://api.example.com/api/notes" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Note",
    "content": "# Test Note\n\nContent here",
    "reference_type": "judgment",
    "reference_id": 123,
    "tags": ["test"]
  }'

# Get notes by reference
curl -X GET "https://api.example.com/api/notes/reference/judgment/123" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Summary

The Notes feature is integrated across:
- **ViewPDF.jsx**: Notes for judgments and acts while viewing PDFs
- **ActDetails.jsx**: Notes for specific acts
- **MappingDetails.jsx**: Notes for law mappings
- **Dashboard Notes**: Centralized note management

All notes are linked to their source documents via `reference_type` and `reference_id`, allowing users to:
- Create contextual notes while viewing documents
- Organize notes into folders
- Search and filter notes
- Access notes from both the source document and the dashboard

The backend should implement the API endpoints described above to support full note functionality.

---

**Last Updated**: January 2024
**Version**: 1.0.0

