# Legal Platform - Complete System Prompt

## 🏛️ **Platform Overview**

**Salhakar** is a comprehensive legal platform that provides access to Indian legal data including court judgments, acts, and law mappings. The platform features user authentication, bookmarking, search functionality, and a modern React-based frontend with FastAPI backend.

---

## 🎯 **Core Features**

### 📚 **Legal Data Access**
- **Court Judgments**: High Court and Supreme Court judgments with advanced filtering
- **Central Acts**: Parliament-enacted laws with search and filtering
- **State Acts**: State-specific legislation
- **Law Mappings**: BSA-IEA and BNS-IPC mappings for legal reference
- **PDF Access**: Direct links to judgment PDFs and act documents

### 🔐 **User Management**
- **Multi-User Types**: Students, Lawyers, Corporate, Others
- **JWT Authentication**: Secure token-based authentication
- **Session Management**: Multi-device session tracking
- **Phone Verification**: SMS-based phone number verification via Twilio

### 🔖 **Bookmarking System**
- **Universal Bookmarking**: Bookmark judgments, acts, and mappings
- **Folder Organization**: Organize bookmarks into custom folders
- **Analytics**: Track bookmark usage and patterns
- **Import/Export**: Backup and restore bookmark data

### 🔍 **Advanced Search & Filtering**
- **Multi-Field Search**: Search by title, judge, court, CNR, etc.
- **Date Range Filtering**: Filter by decision dates and registration dates
- **Court-Specific Filtering**: Filter by specific courts and judges
- **Pagination**: Cursor-based pagination for large datasets

---

## 🏗️ **Technical Architecture**

### **Frontend (React)**
- **Framework**: React 18 with modern hooks
- **Styling**: Tailwind CSS for responsive design
- **Routing**: React Router for navigation
- **State Management**: React Context API for authentication
- **HTTP Client**: Fetch API with custom service layer

### **Backend (FastAPI)**
- **Framework**: FastAPI with async SQLAlchemy
- **Database**: PostgreSQL with async operations
- **Authentication**: JWT tokens with refresh mechanism
- **API Documentation**: Auto-generated Swagger/OpenAPI docs
- **CORS**: Configured for frontend integration

### **External Services**
- **Twilio**: SMS verification service
- **AWS S3**: PDF document storage
- **ngrok**: Development tunneling

---

## 📋 **API Endpoints Reference**

### **Authentication Endpoints**
```
POST /auth/signup          - User registration
POST /auth/login           - User authentication
POST /auth/refresh         - Token refresh
POST /auth/logout          - User logout
GET  /auth/sessions        - Get user sessions
DELETE /auth/sessions/{id} - Delete specific session
POST /auth/send-verification-code - Send SMS code
POST /auth/verify-phone    - Verify phone number
```

### **Data Access Endpoints**
```
GET /api/judgements                    - Court judgments
GET /api/supreme-court-judgements      - Supreme Court judgments
GET /api/acts/central-acts            - Central acts
GET /api/acts/state-acts               - State acts
GET /api/law_mapping                  - Law mappings
```

### **Bookmark Endpoints**
```
POST   /api/bookmarks/judgements/{id}     - Bookmark judgment
DELETE /api/bookmarks/judgements/{id}     - Remove judgment bookmark
POST   /api/bookmarks/acts/{type}/{id}    - Bookmark act
DELETE /api/bookmarks/acts/{type}/{id}    - Remove act bookmark
POST   /api/bookmarks/mappings/{type}/{id} - Bookmark mapping
DELETE /api/bookmarks/mappings/{type}/{id} - Remove mapping bookmark
GET    /api/bookmarks                     - Get user bookmarks
```

---

## 🔧 **Development Setup**

### **Prerequisites**
- Node.js 18+
- Python 3.8+
- PostgreSQL 12+
- ngrok account (for development)

### **Frontend Setup**
```bash
# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build
```

### **Backend Setup**
```bash
# Install Python dependencies
pip install -r requirements.txt

# Set environment variables
export DATABASE_URL="postgresql://user:pass@localhost/legal_db"
export SECRET_KEY="your-secret-key"
export TWILIO_ACCOUNT_SID="your-twilio-sid"
export TWILIO_AUTH_TOKEN="your-twilio-token"

# Run migrations
alembic upgrade head

# Start development server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### **ngrok Setup**
```bash
# Install ngrok
npm install -g ngrok

# Start tunnel
ngrok http 8000

