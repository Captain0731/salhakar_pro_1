import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from '../components/landing/Navbar';
import Footer from '../components/landing/Footer';

const CookiePolicy = () => {
  const location = useLocation();

  useEffect(() => {
    // Scroll to cookie-policy-section if hash is present in URL
    if (location.hash === '#cookie-policy-section') {
      setTimeout(() => {
        const element = document.getElementById('cookie-policy-section');
        if (element) {
          const offset = 100; // Account for navbar height
          const elementPosition = element.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - offset;
          
          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }
      }, 100);
    }
  }, [location.hash]);

  return (
    <div className="min-h-screen pt-28" style={{ backgroundColor: '#F9FAFC' }}>
      <Navbar />
      <div id="cookie-policy-section" className="w-full max-w-7xl mx-auto px-4 py-8 border-2 border-gray-200 shadow-lg" style={{ scrollMarginTop: '100px' }}>
        <h1 className="text-2xl font-bold mb-4" style={{ color: '#1E65AD', fontFamily: "'Bricolage Grotesque', sans-serif" }}>
          Cookie Policy
        </h1>
        <p className="mb-6" style={{ color: '#8C969F', fontFamily: "'Heebo', sans-serif" }}>
          Last updated: {new Date().toLocaleDateString('en-IN')}
        </p>

        {/* Introduction */}
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-3" style={{ color: '#1E65AD', fontFamily: "'Heebo', sans-serif" }}>1. Introduction</h2>
          <p className="mb-4" style={{ color: '#8C969F', fontFamily: "'Heebo', sans-serif", lineHeight: '1.6' }}>
            This Cookie Policy ("Policy") explains how ExpertSetu LLP ("ExpertSetu", "Company",
            "we", "our", or "us") uses cookies, web beacons, pixels, and other tracking technologies
            (collectively, "Cookies") when you visit or use our website, applications, or any online
            services offered through the ExpertSetu AI-powered legal assistance platform
            ("Services").
          </p>
          <p className="mb-4" style={{ color: '#8C969F', fontFamily: "'Heebo', sans-serif", lineHeight: '1.6' }}>
            This Policy should be read together with our Privacy Policy, which provides further
            details on how we collect, process, and protect your personal data.
          </p>
          <p className="mb-4" style={{ color: '#8C969F', fontFamily: "'Heebo', sans-serif", lineHeight: '1.6' }}>
            By continuing to browse or use our website, you consent to the use of cookies in
            accordance with this Policy, unless you disable them through your browser settings.
          </p>
        </section>

        {/* What Are Cookies */}
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-3" style={{ color: '#1E65AD', fontFamily: "'Heebo', sans-serif" }}>2. What Are Cookies</h2>
          <p className="mb-4" style={{ color: '#8C969F', fontFamily: "'Heebo', sans-serif", lineHeight: '1.6' }}>
            Cookies are small text files that are placed on your device (computer, mobile phone, or
            tablet) by a website when you visit it. Cookies help websites function efficiently and
            provide information to the site owners to enhance performance and user experience.
          </p>
          <p className="mb-2" style={{ color: '#8C969F', fontFamily: "'Heebo', sans-serif", lineHeight: '1.6' }}>Cookies may be:</p>
          <ul className="list-disc pl-6 mb-4" style={{ color: '#8C969F', fontFamily: "'Heebo', sans-serif", lineHeight: '1.6' }}>
            <li><strong>Session Cookies:</strong> Temporary cookies that remain on your device only while your session is active and are deleted once you close your browser.</li>
            <li><strong>Persistent Cookies:</strong> Stored on your device for a specific period, allowing the website to remember your preferences on future visits.</li>
            <li><strong>First-party Cookies:</strong> Set directly by the website you are visiting (in this case, ExpertSetu).</li>
            <li><strong>Third-party Cookies:</strong> Placed by third-party service providers such as analytics or advertising networks.</li>
          </ul>
        </section>

        {/* Legal Basis */}
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-3" style={{ color: '#1E65AD', fontFamily: "'Heebo', sans-serif" }}>3. Legal Basis for Using Cookies</h2>
          <p className="mb-4" style={{ color: '#8C969F', fontFamily: "'Heebo', sans-serif", lineHeight: '1.6' }}>
            Under the Digital Personal Data Protection Act, 2023 (DPDP Act) and the Information
            Technology Act, 2000, ExpertSetu uses cookies based on one or more of the following
            legal grounds:
          </p>
          <ol className="list-decimal pl-6 mb-4" style={{ color: '#8C969F', fontFamily: "'Heebo', sans-serif", lineHeight: '1.6' }}>
            <li>User Consent: For non-essential cookies (e.g., analytics, advertising), obtained via consent banners or cookie preferences.</li>
            <li>Legitimate Interest: For cookies essential to secure and deliver our Services effectively.</li>
          </ol>
          <p className="mb-4" style={{ color: '#8C969F', fontFamily: "'Heebo', sans-serif", lineHeight: '1.6' }}>
            Users have the right to withdraw or modify their cookie preferences at any time.
          </p>
        </section>

        {/* Types of Cookies */}
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-3" style={{ color: '#1E65AD', fontFamily: "'Heebo', sans-serif" }}>4. Types of Cookies We Use</h2>
          <p className="mb-4" style={{ color: '#8C969F', fontFamily: "'Heebo', sans-serif", lineHeight: '1.6' }}>We categorize the cookies used on our website as follows:</p>
          
          <p className="mb-2 font-semibold" style={{ color: '#1E65AD', fontFamily: "'Heebo', sans-serif" }}>A. Strictly Necessary Cookies</p>
          <p className="mb-2" style={{ color: '#8C969F', fontFamily: "'Heebo', sans-serif", lineHeight: '1.6' }}>
            These cookies are essential for the operation of our website and platform. They enable
            core functionalities such as secure login, session management, and payment
            processing.
          </p>
          <p className="mb-2" style={{ color: '#8C969F', fontFamily: "'Heebo', sans-serif", lineHeight: '1.6' }}>
            Disabling these cookies may result in parts of the site not functioning properly.
          </p>
          <p className="mb-2" style={{ color: '#8C969F', fontFamily: "'Heebo', sans-serif", lineHeight: '1.6' }}>Examples include:</p>
          <ul className="list-disc pl-6 mb-4" style={{ color: '#8C969F', fontFamily: "'Heebo', sans-serif", lineHeight: '1.6' }}>
            <li>Authentication cookies</li>
            <li>Security and fraud prevention cookies</li>
            <li>Load balancing session identifiers</li>
          </ul>

          <p className="mb-2 font-semibold" style={{ color: '#1E65AD', fontFamily: "'Heebo', sans-serif" }}>B. Functional Cookies</p>
          <p className="mb-2" style={{ color: '#8C969F', fontFamily: "'Heebo', sans-serif", lineHeight: '1.6' }}>
            These cookies allow us to remember your preferences and personalize your experience,
            such as language settings, saved searches, or previously used features.
          </p>
          <p className="mb-2" style={{ color: '#8C969F', fontFamily: "'Heebo', sans-serif", lineHeight: '1.6' }}>
            They help ensure a smoother user experience on repeated visits.
          </p>
          <p className="mb-2" style={{ color: '#8C969F', fontFamily: "'Heebo', sans-serif", lineHeight: '1.6' }}>Examples include:</p>
          <ul className="list-disc pl-6 mb-4" style={{ color: '#8C969F', fontFamily: "'Heebo', sans-serif", lineHeight: '1.6' }}>
            <li>User interface customization cookies</li>
            <li>Preference retention cookies</li>
          </ul>

          <p className="mb-2 font-semibold" style={{ color: '#1E65AD', fontFamily: "'Heebo', sans-serif" }}>C. Performance and Analytics Cookies</p>
          <p className="mb-2" style={{ color: '#8C969F', fontFamily: "'Heebo', sans-serif", lineHeight: '1.6' }}>
            These cookies collect anonymous data on how visitors interact with our website, such
            as pages visited, time spent, and clicks to help us understand usage patterns and
            improve performance.
          </p>
          <p className="mb-2" style={{ color: '#8C969F', fontFamily: "'Heebo', sans-serif", lineHeight: '1.6' }}>
            We use tools such as Google Analytics and Meta Pixel, which may collect anonymized
            information in compliance with their own privacy policies.
          </p>
          <p className="mb-2" style={{ color: '#8C969F', fontFamily: "'Heebo', sans-serif", lineHeight: '1.6' }}>Examples include:</p>
          <ul className="list-disc pl-6 mb-4" style={{ color: '#8C969F', fontFamily: "'Heebo', sans-serif", lineHeight: '1.6' }}>
            <li>Page view tracking cookies</li>
            <li>Traffic source analytics cookies</li>
          </ul>
          <p className="mb-4" style={{ color: '#8C969F', fontFamily: "'Heebo', sans-serif", lineHeight: '1.6' }}>
            Note: No personally identifiable information is collected through these cookies without consent.
          </p>

          <p className="mb-2 font-semibold" style={{ color: '#1E65AD', fontFamily: "'Heebo', sans-serif" }}>D. Advertising and Marketing Cookies</p>
          <p className="mb-2" style={{ color: '#8C969F', fontFamily: "'Heebo', sans-serif", lineHeight: '1.6' }}>
            We may use these cookies to deliver relevant content and advertisements to users and
            measure the effectiveness of our marketing campaigns. These may be set by us or third-
            party partners.
          </p>
          <p className="mb-2" style={{ color: '#8C969F', fontFamily: "'Heebo', sans-serif", lineHeight: '1.6' }}>Examples include:</p>
          <ul className="list-disc pl-6 mb-4" style={{ color: '#8C969F', fontFamily: "'Heebo', sans-serif", lineHeight: '1.6' }}>
            <li>Retargeting or remarketing cookies</li>
            <li>Ad performance tracking cookies</li>
          </ul>
        </section>

        {/* Third-Party Cookies */}
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-3" style={{ color: '#1E65AD', fontFamily: "'Heebo', sans-serif" }}>5. Third-Party Cookies and Tracking Technologies</h2>
          <p className="mb-4" style={{ color: '#8C969F', fontFamily: "'Heebo', sans-serif", lineHeight: '1.6' }}>
            Certain cookies used on our website are placed by third-party service providers,
            including but not limited to:
          </p>
          <ul className="list-disc pl-6 mb-4" style={{ color: '#8C969F', fontFamily: "'Heebo', sans-serif", lineHeight: '1.6' }}>
            <li><strong>Google Analytics:</strong> For site analytics and performance measurement</li>
            <li><strong>Payment Gateways:</strong> Stripe/Razorpay for secure transaction processing</li>
            <li><strong>Meta Pixel:</strong> For social media analytics and marketing</li>
            <li><strong>Other Partners:</strong> Various third-party service providers</li>
          </ul>
          <p className="mb-4" style={{ color: '#8C969F', fontFamily: "'Heebo', sans-serif", lineHeight: '1.6' }}>
            Each third party maintains its own cookie and privacy policies, which we encourage
            users to review separately. ExpertSetu is not responsible for the privacy practices of third-party cookie providers.
          </p>
        </section>

        {/* Managing Cookies */}
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-3" style={{ color: '#1E65AD', fontFamily: "'Heebo', sans-serif" }}>6. Managing Cookies</h2>
          <p className="mb-4" style={{ color: '#8C969F', fontFamily: "'Heebo', sans-serif", lineHeight: '1.6' }}>You have full control over cookie usage. You may:</p>
          <ol className="list-decimal pl-6 mb-4" style={{ color: '#8C969F', fontFamily: "'Heebo', sans-serif", lineHeight: '1.6' }}>
            <li>Modify your browser settings to block, delete, or restrict cookies.</li>
            <li>Use browser plug-ins or add-ons to manage cookie preferences.</li>
            <li>Withdraw previously granted consent through our cookie consent tool (if implemented).</li>
          </ol>
          <p className="mb-4" style={{ color: '#8C969F', fontFamily: "'Heebo', sans-serif", lineHeight: '1.6' }}>
            Please note that disabling certain cookies may impair website functionality or restrict
            access to some platform features.
          </p>
          
          <p className="mb-2 font-semibold" style={{ color: '#1E65AD', fontFamily: "'Heebo', sans-serif" }}>Instructions for common browsers:</p>
          <ul className="list-disc pl-6 mb-4" style={{ color: '#8C969F', fontFamily: "'Heebo', sans-serif", lineHeight: '1.6' }}>
            <li><strong>Chrome:</strong> Settings → Privacy & Security → Cookies and other site data</li>
            <li><strong>Firefox:</strong> Options → Privacy & Security → Cookies and Site Data</li>
            <li><strong>Safari:</strong> Preferences → Privacy → Manage Website Data</li>
            <li><strong>Edge:</strong> Settings → Site Permissions → Cookies and site data</li>
          </ul>
        </section>

        {/* Data Storage and Security */}
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-3" style={{ color: '#1E65AD', fontFamily: "'Heebo', sans-serif" }}>7. Data Storage and Security of Cookie Data</h2>
          <p className="mb-4" style={{ color: '#8C969F', fontFamily: "'Heebo', sans-serif", lineHeight: '1.6' }}>
            Any personal information collected through cookies is treated with the same level of
            security as other data we process.
          </p>
          <p className="mb-4" style={{ color: '#8C969F', fontFamily: "'Heebo', sans-serif", lineHeight: '1.6' }}>
            We implement encryption, access control, and periodic audits to ensure compliance
            with the IT (Reasonable Security Practices and Procedures) Rules, 2011.
          </p>
        </section>

        {/* Data Sharing and Transfer */}
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-3" style={{ color: '#1E65AD', fontFamily: "'Heebo', sans-serif" }}>8. Data Sharing and Transfer</h2>
          <p className="mb-4" style={{ color: '#8C969F', fontFamily: "'Heebo', sans-serif", lineHeight: '1.6' }}>
            Information derived from cookies may be shared with trusted third-party service
            providers solely for the purposes outlined in this Policy, such as analytics or fraud
            prevention.
          </p>
          <p className="mb-4" style={{ color: '#8C969F', fontFamily: "'Heebo', sans-serif", lineHeight: '1.6' }}>
            All such transfers are governed by confidentiality obligations and comply with
            applicable Indian data protection laws.
          </p>
          <p className="mb-4" style={{ color: '#8C969F', fontFamily: "'Heebo', sans-serif", lineHeight: '1.6' }}>
            Currently, all cookie data is processed and stored within India. Any future cross-border
            transfer of data will adhere to the provisions of the Digital Personal Data Protection
            Act, 2023.
          </p>
        </section>

        {/* Changes to Policy */}
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-3" style={{ color: '#1E65AD', fontFamily: "'Heebo', sans-serif" }}>9. Changes to This Policy</h2>
          <p className="mb-4" style={{ color: '#8C969F', fontFamily: "'Heebo', sans-serif", lineHeight: '1.6' }}>
            ExpertSetu reserves the right to update or modify this Cookie Policy at any time to
            reflect changes in technology, legal obligations, or operational practices.
          </p>
          <p className="mb-4" style={{ color: '#8C969F', fontFamily: "'Heebo', sans-serif", lineHeight: '1.6' }}>
            Material updates will be communicated via our website or by email notification.
            Your continued use of our website following such updates constitutes acceptance of
            the revised Policy.
          </p>
        </section>

        {/* Grievance Redressal */}
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-3" style={{ color: '#1E65AD', fontFamily: "'Heebo', sans-serif" }}>10. Grievance Redressal</h2>
          <p className="mb-4" style={{ color: '#8C969F', fontFamily: "'Heebo', sans-serif", lineHeight: '1.6' }}>
            In accordance with Rule 5(9) of the Information Technology (Reasonable Security
            Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011,
            the Company has designated a Grievance Officer for handling privacy and cookie-
            related concerns.
          </p>
          <p className="mb-2" style={{ color: '#8C969F', fontFamily: "'Heebo', sans-serif", lineHeight: '1.6' }}>
            <strong>Grievance Officer:</strong>
          </p>
          <p className="mb-2" style={{ color: '#8C969F', fontFamily: "'Heebo', sans-serif", lineHeight: '1.6' }}>
            <strong>Name:</strong> Mr. Pratham Shah
          </p>
          <p className="mb-2" style={{ color: '#8C969F', fontFamily: "'Heebo', sans-serif", lineHeight: '1.6' }}>
            <strong>Email:</strong>{' '}
            <a href="mailto:inquiry@salhakar.com" style={{ color: '#1E65AD', textDecoration: 'underline' }}>
              inquiry@salhakar.com
            </a>
          </p>
          <p className="mb-2" style={{ color: '#8C969F', fontFamily: "'Heebo', sans-serif", lineHeight: '1.6' }}>
            <strong>Office Hours:</strong> Monday to Friday, 10:00 a.m. to 6:00 p.m. (IST)
          </p>
          <p className="mb-4" style={{ color: '#8C969F', fontFamily: "'Heebo', sans-serif", lineHeight: '1.6' }}>
            All grievances shall be acknowledged within 48 hours and resolved within 30 days of receipt.
          </p>
        </section>

        {/* Governing Law */}
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-3" style={{ color: '#1E65AD', fontFamily: "'Heebo', sans-serif" }}>11. Governing Law and Jurisdiction</h2>
          <p className="mb-4" style={{ color: '#8C969F', fontFamily: "'Heebo', sans-serif", lineHeight: '1.6' }}>
            This Policy shall be governed by and construed in accordance with the laws of India.
            Any disputes arising from or relating to this Policy shall be subject to the exclusive
            jurisdiction of the competent courts in Ahmedabad, Gujarat.
          </p>
        </section>

        {/* Contact Information */}
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-3" style={{ color: '#1E65AD', fontFamily: "'Heebo', sans-serif" }}>12. Contact Information</h2>
          <p className="mb-4" style={{ color: '#8C969F', fontFamily: "'Heebo', sans-serif", lineHeight: '1.6' }}>
            For questions, clarifications, or requests regarding cookie usage or data processing,
            please contact:
          </p>
          <p className="mb-2" style={{ color: '#8C969F', fontFamily: "'Heebo', sans-serif", lineHeight: '1.6' }}>
            <strong>ExpertSetu LLP</strong><br />
            Cookie Policy Team
          </p>
          <p className="mb-2" style={{ color: '#8C969F', fontFamily: "'Heebo', sans-serif", lineHeight: '1.6' }}>
            <strong>Email:</strong>{' '}
            <a href="mailto:inquiry@salhakar.com" style={{ color: '#1E65AD', textDecoration: 'underline' }}>
              inquiry@salhakar.com
            </a>
          </p>
          <p className="mb-4" style={{ color: '#8C969F', fontFamily: "'Heebo', sans-serif", lineHeight: '1.6' }}>
            <strong>Office Hours:</strong> Monday to Friday, 10:00 a.m. to 6:00 p.m. (IST)
          </p>
        </section>

        <div className="mt-12 pt-8 text-center">
          <p className="text-sm" style={{ color: '#8C969F', fontFamily: "'Heebo', sans-serif" }}>
            This Cookie Policy is effective as of the date of last update and applies to all users of our Services.
          </p>
        </div>
      </div>
     
    </div>
  );
};

export default CookiePolicy;
