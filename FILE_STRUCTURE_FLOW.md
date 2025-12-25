# File Structure Flow - AGL Legal Platform (salhakar)

## Project Overview
A comprehensive legal research platform built with React, providing access to legal judgments, acts, mappings, bookmarks, and user dashboard functionality.

---

## Directory Structure

```
salhakar/
├── public/                          # Static assets
│   ├── index.html                  # Main HTML entry point
│   ├── favicon.ico                 # Site favicon
│   ├── manifest.json               # PWA manifest
│   ├── robots.txt                  # SEO robots file
│   └── [logo assets]               # Brand logos and images
│
├── src/                            # Source code directory
│   ├── index.js                    # React application entry point
│   ├── App.js                      # Main App component with routing
│   ├── App.css                     # Global app styles
│   ├── index.css                   # Base CSS styles
│   │
│   ├── components/                 # Reusable React components
│   │   ├── landing/                # Landing page components
│   │   │   ├── Navbar.jsx          # Main navigation bar
│   │   │   ├── Hero.jsx            # Hero section
│   │   │   ├── Features.jsx        # Features showcase
│   │   │   ├── VideoSection.jsx    # Video content section
│   │   │   ├── Testimonials.jsx    # Customer testimonials
│   │   │   ├── Pricing.jsx         # Pricing plans
│   │   │   ├── BlogSection.jsx     # Blog posts section
│   │   │   ├── FAQ.jsx             # Frequently asked questions
│   │   │   ├── Footer.jsx          # Site footer
│   │   │   ├── QuickLinks.jsx      # Quick navigation links
│   │   │   └── SearchBar.jsx       # Search functionality
│   │   │
│   │   ├── dashboard/              # Dashboard-specific components
│   │   │   ├── MyDownloads.jsx     # User downloads management
│   │   │   ├── Calendar.jsx        # Calendar/events component
│   │   │   ├── Bookmarks.jsx       # Bookmarks management
│   │   │   ├── BookmarkAnalytics.jsx # Bookmark analytics
│   │   │   ├── BookmarkImportExport.jsx # Import/export bookmarks
│   │   │   ├── Notifications.jsx   # User notifications
│   │   │   └── ProfileSettings.jsx  # Profile configuration
│   │   │
│   │   ├── examples/                # Example/demo components
│   │   │   └── BookmarkExample.jsx  # Bookmark usage examples
│   │   │
│   │   ├── BookmarkButton.jsx      # Reusable bookmark button
│   │   ├── GoogleTranslate.jsx     # Google Translate integration
│   │   ├── LanguageSelector.jsx    # Language selection component
│   │   ├── LanguageSelectorButton.jsx # Language selector button
│   │   ├── PDFTranslator.jsx       # PDF translation feature
│   │   ├── ProtectedRoute.jsx      # Route protection wrapper
│   │   ├── SessionManagement.jsx   # Session management UI
│   │   ├── LoadingComponents.jsx  # Loading state components
│   │   ├── EnhancedLoadingComponents.jsx # Enhanced loaders
│   │   └── SkeletonLoaders.jsx     # Skeleton loading states
│   │
│   ├── pages/                      # Page components (routes)
│   │   ├── LandingPage.jsx         # Home/landing page
│   │   ├── Login.jsx               # User login page
│   │   ├── Signup.jsx              # User registration page
│   │   ├── Dashboard.jsx           # Main user dashboard
│   │   ├── Profile.jsx              # User profile page
│   │   ├── Bookmarks.jsx           # Bookmarks page
│   │   │
│   │   ├── [Legal Content Pages]    # Legal resource pages
│   │   │   ├── SupremeCourtJudgments.jsx    # SC judgments listing
│   │   │   ├── HighCourtJudgments.jsx       # HC judgments listing
│   │   │   ├── BrowseActs.jsx               # Acts browser
│   │   │   ├── CentralActs.jsx              # Central acts listing
│   │   │   ├── StateActs.jsx                # State acts listing
│   │   │   ├── ActDetails.jsx               # Individual act details
│   │   │   ├── ViewPDF.jsx                  # PDF viewer
│   │   │   │
│   │   │   ├── OldToNewLawMapping.jsx       # Law mapping interface
│   │   │   ├── IPCBNSMapping.jsx            # IPC-BNS mapping
│   │   │   ├── IEABSAMapping.jsx            # IEA-BSA mapping
│   │   │   └── BNSSCrPCMapping.jsx          # BNSS-CrPC mapping
│   │   │
│   │   ├── [Utility Pages]         # Feature pages
│   │   │   ├── LegalTemplate.jsx            # Legal document templates
│   │   │   ├── YoutubeVideoSummary.jsx      # Video summary feature
│   │   │   ├── LegalChatbot.jsx             # AI legal chatbot
│   │   │   └── LanguageSelectorDemo.jsx     # Language demo
│   │   │
│   │   ├── [Referral Program]      # Referral system pages
│   │   │   ├── Referral.jsx                 # Referral dashboard
│   │   │   ├── InviteFriends.jsx            # Invite friends page
│   │   │   ├── EarnRewards.jsx              # Rewards page
│   │   │   └── TrackReferrals.jsx           # Referral tracking
│   │   │
│   │   ├── [Legal Pages]           # Legal/policy pages
│   │   │   ├── About.jsx                    # About us page
│   │   │   ├── OurTeam.jsx                  # Team page
│   │   │   ├── PrivacyPolicy.jsx            # Privacy policy
│   │   │   ├── TermsOfService.jsx           # Terms of service
│   │   │   ├── CookiePolicy.jsx             # Cookie policy
│   │   │   └── RefundPolicy.jsx             # Refund policy
│   │   │
│   │   └── designs/                # Design variant implementations
│   │       ├── minimalist/                  # Minimalist design variant
│   │       │   ├── index.jsx                # Minimalist showcase
│   │       │   ├── HighCourtJudgments.jsx    # Minimalist HC page
│   │       │   ├── SupremeCourtJudgments.jsx # Minimalist SC page
│   │       │   └── README.md                # Design docs
│   │       │
│   │       ├── glassmorphism/               # Glassmorphism design
│   │       │   ├── index.jsx                # Glassmorphism showcase
│   │       │   └── README.md                # Design docs
│   │       │
│   │       ├── accessible/                  # Accessible design variant
│   │       ├── conversational/             # Conversational UI variant
│   │       ├── material/                   # Material design variant
│   │       ├── neumorphism/                # Neumorphism design
│   │       ├── premium/                    # Premium design variant
│   │       ├── README.md                   # Design system overview
│   │       └── DESIGN_VARIANTS_GUIDE.md    # Design guide
│   │
│   ├── contexts/                   # React Context providers
│   │   └── AuthContext.jsx         # Authentication context
│   │                               # - User state management
│   │                               # - Login/logout functionality
│   │                               # - Session management
│   │                               # - Token refresh
│   │
│   ├── hooks/                      # Custom React hooks
│   │   ├── useBookmarks.js         # Bookmark management hook
│   │   ├── useInfiniteScroll.js    # Infinite scroll functionality
│   │   └── useSmoothInfiniteScroll.js # Smooth scroll hook
│   │
│   ├── services/                   # API and external services
│   │   └── api.js                  # Main API service
│   │                               # - Authentication APIs
│   │                               # - Judgments APIs (SC, HC)
│   │                               # - Acts APIs (Central, State)
│   │                               # - Bookmark APIs
│   │                               # - Dashboard APIs
│   │                               # - Law mapping APIs
│   │                               # - Error handling & retry logic
│   │
│   ├── utils/                      # Utility functions
│   │                               # (Directory exists, may contain helpers)
│   │
│   ├── setupProxy.js               # Proxy configuration for dev
│   ├── setupTests.js               # Test configuration
│   └── reportWebVitals.js          # Performance monitoring
│
├── app/                            # Additional app directory
│                                   # (May contain backend or additional configs)
│
├── node_modules/                   # NPM dependencies
│
├── [Documentation Files]           # Project documentation
│   ├── README.md                   # Project readme
│   ├── QUICK_START.md              # Quick start guide
│   ├── BOOKMARK_API_DOCUMENTATION.md # Bookmark API docs
│   ├── BOOKMARK_IMPLEMENTATION_GUIDE.md # Implementation guide
│   ├── BOOKMARK_SYSTEM_GUIDE.md    # Bookmark system overview
│   ├── CHANGES_SUMMARY.md          # Change log
│   ├── INTEGRATION_SUMMARY.md      # Integration documentation
│   └── LEGAL_PLATFORM_COMPLETE_PROMPT.md # Complete platform prompt
│
├── package.json                    # NPM dependencies & scripts
├── package-lock.json               # Locked dependency versions
├── tailwind.config.js              # Tailwind CSS configuration
├── postcss.config.js               # PostCSS configuration
└── test-api-connectivity.js        # API connectivity test script
```

