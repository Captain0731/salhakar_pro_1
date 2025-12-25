# AGL Legal Platform - Complete Project Structure Prompt

## Project Overview

**AGL Legal Platform (salhakar)** is a comprehensive React-based legal research and management platform designed for legal professionals, students, and organizations. The platform provides access to Supreme Court and High Court judgments, Central and State acts, law mappings (IPC-BNS, IEA-BSA, BNSS-CrPC), bookmark management, user dashboard, referral program, and multilingual support.

---

## Project Architecture

### Technology Stack
- **Frontend Framework**: React 19.2.0 with React Router DOM 7.9.3
- **Styling**: Tailwind CSS 3.4.13 with PostCSS
- **Icons**: Lucide React 0.544.0, React Icons 5.5.0
- **State Management**: React Context API
- **HTTP Client**: Native Fetch API with custom ApiService
- **Build Tool**: Create React App (react-scripts 5.0.1)

### Project Structure

```
salhakar/
├── public/              # Static assets and public files
├── src/
│   ├── components/      # Reusable React components
│   │   ├── landing/    # Landing page components
│   │   ├── dashboard/  # Dashboard-specific components
│   │   └── [utilities] # Utility components (translators, loaders, etc.)
│   ├── pages/          # Route-level page components
│   │   ├── designs/    # Design variant implementations
│   │   └── [features]  # Feature pages (judgments, acts, mappings, etc.)
│   ├── contexts/       # React Context providers (AuthContext)
│   ├── hooks/          # Custom React hooks
│   ├── services/       # API service layer
│   └── utils/          # Utility functions
└── [config files]      # Configuration and documentation
```

---

## Core Features & Implementation

### 1. Authentication System

**Location**: `src/contexts/AuthContext.jsx`, `src/pages/Login.jsx`, `src/pages/Signup.jsx`

**Features**:
- User registration and login
- JWT token-based authentication (access + refresh tokens)
- Session management (multiple active sessions)
- Automatic token refresh
- Session termination capabilities
- Protected routes via `ProtectedRoute` component

**API Endpoints Used**:
- `POST /auth/signup` - User registration
- `POST /auth/login` - User authentication
- `POST /auth/logout` - User logout
- `POST /auth/refresh` - Token refresh
- `GET /auth/sessions` - Get active sessions
- `DELETE /auth/sessions/{id}` - Terminate specific session

### 2. Dashboard System

**Location**: `src/pages/Dashboard.jsx`, `src/components/dashboard/`

**Components**:
- **MyDownloads.jsx**: Manage downloaded legal documents
- **Calendar.jsx**: View and manage legal events/hearings
- **Bookmarks.jsx**: Manage bookmarked content
- **BookmarkAnalytics.jsx**: Analytics for bookmark usage
- **BookmarkImportExport.jsx**: Import/export bookmarks
- **Notifications.jsx**: User notifications
- **ProfileSettings.jsx**: User profile configuration

**Dashboard Features**:
- Statistics overview (downloads, bookmarks, events)
- Recent activity feed
- Quick actions
- Tab-based navigation (Home, Downloads, Calendar, Bookmarks)
- Responsive sidebar navigation

### 3. Bookmark System

**Location**: `src/hooks/useBookmarks.js`, `src/components/BookmarkButton.jsx`, `src/pages/Bookmarks.jsx`

**Features**:
- Bookmark judgments (Supreme Court & High Court)
- Bookmark acts (Central & State)
- Bookmark law mappings (IPC-BNS, IEA-BSA, BNSS-CrPC)
- Bookmark analytics and statistics
- Import/export bookmarks functionality
- Folder organization for bookmarks

**API Endpoints**:
- `GET /api/bookmarks` - Get user bookmarks
- `POST /api/bookmarks/judgements/{id}` - Bookmark judgment
- `DELETE /api/bookmarks/judgements/{id}` - Remove judgment bookmark
- `POST /api/bookmarks/acts/{type}/{id}` - Bookmark act
- `DELETE /api/bookmarks/acts/{type}/{id}` - Remove act bookmark
- `POST /api/bookmarks/mappings/{type}/{id}` - Bookmark mapping
- `DELETE /api/bookmarks/mappings/{type}/{id}` - Remove mapping bookmark

### 4. Judgments System

**Location**: `src/pages/SupremeCourtJudgments.jsx`, `src/pages/HighCourtJudgments.jsx`

**Features**:
- Browse Supreme Court judgments
- Browse High Court judgments
- Advanced filtering (judge, date, CNR, petitioner, respondent)
- Search functionality
- Pagination/infinite scroll
- PDF viewing via `ViewPDF.jsx`
- Bookmark integration

**API Endpoints**:
- `GET /api/supreme-court-judgements` - Get SC judgments
- `GET /api/high-court-judgements` - Get HC judgments
- Supports cursor-based and offset-based pagination
- Filter parameters: search, title, cnr, judge, petitioner, respondent, decision_date_from

