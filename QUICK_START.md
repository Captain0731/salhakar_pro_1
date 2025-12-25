# सलहाकार - Quick Start Guide

## 🚀 Getting Started

### 1. Start the Development Server
```bash
cd /home/aditya/Downloads/AGL/salhakar
npm start
```

The app will open at `http://localhost:3000`

### 2. Navigation Flow

#### Option A: Login Flow
```
1. Visit http://localhost:3000 (Landing Page)
2. Click "Login" button in the navbar
3. Sign up or Sign in
4. Redirected to Dashboard
5. Use sidebar to navigate features
```

#### Option B: Direct Access
```
1. Visit http://localhost:3000 (Landing Page)
2. Click any Quick Link (Judgment Access, Law Mapping, etc.)
3. Feature page opens with sidebar
4. Navigate between features using sidebar
```

## 📱 Pages Overview

### Public Pages (No Login Required)
- **Landing Page** (`/`) - Beautiful homepage with hero section
- **Login/Signup** (`/login`) - Authentication page
- **All Judgments** (`/all-judgments`) - Browse and search judgments

### Dashboard Pages (With Sidebar)
- **Dashboard** (`/dashboard`) - Main dashboard after login
- **Judgments Access** (`/judgments`) - Access court judgments
- **Legal Reference Library** (`/library`) - Legal resources
- **Old to New Law Mapping** (`/mapping`) - Law changes tracker
- **Legal Document Templates** (`/templates`) - Document templates
- **Youtube Video Summary** (`/videos`) - Video summaries
- **Legal Chatbot** (`/chatbot`) - AI legal assistant

## 🎨 Key Features

### Landing Page
- ✨ Animated gradient design
- 🔍 Search bar with typing animation
- 📱 Fully responsive
- 🔗 Quick links to main features

### Login/Signup
- 🔐 Secure authentication forms
- ✅ Form validation (email, password strength)
- 👁️ Password visibility toggle
- 📝 Profession selection for signup
- 🎭 Smooth animations between sign in/sign up

### Dashboard
- 📊 Sidebar navigation
- 📚 All features accessible
- 🚪 Logout button
- 📱 Collapsible sidebar

## 🎯 User Journeys

### New User
1. Landing Page → Click "Login"
2. Switch to "Sign up" mode
3. Fill form (username, email, password, profession)
4. Submit → Alert "Registration successful"
5. Switch to "Sign in" mode
6. Enter credentials → Dashboard

### Returning User
1. Landing Page → Click "Login"
2. Enter email and password
3. Click "Login" → Dashboard
4. Use sidebar to access features

### Quick Access (No Login)
1. Landing Page → Type in search bar
2. Press enter → All Judgments page
3. Browse and filter judgments
4. Or click Quick Links → Feature pages

## 🎨 Design System

### Colors
- **Primary**: Indigo (#4F46E5) to Pink (#EC4899) gradient
- **Secondary**: Black (#000000) to Dark Gray (#282828)
- **Background**: White to Blue-50 gradient
- **Text**: Gray-800 for headings, Gray-600 for body

### Typography
- **Font**: Poppins (imported via Google Fonts)
- **Headings**: Bold, large sizes (2xl to 6xl)
- **Body**: Regular weight, 1rem to 1.1rem

### Components
- **Buttons**: Rounded-full (pills), gradient backgrounds
- **Cards**: Rounded-lg, shadow-md on hover
- **Inputs**: Rounded-full fields with icons
- **Animations**: Smooth transitions, bounce effects

## 🔧 Customization

### Change Branding
Edit `/src/components/landing/Navbar.jsx`:
```jsx
<span className="text-2xl font-bold">सलहाकार</span>
// Change to your preferred name
```

### Modify Quick Links
Edit `/src/components/landing/QuickLinks.jsx`:
```jsx
const links = [
  { label: "Your Link", path: "/your-path" },
  // Add more links
];
```

### Update Search Animation
Edit `/src/components/landing/SearchBar.jsx`:
```jsx
const sentences = [
  " Your text here",
  " Another option",
];
```

### Add More Menu Items
Edit `/src/components/Sidebar.jsx`:
```jsx
const menuItems = [
  { name: "New Item", icon: YourIcon, path: "/path" },
  // Add more items
];
```

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
# Or use different port
PORT=3001 npm start
```

### Styling Issues
```bash
# Rebuild Tailwind CSS
npm run build
```

### Module Not Found
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Font Awesome Icons Not Showing
Check that Font Awesome CDN is loaded in `public/index.html`:
```html
<script src="https://kit.fontawesome.com/9ed711c3e8.js" crossorigin="anonymous"></script>
```

## 📝 Next Steps

1. **Add Real Authentication**
   - Connect to backend API
   - Implement JWT tokens
   - Add protected routes

2. **Enhance Features**
   - Complete judgment details page
   - Add search functionality
   - Implement filters

3. **Improve UX**
   - Add loading states
   - Error boundaries
   - Toast notifications

4. **Deploy**
   - Build for production: `npm run build`
   - Deploy to Vercel, Netlify, or your preferred host

## 📚 File Structure Reference

```
salhakar/
├── public/
│   └── index.html (with Font Awesome)
├── src/
│   ├── components/
│   │   ├── landing/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Hero.jsx
│   │   │   ├── SearchBar.jsx
│   │   │   └── QuickLinks.jsx
│   │   └── Sidebar.jsx (updated)
│   ├── pages/
│   │   ├── LandingPage.jsx (NEW)
│   │   ├── Login.jsx (NEW)
│   │   ├── Dashboard.jsx
│   │   └── ... other pages
│   ├── App.js (updated with routing)
│   └── index.css
├── tailwind.config.js (updated with animations)
└── package.json
```

## 🎉 You're All Set!

Your सलहाकार app is now integrated with:
- ✅ Beautiful landing page
- ✅ Login/signup functionality
- ✅ Complete navigation system
- ✅ Responsive design
- ✅ Modern UI/UX

Start the server and explore! 🚀