---

## Data Flow Architecture

### 1. **Application Entry Point**
```
index.js
  └──> Renders <App /> into root DOM element
```

### 2. **Main Application Structure**
```
App.js
  └──> AuthProvider (AuthContext wrapper)
        └──> AppLayout
              ├──> GoogleTranslate (Global)
              └──> Routes
                    ├──> Public Routes (Landing, Login, Signup, etc.)
                    ├──> Protected Routes (Dashboard)
                    └──> Feature Routes (Judgments, Acts, Mappings, etc.)
```

### 3. **Authentication Flow**
```
AuthContext.jsx
  ├──> Manages user state
  ├──> Handles login/signup/logout
  ├──> Token management (access/refresh)
  ├──> Session management
  └──> Persists auth state to localStorage
```

### 4. **API Communication Flow**
```
Components/Pages
  └──> api.js (ApiService)
        ├──> Authentication APIs
        │     ├──> /auth/login
        │     ├──> /auth/signup
        │     ├──> /auth/logout
        │     ├──> /auth/refresh
        │     └──> /auth/sessions
        │
        ├──> Content APIs
        │     ├──> /api/judgements (High Court)
        │     ├──> /api/supreme-court-judgements
        │     ├──> /api/acts/central-acts
        │     └──> /api/acts/state-acts
        │
        ├──> Bookmark APIs
        │     ├──> /api/bookmarks
        │     ├──> /api/bookmarks/judgements/{id}
        │     ├──> /api/bookmarks/acts/{type}/{id}
        │     └──> /api/bookmarks/mappings/{type}/{id}
        │
        ├──> Dashboard APIs
        │     ├──> /api/dashboard/downloads
        │     ├──> /api/dashboard/events
        │     └──> /api/dashboard/notifications
        │
        └──> Law Mapping APIs
              ├──> /api/law_mapping?mapping_type=bns_ipc
              ├──> /api/law_mapping?mapping_type=bsa_iea
              └──> /api/law_mapping?mapping_type=bnss_crpc
```