# Update frontend API_BASE_URL with new ngrok URL
```

---

## 📱 **User Interface Components**

### **Landing Page**
- **Hero Section**: Platform introduction and key features
- **Features Section**: Detailed feature explanations
- **Pricing Section**: Subscription plans and pricing
- **Testimonials**: User reviews and feedback
- **FAQ Section**: Common questions and answers

### **Authentication Pages**
- **Login**: Email/password authentication
- **Signup**: Multi-step registration with user type selection
- **Phone Verification**: SMS code verification
- **Password Reset**: Email-based password recovery

### **Dashboard**
- **Navigation**: Sidebar with main sections
- **Quick Stats**: User activity overview
- **Recent Activity**: Latest bookmarks and searches
- **Quick Actions**: Common tasks shortcuts

### **Data Pages**
- **Judgments**: Searchable list with filters
- **Acts**: Central and state acts browser
- **Mappings**: Law mapping reference
- **PDF Viewer**: Integrated PDF viewing

### **Bookmark Management**
- **Bookmark List**: All user bookmarks
- **Folder Management**: Create and organize folders
- **Analytics**: Usage statistics and insights
- 

---

## 🔍 **Search & Filter Capabilities**

### **Judgment Search**
- **Text Search**: Title, judge, court name, CNR
- **Date Filters**: Decision date range, registration date
- **Court Filters**: Specific courts and jurisdictions
- **Judge Filters**: Individual judge names
- **Disposal Filters**: Case outcome types

### **Act Search**
- **Title Search**: Short title and long title
- **Year Filter**: Enactment year range
- **Ministry Filter**: Government ministry
- **Department Filter**: Specific departments
- **Act ID Search**: Specific act identifiers

### **Mapping Search**
- **Section Search**: Source and target sections
- **Subject Search**: Legal subject matter
- **Type Filter**: BSA-IEA or BNS-IPC mappings
- **Cross-Reference**: Bidirectional section mapping

---

## 🔐 **Security Features**

### **Authentication Security**
- **JWT Tokens**: Secure token-based authentication
- **Token Expiration**: 30-minute access tokens, 7-day refresh tokens
- **Session Management**: Multi-device session tracking
- **Password Requirements**: Strong password policies
- **Phone Verification**: SMS-based account verification

### **Data Security**
- **HTTPS Only**: All communications encrypted
- **CORS Protection**: Configured origin restrictions
- **Input Validation**: Server-side validation for all inputs
- **SQL Injection Prevention**: Parameterized queries
- **Rate Limiting**: API rate limiting for abuse prevention

---

## 📊 **Data Models**

### **User Types**
```javascript
const USER_TYPES = {
  STUDENT: 1,      // Law students
  LAWYER: 2,       // Practicing lawyers
  CORPORATE: 3,    // Companies/legal entities
  OTHER: 4         // Other professionals
};
```

### **Judgment Data Structure**
```javascript
{
  id: number,
  judge: string,
  title: string,
  decision_date: string,
  pdf_link: string,
  cnr: string,
  date_of_registration: string,
  disposal_nature: string,
  court_name: string,
  year: number,
  bench: string,
  case_info: string
}
```

### **Act Data Structure**
```javascript
{
  id: number,
  act_id: string,
  short_title: string,
  long_title: string,
  year: number,
  enactment_date: string,
  enforcement_date: string,
  ministry: string,
  department: string,
  pdf_url: string,
  source: string
}
```

---

## 🚀 **Deployment Guide**

### **Frontend Deployment**
```bash
# Build production bundle
npm run build

# Deploy to static hosting (Netlify, Vercel, etc.)
# Upload build/ folder contents
```

### **Backend Deployment**
```bash
# Set production environment variables
export DATABASE_URL="postgresql://prod_user:pass@prod_host/legal_db"
export SECRET_KEY="production-secret-key"

# Run production server
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

### **Database Migration**
```bash
# Run migrations in production
alembic upgrade head

# Create backup
pg_dump legal_db > backup.sql
```

---

## 🧪 **Testing Guide**

### **API Testing**
```bash
# Test health endpoint
curl https://your-api.com/health

# Test authentication
curl -X POST https://your-api.com/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'

# Test data endpoints
curl -H "Authorization: Bearer TOKEN" \
  https://your-api.com/api/judgements?limit=5
```

### **Frontend Testing**
```bash
# Run unit tests
npm test

# Run integration tests
npm run test:integration

# Run e2e tests
npm run test:e2e
```

---

## 📈 **Performance Optimization**