### 5. Acts System

**Location**: `src/pages/CentralActs.jsx`, `src/pages/StateActs.jsx`, `src/pages/ActDetails.jsx`

**Features**:
- Browse Central Acts
- Browse State Acts (by state)
- Search and filter acts
- Act details view
- Bookmark acts
- Pagination support

**API Endpoints**:
- `GET /api/acts/central-acts` - Get central acts
- `GET /api/acts/state-acts` - Get state acts
- Filter parameters: search, short_title, state, act_id, year, department

### 6. Law Mapping System

**Location**: 
- `src/pages/OldToNewLawMapping.jsx`
- `src/pages/IPCBNSMapping.jsx` (IPC to BNS mapping)
- `src/pages/IEABSAMapping.jsx` (IEA to BSA mapping)
- `src/pages/BNSSCrPCMapping.jsx` (BNSS to CrPC mapping)

**Features**:
- Map old laws to new laws (IPC→BNS, IEA→BSA, CrPC→BNSS)
- Search and filter mappings
- View mapping details
- Bookmark mappings

**API Endpoints**:
- `GET /api/law_mapping?mapping_type=bns_ipc` - IPC-BNS mappings
- `GET /api/law_mapping?mapping_type=bsa_iea` - IEA-BSA mappings
- `GET /api/law_mapping?mapping_type=bnss_crpc` - BNSS-CrPC mappings

### 7. Additional Features

**Legal Chatbot**: `src/pages/LegalChatbot.jsx`
- AI-powered legal assistant

**YouTube Video Summary**: `src/pages/YoutubeVideoSummary.jsx`
- Generate summaries for legal YouTube videos

**Legal Templates**: `src/pages/LegalTemplate.jsx`
- Access to legal document templates

**PDF Translator**: `src/components/PDFTranslator.jsx`
- Translate PDF documents

**Google Translate Integration**: `src/components/GoogleTranslate.jsx`
- Global translation widget

**Language Selector**: `src/components/LanguageSelector.jsx`
- Multi-language support

### 8. Referral Program

**Location**: `src/pages/Referral.jsx`, `src/pages/InviteFriends.jsx`, `src/pages/EarnRewards.jsx`, `src/pages/TrackReferrals.jsx`

**Features**:
- Invite friends
- Track referrals
- Earn rewards
- Referral dashboard

### 9. Design Variants

**Location**: `src/pages/designs/`

**Available Variants**:
- Minimalist design
- Glassmorphism design
- Material design
- Neumorphism design
- Accessible design
- Conversational UI
- Premium design

Each variant includes its own implementation and README documentation.

---

## API Service Architecture

**Location**: `src/services/api.js`

**Key Features**:
- Singleton ApiService class
- Automatic token refresh on 401 errors
- Fallback URL system for API endpoints
- Error handling and retry logic
- Request/response interceptors
- Mock data fallback when API unavailable

**API Configuration**:
- Primary base URL configured in api.js
- Multiple fallback URLs for reliability
- ngrok support for development
- Automatic endpoint switching on failure

**Method Categories**:
1. Authentication methods (login, signup, logout, refresh)
2. Judgments methods (getJudgements, getSupremeCourtJudgements, getHighCourtJudgements)
3. Acts methods (getCentralActs, getStateActs)
4. Bookmark methods (getUserBookmarks, bookmarkJudgement, etc.)
5. Dashboard methods (downloads, events, notifications)
6. Law mapping methods (getLawMappings, getBnsIpcMappings, etc.)
7. User profile methods (updateUserProfile, changePassword, etc.)

---

## State Management

### Context API
- **AuthContext**: Global authentication state, user data, sessions

### Local State
- Component-level state using `useState`
- Form state management
- UI state (modals, tabs, filters)

### Persistent Storage
- `localStorage` for:
  - User data
  - Access tokens
  - Refresh tokens
  - Session information

---

## Routing Structure

**Main Routes** (defined in `src/App.js`):

**Public Routes**:
- `/` - Landing page
- `/home` - Landing page (alias)
- `/login` - Login page
- `/signup` - Signup page
- `/about` - About page
- `/our-team` - Team page
- `/privacy-policy` - Privacy policy
- `/terms-of-service` - Terms of service
- `/cookie-policy` - Cookie policy
- `/refund-policy` - Refund policy