### 5. **Component Hierarchy Examples**

#### Landing Page Flow
```
LandingPage.jsx
  ├──> Navbar.jsx
  ├──> Hero.jsx
  ├──> Features.jsx
  ├──> VideoSection.jsx
  ├──> Testimonials.jsx
  ├──> Pricing.jsx
  ├──> BlogSection.jsx
  ├──> FAQ.jsx
  └──> Footer.jsx
```

#### Dashboard Flow
```
Dashboard.jsx
  ├──> Navbar.jsx
  └──> Sidebar Navigation
        ├──> Home Tab → Stats & Recent Activity
        ├──> Downloads Tab → MyDownloads.jsx
        ├──> Calendar Tab → Calendar.jsx
        └──> Bookmarks Tab → Bookmarks.jsx
```

#### Judgments Page Flow
```
HighCourtJudgments.jsx / SupremeCourtJudgments.jsx
  ├──> Search & Filter Components
  ├──> Judgment List (with pagination/infinite scroll)
  ├──> BookmarkButton.jsx (for each judgment)
  └──> ViewPDF.jsx (when viewing PDF)
```

### 6. **State Management Flow**
```
React Context (AuthContext)
  ├──> User State
  ├──> Authentication State
  └──> Session State

Local State (useState)
  ├──> Component-specific UI state
  └──> Form states

LocalStorage
  ├──> user
  ├──> accessToken
  ├──> refreshToken
  └──> token
```

