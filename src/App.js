// App.js
import { Routes, Route, useLocation } from "react-router-dom";
import { useEffect, lazy, Suspense, useState } from "react";
import { AuthProvider } from "./contexts/AuthContext";
import { NotificationProvider } from "./contexts/NotificationContext";

const GoogleTranslate = lazy(() => import("./components/GoogleTranslate"));
const ReviewPopup = lazy(() => import("./components/ReviewPopup"));
const LandingPage = lazy(() => import("./pages/LandingPage"));
const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const LegalJudgments = lazy(() => import("./pages/LegalJudgments"));
const ViewPDF = lazy(() => import("./pages/ViewPDF"));
const BrowseActs = lazy(() => import("./pages/BrowseActs"));
const LawLibrary = lazy(() => import("./pages/LawLibrary"));
const ActDetails = lazy(() => import("./pages/ActDetails"));
const MappingDetails = lazy(() => import("./pages/MappingDetails"));
const LawMapping = lazy(() => import("./pages/LawMapping"));
const LegalTemplate = lazy(() => import("./pages/LegalTemplate"));
const DocumentEditor = lazy(() => import("./pages/DocumentEditor"));
const YoutubeVideoSummary = lazy(() => import("./pages/YoutubeVideoSummary"));
const LegalChatbot = lazy(() => import("./pages/LegalChatbot"));
const Profile = lazy(() => import("./pages/Profile"));
const Bookmarks = lazy(() => import("./pages/Bookmarks"));
const About = lazy(() => import("./pages/About"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const CookiePolicy = lazy(() => import("./pages/CookiePolicy"));
const RefundPolicy = lazy(() => import("./pages/RefundPolicy"));
const Referral = lazy(() => import("./pages/Referral"));
const OurTeam = lazy(() => import("./pages/OurTeam"));
const PricingPage = lazy(() => import("./pages/PricingPage"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const NotesPage = lazy(() => import("./pages/NotesPage"));
const LanguageSelectorDemo = lazy(() => import("./pages/LanguageSelectorDemo"));
const Blog = lazy(() => import("./pages/Blog"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const Support = lazy(() => import("./pages/Support"));
const NotFound = lazy(() => import("./pages/NotFound"));
const ProtectedRoute = lazy(() => import("./components/ProtectedRoute"));
const Chatbot = lazy(() => import("./components/Chatbot"));
const Footer = lazy(() => import("./components/landing/Footer"));
const CookieConsentPopup = lazy(() => import("./components/CookieConsentPopup"));

// ScrollToTop component to reset scroll position on route change with smooth behavior
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Smooth scroll window to top
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    
    // Also reset any scroll containers with smooth behavior
    const scrollContainers = [
      document.getElementById('main-scroll-area'),
      document.getElementById('chatbot-scroll-area'),
      document.querySelector('[data-scroll-container]')
    ];
    
    scrollContainers.forEach(container => {
      if (container) {
        container.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
      }
    });
    
    // Also reset document element scroll smoothly
    const smoothScrollToTop = () => {
      const currentScroll = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop;
      if (currentScroll > 0) {
        window.requestAnimationFrame(smoothScrollToTop);
        window.scrollTo(0, currentScroll - (currentScroll / 8));
      }
    };
    
    // Use smooth scroll animation
    smoothScrollToTop();
  }, [pathname]);

  return null;
}

function AppLayout() {
  const location = useLocation();
  
  // Restore previous language when navigating away from chatbot
  useEffect(() => {
    const currentPath = location.pathname;
    const isOnChatbotPage = currentPath === '/legal-chatbot' || currentPath === '/chatbot';
    
    // If we're not on chatbot page, check if we need to restore previous language
    if (!isOnChatbotPage) {
      // Check if we've already restored (prevent multiple restorations)
      const hasRestored = sessionStorage.getItem('languageRestored');
      
      if (!hasRestored) {
        const previousLang = localStorage.getItem('previousLanguageBeforeChatbot');
        
        if (previousLang && previousLang !== 'en') {
          const langCode = previousLang;
          
          // Mark as restored to prevent multiple attempts
          sessionStorage.setItem('languageRestored', 'true');
          
          // Helper function to set cookie with proper attributes
          const setCookie = (name, value, days = 365) => {
            if (typeof window === 'undefined') return;
            
            const expires = new Date();
            expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
            
            const hostname = window.location.hostname;
            const domain = hostname.includes('localhost') || hostname.includes('127.0.0.1') 
              ? '' 
              : hostname.split('.').slice(-2).join('.');
            
            let cookieString = `${name}=${value}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
            
            if (window.location.protocol === 'https:') {
              cookieString += '; Secure';
            }
            
            if (domain && !hostname.includes('localhost')) {
              cookieString += `; domain=.${domain}`;
            }
            
            document.cookie = cookieString;
            
            try {
              localStorage.setItem('selectedLanguage', langCode);
            } catch (e) {
              console.warn('localStorage not available:', e);
            }
          };
          
          // Restore previous language
          setCookie('googtrans', `/en/${langCode}`, 365);
          
          // Clear the stored previous language
          localStorage.removeItem('previousLanguageBeforeChatbot');
          
          // Reload to apply the restored language
          window.location.reload();
          return; // Exit early to prevent further execution
        }
      }
    } else {
      // If we're on chatbot page, clear the restoration flag
      sessionStorage.removeItem('languageRestored');
    }
  }, [location.pathname]);
  
  // Pages where chatbot should be hidden
  const hideChatbotPaths = [
    '/login',
    '/signup',
    '/judgment',
    '/acts',
    '/mapping-details',
    '/law-library',
    '/legal-chatbot',
    '/law-mapping',
    '/dashboard',
    '/profile',
    '/document-editor'
  ];
  
  // Pages where footer should be hidden
  const hideFooterPaths = [
    '/login',
    '/signup',
    '/dashboard',
    '/profile',
    '/judgment-access',
    '/judgment',
    '/acts',
    '/mapping-details',
    '/law-library',
    '/legal-chatbot',
    '/law-mapping',
    '/legal-template',
    '/document-editor'
  ];
  
  const shouldShowChatbot = !hideChatbotPaths.some(path => location.pathname.startsWith(path));
  const shouldShowFooter = !hideFooterPaths.some(path => {
    // Match exact path or paths that start with the excluded path followed by '/'
    return location.pathname === path || location.pathname.startsWith(path + '/');
  });
  
  return (
    <div style={{ minHeight: "100vh", overflowY: "auto", overflowX: "hidden", width: "100%", maxWidth: "100vw", scrollbarWidth: "none", msOverflowStyle: "none" }} className="scrollbar-hide">
      {/* Scroll to top on route change */}
      <ScrollToTop />
      <Suspense fallback={
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          background: 'linear-gradient(135deg, #f8fafc 0%, #e0e7ef 100%)',
          fontFamily: 'inherit',
        }}>
          <video 
            autoPlay 
            loop 
            muted 
            playsInline
            style={{
              width: '300px',
              height: '300px',
              objectFit: 'contain'
            }}
          >
          </video>
        </div>
      }>
        {/* Google Translate Component - Global mount point */}
        <GoogleTranslate />
        {/* Cookie Consent Popup - Shows on first visit */}
        <CookieConsentPopup />
        {/* Review Popup - Shows every 5 min (not logged in) or 10 min (logged in) */}
        <ReviewPopup />
        {/* Chatbot Icon - Fixed position on all pages except specified ones */}
        {shouldShowChatbot && <Chatbot />}
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/home" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/about" element={<About />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:id" element={<BlogPost />} />
          <Route path="/support" element={<Support />} />
          <Route path="/our-team" element={<OurTeam />} />
          <Route path="/language-demo" element={<LanguageSelectorDemo />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />
          <Route path="/cookie-policy" element={<CookiePolicy />} />
          <Route path="/refund-policy" element={<RefundPolicy />} />
          {/* Public Routes - No Authentication Required */}
          <Route path="/judgment/supreme-court/:id" element={<ViewPDF />} />
          <Route path="/judgment/high-court/:id" element={<ViewPDF />} />
          <Route path="/judgment/:id?" element={<ViewPDF />} /> {/* Fallback for backward compatibility */}
          <Route path="/law-library" element={<LawLibrary />} />
          <Route path="/browse-acts" element={<BrowseActs />} />
          <Route path="/acts/central/:id" element={<ActDetails />} />
          <Route path="/acts/state/:id" element={<ActDetails />} />
          <Route path="/acts/:id" element={<ActDetails />} /> {/* Fallback for backward compatibility */}
          <Route path="/mapping-details" element={<MappingDetails />} />
          <Route path="/law-mapping" element={<LawMapping />} />
          <Route path="/legal-template" element={<LegalTemplate />} />
          <Route path="/document-editor" element={<DocumentEditor />} />
          <Route path="/youtube-summary" element={<YoutubeVideoSummary />} />
          <Route path="/legal-chatbot" element={<LegalChatbot />} />
          <Route path="/profile" element={<Profile />} />
          {/* Additional Routes for Navigation */}
          <Route path="/judgment-access" element={<LegalJudgments />} />
          <Route path="/bookmarks" element={<Bookmarks />} />
          {/* <Route path="/invite-friends" element={<InviteFriends />} /> */}
          {/* <Route path="/earn-rewards" element={<EarnRewards />} /> */}
          {/* <Route path="/track-referrals" element={<TrackReferrals />} /> */}
          {/* Dashboard - Public Route (no login required) */}
          <Route path="/dashboard" element={<Dashboard />} />
          {/* Protected Routes - Authentication Required */}
          <Route path="/notes/:id" element={<ProtectedRoute><NotesPage /></ProtectedRoute>} />
          {/* Referral Program Routes */}
          <Route path="/referral" element={<Referral />} />
          {/* <Route path="/referral/invite" element={<InviteFriends />} /> */}
          {/* <Route path="/referral/rewards" element={<EarnRewards />} /> */}
          {/* <Route path="/referral/track" element={<TrackReferrals />} /> */}
          {/* {chatbot routes} */}
          <Route path="/chatbot" element={<LegalChatbot />} />
          {/* 404 - Catch all unmatched routes */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        {/* Footer - Show on all pages except login, signup, dashboard, and profile */}
        {shouldShowFooter && <Footer />}
      </Suspense>
    </div>
  );
}

// Startup Loading Screen Component
function StartupLoader({ onComplete }) {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Show loader for at least 2.5 seconds, then fade out
    const timer = setTimeout(() => {
      setFadeOut(true);
      setTimeout(() => {
        onComplete();
      }, 400); // Wait for fade animation
    }, 2500);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #1E65AD 0%, #2a7bc8 50%, #1E65AD 100%)',
        zIndex: 9999,
        transition: 'opacity 0.4s ease-out',
        opacity: fadeOut ? 0 : 1,
        pointerEvents: fadeOut ? 'none' : 'auto',
      }}
    >
      {/* Logo Image */}
      <div
        style={{
          width: '280px',
          height: '120px',
          marginBottom: '40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          animation: 'fadeInScale 0.8s ease-out',
        }}
      >
        <img
          src="/main4.PNG"
          alt="Salhakar"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            filter: 'brightness(0) invert(1)',
          }}
        />
      </div>

      {/* Loading Spinner */}
      <div
        style={{
          width: '60px',
          height: '60px',
          position: 'relative',
          marginTop: '20px',
        }}
      >
        <div
          style={{
            width: '100%',
            height: '100%',
            border: '4px solid rgba(255, 255, 255, 0.2)',
            borderTop: '4px solid #CF9B63',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
          }}
        />
      </div>

      {/* Loading Text */}
      <p
        style={{
          marginTop: '30px',
          fontSize: '16px',
          color: 'rgba(255, 255, 255, 0.9)',
          fontFamily: 'Roboto, sans-serif',
          letterSpacing: '0.5px',
          animation: 'fadeIn 1s ease-out 0.3s both',
        }}
      >
        Loading...
      </p>

      {/* CSS Animations */}
      <style>{`
        @keyframes fadeInScale {
          0% {
            opacity: 0;
            transform: scale(0.8);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
        @keyframes fadeIn {
          0% {
            opacity: 0;
          }
          100% {
            opacity: 1;
          }
        }
        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}

export default function App() {
  const [showStartupLoader, setShowStartupLoader] = useState(true);

  return (
    <AuthProvider>
      <NotificationProvider>
        {showStartupLoader && (
          <StartupLoader onComplete={() => setShowStartupLoader(false)} />
        )}
        {!showStartupLoader && <AppLayout />}
      </NotificationProvider>
    </AuthProvider>
  );
}