### **Frontend Optimization**
- **Code Splitting**: Lazy loading for route components
- **Image Optimization**: WebP format with fallbacks
- **Caching**: Service worker for offline functionality
- **Bundle Analysis**: Webpack bundle analyzer
- **Tree Shaking**: Remove unused code

### **Backend Optimization**
- **Database Indexing**: Optimized queries with proper indexes
- **Connection Pooling**: Efficient database connections
- **Caching**: Redis for frequently accessed data
- **Async Operations**: Non-blocking I/O operations
- **Pagination**: Cursor-based pagination for large datasets

---

## 🔧 **Troubleshooting**

### **Common Issues**

#### **API Connection Issues**
```javascript
// Check API base URL
console.log('API Base URL:', apiService.baseURL);

// Test connectivity
apiService.checkConnectivity().then(result => {
  console.log('API Status:', result);
});
```

#### **Authentication Issues**
```javascript
// Check token status
const token = localStorage.getItem('access_token');
console.log('Token exists:', !!token);

// Test token validity
apiService.getSessions().then(sessions => {
  console.log('Sessions:', sessions);
}).catch(err => {
  console.error('Auth error:', err);
});
```

#### **Data Loading Issues**
```javascript
// Check API response
apiService.getJudgements({ limit: 1 }).then(data => {
  console.log('API Response:', data);
}).catch(err => {
  console.error('Data error:', err);
});
```

### **Debug Mode**
```javascript
// Enable debug logging
localStorage.setItem('debug', 'true');

// Check console for detailed logs
// All API calls will show detailed information
```

---

## 📚 **User Guide**

### **Getting Started**
1. **Register Account**: Choose user type and complete registration
2. **Verify Phone**: Complete SMS verification
3. **Explore Data**: Browse judgments, acts, and mappings
4. **Create Bookmarks**: Save important items for later
5. **Organize Data**: Create folders and categorize bookmarks

### **Search Tips**
- **Use Keywords**: Search for specific terms in titles or content
- **Filter by Date**: Narrow results by decision or registration date
- **Court-Specific**: Filter by specific courts or judges
- **Combine Filters**: Use multiple filters for precise results

### **Bookmark Management**
- **Create Folders**: Organize bookmarks by topic or case type
- **Add Tags**: Use tags for additional categorization
- **Export Data**: Backup bookmarks for safekeeping
- **Share Bookmarks**: Export and share bookmark collections

---

## 🎯 **Future Enhancements**

### **Planned Features**
- **AI-Powered Search**: Natural language search capabilities
- **Document Analysis**: AI-powered document summarization
- **Case Law Tracking**: Track case updates and amendments
- **Collaboration Tools**: Share and collaborate on legal research
- **Mobile App**: Native mobile applications
- **API Access**: Public API for third-party integrations

### **Technical Improvements**
- **Microservices**: Break down monolithic backend
- **GraphQL**: More flexible API querying
- **Real-time Updates**: WebSocket for live data updates
- **Advanced Analytics**: User behavior and usage analytics
- **Machine Learning**: Predictive search and recommendations

---

## 📞 **Support & Contact**

### **Technical Support**
- **Documentation**: Comprehensive API and user documentation
- **Issue Tracking**: GitHub issues for bug reports
- **Community Forum**: User community for discussions
- **Email Support**: Direct email support for critical issues

### **Development Resources**
- **API Documentation**: `/docs` endpoint for interactive API docs
- **Code Examples**: Sample code for common integrations
- **SDK Libraries**: Client libraries for popular languages
- **Tutorial Videos**: Step-by-step implementation guides

---

## 🏆 **Best Practices**

### **Frontend Development**
- **Component Reusability**: Create reusable UI components
- **Error Handling**: Comprehensive error handling and user feedback
- **Loading States**: Show loading indicators for better UX
- **Responsive Design**: Mobile-first responsive design
- **Accessibility**: WCAG compliance for accessibility

### **Backend Development**
- **API Design**: RESTful API design principles
- **Error Handling**: Consistent error response format
- **Validation**: Input validation and sanitization
- **Logging**: Comprehensive logging for debugging
- **Testing**: Unit and integration test coverage

### **Security Best Practices**
- **Authentication**: Secure authentication and authorization
- **Data Protection**: Encrypt sensitive data
- **Input Validation**: Validate all user inputs
- **Rate Limiting**: Implement rate limiting
- **Security Headers**: Use security headers (CSP, HSTS, etc.)

---

This comprehensive prompt covers all aspects of your legal platform, from technical architecture to user guides and best practices. It serves as a complete reference for development, deployment, and maintenance of the Salhakar legal platform.