### 7. **Custom Hooks Usage**
```
useBookmarks.js
  └──> Used by: BookmarkButton, Bookmarks page
        Provides: addBookmark, removeBookmark, isBookmarked

useInfiniteScroll.js
  └──> Used by: Judgment listings, Acts listings
        Provides: Infinite scroll functionality

useSmoothInfiniteScroll.js
  └──> Used by: Content pages with pagination
        Provides: Smooth scrolling behavior
```

---

## Key Features & Their Locations

### 1. **Authentication System**
- **Context**: `src/contexts/AuthContext.jsx`
- **Pages**: `src/pages/Login.jsx`, `src/pages/Signup.jsx`
- **Protection**: `src/components/ProtectedRoute.jsx`
- **API**: `src/services/api.js` (auth methods)

### 2. **Dashboard System**
- **Main Page**: `src/pages/Dashboard.jsx`
- **Components**: `src/components/dashboard/*`
- **API**: `src/services/api.js` (dashboard methods)

### 3. **Bookmark System**
- **Hook**: `src/hooks/useBookmarks.js`
- **Component**: `src/components/BookmarkButton.jsx`
- **Pages**: `src/pages/Bookmarks.jsx`, `src/components/dashboard/Bookmarks.jsx`
- **API**: `src/services/api.js` (bookmark methods)

### 4. **Judgments System**
- **Pages**: 
  - `src/pages/SupremeCourtJudgments.jsx`
  - `src/pages/HighCourtJudgments.jsx`
- **API**: `src/services/api.js` (judgment methods)

### 5. **Acts System**
- **Pages**: 
  - `src/pages/CentralActs.jsx`
  - `src/pages/StateActs.jsx`
  - `src/pages/ActDetails.jsx`
- **API**: `src/services/api.js` (acts methods)

### 6. **Law Mapping System**
- **Pages**:
  - `src/pages/OldToNewLawMapping.jsx`
  - `src/pages/IPCBNSMapping.jsx`
  - `src/pages/IEABSAMapping.jsx`
  - `src/pages/BNSSCrPCMapping.jsx`
- **API**: `src/services/api.js` (mapping methods)

### 7. **Translation Features**
- **Components**: 
  - `src/components/GoogleTranslate.jsx`
  - `src/components/LanguageSelector.jsx`
  - `src/components/PDFTranslator.jsx`

### 8. **Referral Program**
- **Pages**: 
  - `src/pages/Referral.jsx`
  - `src/pages/InviteFriends.jsx`
  - `src/pages/EarnRewards.jsx`
  - `src/pages/TrackReferrals.jsx`

---

## Technology Stack

- **Frontend Framework**: React 19.2.0
- **Routing**: React Router DOM 7.9.3
- **Styling**: Tailwind CSS 3.4.13
- **Icons**: Lucide React, React Icons
- **State Management**: React Context API
- **HTTP Client**: Fetch API
- **Build Tool**: Create React App (react-scripts)

---

## API Base Configuration

- **Primary API URL**: Configured in `src/services/api.js`
- **Fallback URLs**: Multiple fallback endpoints for reliability
- **Authentication**: JWT tokens (access + refresh)
- **Error Handling**: Automatic token refresh, error retry logic

---

## Design System

Multiple design variants available in `src/pages/designs/`:
- Minimalist
- Glassmorphism
- Material Design
- Neumorphism
- Accessible
- Conversational
- Premium

Each variant includes its own implementation files and documentation.

---

## Development Workflow

1. **Start Development**: `npm start`
2. **Build Production**: `npm run build`
3. **Run Tests**: `npm test`
4. **API Connectivity**: Test with `test-api-connectivity.js`

---

## Key Configuration Files

- `package.json` - Dependencies and scripts
- `tailwind.config.js` - Tailwind CSS configuration
- `postcss.config.js` - PostCSS processing
- `setupProxy.js` - Development proxy configuration
- `src/services/api.js` - API service configuration

---

This structure supports a scalable, maintainable legal research platform with clear separation of concerns, reusable components, and comprehensive API integration.