**Content Routes** (Public Access):
- `/supreme-court-judgments` - SC judgments
- `/high-court-judgments` - HC judgments
- `/view-pdf` - PDF viewer
- `/browse-acts` - Browse acts
- `/central-acts` - Central acts
- `/state-acts` - State acts
- `/act-details` - Act details
- `/old-to-new-mapping` - Law mapping
- `/ipc-bns-mapping` - IPC-BNS mapping
- `/iea-bsa-mapping` - IEA-BSA mapping
- `/bnss-crpc-mapping` - BNSS-CrPC mapping
- `/legal-template` - Legal templates
- `/youtube-summary` - Video summary
- `/legal-chatbot` - Legal chatbot
- `/profile` - User profile
- `/bookmarks` - Bookmarks page

**Protected Routes**:
- `/dashboard` - Main dashboard (requires authentication)

**Referral Routes**:
- `/referral` - Referral dashboard
- `/referral/invite` - Invite friends
- `/referral/rewards` - Earn rewards
- `/referral/track` - Track referrals

**Design Variant Routes**:
- `/designs/minimalist` - Minimalist design showcase
- `/designs/minimalist/high-court` - Minimalist HC page
- `/designs/minimalist/supreme-court` - Minimalist SC page
- `/designs/glassmorphism` - Glassmorphism showcase

---

## Custom Hooks

### useBookmarks.js
- Manages bookmark state and operations
- Provides: `addBookmark`, `removeBookmark`, `isBookmarked`, `getBookmarks`

### useInfiniteScroll.js
- Implements infinite scroll functionality
- Used in judgment and act listings

### useSmoothInfiniteScroll.js
- Smooth scrolling for paginated content
- Enhanced UX for content loading

---

## Component Patterns

### Landing Page Components
Located in `src/components/landing/`:
- Modular, reusable sections
- Consistent styling with Tailwind CSS
- Responsive design patterns

### Dashboard Components
Located in `src/components/dashboard/`:
- Feature-specific components
- Shared state via props/context
- Consistent UI patterns

### Utility Components
- Loading states (SkeletonLoaders, LoadingComponents)
- Translation components (GoogleTranslate, LanguageSelector)
- Protected route wrapper (ProtectedRoute)
- Session management UI (SessionManagement)

---

## Styling Architecture

- **Tailwind CSS**: Utility-first CSS framework
- **Custom Colors**: Defined in tailwind.config.js
  - Primary: #1E65AD (Blue)
  - Secondary: #CF9B63 (Gold)
  - Tertiary: #8C969F (Gray)
- **Fonts**: Helvetica Hebrew Bold (headings), Roboto (body)
- **Responsive**: Mobile-first approach
- **Design System**: Multiple variants available

---

## Error Handling

- API errors handled in `api.js`
- Automatic token refresh on 401
- Fallback to mock data when API unavailable
- User-friendly error messages
- Console logging for debugging

---

## Development Workflow

1. **Start Development Server**: `npm start`
2. **Build for Production**: `npm run build`
3. **Run Tests**: `npm test`
4. **API Connectivity**: Test with `test-api-connectivity.js`

---

## Key Configuration

### package.json
- React 19.2.0
- React Router DOM 7.9.3
- Tailwind CSS 3.4.13
- Lucide React 0.544.0
- React Icons 5.5.0

### API Configuration
- Base URL: Configured in `src/services/api.js`
- Fallback URLs: Multiple endpoints for reliability
- Authentication: JWT with refresh tokens
- Headers: Includes ngrok-skip-browser-warning for development

---

## Documentation Files

- `README.md` - Basic project readme
- `QUICK_START.md` - Quick start guide
- `BOOKMARK_API_DOCUMENTATION.md` - Bookmark API reference
- `BOOKMARK_IMPLEMENTATION_GUIDE.md` - Implementation guide
- `BOOKMARK_SYSTEM_GUIDE.md` - Bookmark system overview
- `CHANGES_SUMMARY.md` - Change log
- `INTEGRATION_SUMMARY.md` - Integration documentation
- `LEGAL_PLATFORM_COMPLETE_PROMPT.md` - Complete platform prompt

---

## Best Practices Implemented

1. **Component Organization**: Logical grouping by feature/domain
2. **Code Reusability**: Shared components and hooks
3. **API Abstraction**: Centralized API service
4. **Error Handling**: Comprehensive error management
5. **State Management**: Context API for global state
6. **Type Safety**: PropTypes or TypeScript could be added
7. **Performance**: Code splitting via React Router
8. **Accessibility**: Design variants include accessible patterns
9. **Responsive Design**: Mobile-first approach
10. **Documentation**: Comprehensive docs for major features

---

## Future Enhancements

Potential areas for expansion:
- TypeScript migration
- Unit and integration tests
- Performance monitoring (Web Vitals)
- Progressive Web App (PWA) features
- Advanced search capabilities
- AI-powered legal research
- Collaborative features
- Advanced analytics
- Export functionality (PDF, Excel)
- Mobile app version

---

This prompt provides a complete overview of the AGL Legal Platform structure, enabling developers to understand the architecture, navigate the codebase, and contribute effectively to the project.

