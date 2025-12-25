import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from '../components/landing/Navbar';
// import Footer from '../components/landing/Footer';

const PrivacyPolicy = () => {
  const location = useLocation();

  useEffect(() => {
    // Scroll to privacy-policy-section if hash is present in URL
    if (location.hash === '#privacy-policy-section') {
      setTimeout(() => {
        const element = document.getElementById('privacy-policy-section');
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
      <div id="privacy-policy-section" className="w-full max-w-7xl mx-auto px-4 py-8 border-2 border-gray-200 shadow-lg" style={{ scrollMarginTop: '100px' }}>
          
        <h1 className="text-2xl font-bold mb-4" style={{ color: '#1E65AD', fontFamily: "'Bricolage Grotesque', sans-serif" }}>
          Privacy Policy
        </h1>
        <p className="mb-6" style={{ color: '#8C969F', fontFamily: "'Heebo', sans-serif" }}>
          Last updated: {new Date().toLocaleDateString('en-IN')}
        </p>

        {/* Introduction */}
        <section className=" mb-8">
          <h2 className="text-xl font-bold mb-3" style={{ color: '#1E65AD', fontFamily: "'Heebo', sans-serif" }}>1. Introduction</h2>
          <p className="mb-4" style={{ color: '#8C969F', fontFamily: "'Heebo', sans-serif", lineHeight: '1.6' }}>
            This Privacy Policy ("Policy") describes how ExpertSetu LLP, a limited liability
            partnership registered under the Limited Liability Partnership Act, 2008 and having its
            principal place of business in India ("ExpertSetu", "Company", "we", "our", or "us"),
            collects, uses, stores, discloses, and protects the personal information of users
            ("User", "you", or "your") who access or use our website, platform, mobile applications,
            and associated services ("Services").
          </p>
          <p className="mb-4" style={{ color: '#8C969F', fontFamily: "'Heebo', sans-serif", lineHeight: '1.6' }}>
            By accessing or using the Services, you agree to the collection and use of your personal
            information in accordance with this Policy.
          </p>
          <p className="mb-2" style={{ color: '#8C969F', fontFamily: "'Heebo', sans-serif", lineHeight: '1.6' }}>
            This Policy is prepared in compliance with:
          </p>
          <ul className="list-disc pl-6 mb-4" style={{ color: '#8C969F', fontFamily: "'Heebo', sans-serif", lineHeight: '1.6' }}>
            <li>Digital Personal Data Protection Act, 2023 (DPDP Act)</li>
            <li>Information Technology Act, 2000 and the Information Technology Rules, 2011</li>
            <li>Other applicable data protection regulations within India</li>
          </ul>
        </section>

        {/* Definitions */}
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-3" style={{ color: '#1E65AD', fontFamily: "'Heebo', sans-serif" }}>2. Definitions</h2>
          <p className="mb-4" style={{ color: '#8C969F', fontFamily: "'Heebo', sans-serif", lineHeight: '1.6' }}>For the purpose of this Policy:</p>
          <ul className="space-y-3 mb-4" style={{ color: '#8C969F', fontFamily: "'Heebo', sans-serif", lineHeight: '1.6' }}>
            <li><strong>Personal Data:</strong> Any data about an individual who is identifiable by or in relation to such data.</li>
            <li><strong>Processing:</strong> The collection, storage, use, sharing, or deletion of personal data.</li>
            <li><strong>Data Principal:</strong> The individual to whom the personal data relates (you, the user).</li>
            <li><strong>Data Fiduciary:</strong> ExpertSetu LLP, the entity determining the purpose and means of processing personal data.</li>
            <li><strong>Sensitive Personal Data:</strong> Information such as financial data, passwords, and authentication credentials.</li>
          </ul>
        </section>

        {/* Information We Collect */}
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-3" style={{ color: '#1E65AD', fontFamily: "'Heebo', sans-serif" }}>3. Information We Collect</h2>
          <p className="mb-4" style={{ color: '#8C969F', fontFamily: "'Heebo', sans-serif", lineHeight: '1.6' }}>We may collect and process the following categories of information:</p>
          
          <p className="mb-2 font-semibold" style={{ color: '#1E65AD', fontFamily: "'Heebo', sans-serif" }}>Information You Provide:</p>
          <ul className="list-disc pl-6 mb-4" style={{ color: '#8C969F', fontFamily: "'Heebo', sans-serif", lineHeight: '1.6' }}>
            <li>Name, email address, mobile number</li>
            <li>Account registration details</li>
            <li>Payment and billing information</li>
            <li>Content you upload or input</li>
          </ul>
          
          <p className="mb-2 font-semibold" style={{ color: '#1E65AD', fontFamily: "'Heebo', sans-serif" }}>Information Collected Automatically:</p>
          <ul className="list-disc pl-6 mb-4" style={{ color: '#8C969F', fontFamily: "'Heebo', sans-serif", lineHeight: '1.6' }}>
            <li>Device and browser information</li>
            <li>IP address and geolocation</li>
            <li>Log files and usage statistics</li>
            <li>Cookies and tracking technologies</li>
          </ul>
        </section>

        {/* Purpose and Legal Basis */}
        <section className="mb-8 pt-8">
          <h2 className="text-xl font-bold mb-3" style={{ color: '#1E65AD', fontFamily: "'Heebo', sans-serif" }}>4. Purpose and Legal Basis for Processing</h2>
          <p className="mb-4" style={{ color: '#8C969F', fontFamily: "'Heebo', sans-serif", lineHeight: '1.6' }}>We process personal data only for lawful and legitimate purposes:</p>
          <ol className="list-decimal pl-6 mb-4" style={{ color: '#8C969F', fontFamily: "'Heebo', sans-serif", lineHeight: '1.6' }}>
            <li>Service Delivery</li>
            <li>User Account Management</li>
            <li>AI Personalization</li>
            <li>Communication</li>
            <li>Billing and Payments</li>
            <li>Legal Compliance</li>
            <li>Security</li>
            <li>Analytics and Development</li>
          </ol>
          <p className="mb-4" style={{ color: '#8C969F', fontFamily: "'Heebo', sans-serif", lineHeight: '1.6' }}>
            We rely on user consent, contractual necessity, and legitimate interest as the
            primary legal bases for processing under Indian law.
          </p>
        </section>

        {/* Consent */}
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-3" style={{ color: '#1E65AD', fontFamily: "'Heebo', sans-serif" }}>5. Consent</h2>
          <p className="mb-4" style={{ color: '#8C969F', fontFamily: "'Heebo', sans-serif", lineHeight: '1.6' }}>
            By accessing or using the Services, you consent to the collection and use of your data
            as described herein.
          </p>
          <p className="mb-4" style={{ color: '#8C969F', fontFamily: "'Heebo', sans-serif", lineHeight: '1.6' }}>
            You may withdraw consent at any time by contacting us at{' '}
            <a href="mailto:inquiry@salhakar.com" style={{ color: '#1E65AD', textDecoration: 'underline' }}>
              inquiry@salhakar.com
            </a>.
            However, withdrawal of consent may affect your continued use of certain features or Services.
          </p>
        </section>

        {/* Data Security */}
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-3" style={{ color: '#1E65AD', fontFamily: "'Heebo', sans-serif" }}>9. Data Security</h2>
          <p className="mb-4" style={{ color: '#8C969F', fontFamily: "'Heebo', sans-serif", lineHeight: '1.6' }}>
            We implement technical and organizational measures to safeguard personal data
            against unauthorized access, alteration, disclosure, or destruction:
          </p>
          <ul className="list-disc pl-6 mb-4" style={{ color: '#8C969F', fontFamily: "'Heebo', sans-serif", lineHeight: '1.6' }}>
            <li>Secure servers and data encryption (SSL/TLS)</li>
            <li>Access controls and authentication protocols</li>
            <li>Regular system audits and vulnerability assessments</li>
            <li>Compliance with ISO/IEC 27001-aligned security frameworks</li>
          </ul>
        </section>

        {/* User Rights */}
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-3" style={{ color: '#1E65AD', fontFamily: "'Heebo', sans-serif" }}>10. User Rights Under Indian Law</h2>
          <p className="mb-4" style={{ color: '#8C969F', fontFamily: "'Heebo', sans-serif", lineHeight: '1.6' }}>
            As a data principal under the Digital Personal Data Protection Act, 2023, you have the
            following rights:
          </p>
          <ul className="space-y-3 mb-4" style={{ color: '#8C969F', fontFamily: "'Heebo', sans-serif", lineHeight: '1.6' }}>
            <li><strong>Right to Access:</strong> You may request a copy of your personal data held by us.</li>
            <li><strong>Right to Correction:</strong> You may request correction or updating of inaccurate or incomplete data.</li>
            <li><strong>Right to Erasure:</strong> You may request deletion of your personal data, subject to legal obligations.</li>
            <li><strong>Right to Withdraw Consent:</strong> You may withdraw consent for data processing at any time.</li>
            <li><strong>Right to Grievance Redressal:</strong> You may raise a grievance or complaint regarding data processing.</li>
          </ul>
          <p className="mb-4" style={{ color: '#8C969F', fontFamily: "'Heebo', sans-serif", lineHeight: '1.6' }}>
            Requests can be submitted via email at{' '}
            <a href="mailto:inquiry@salhakar.com" style={{ color: '#1E65AD', textDecoration: 'underline' }}>
              inquiry@salhakar.com
            </a>. We will process such
            requests within a reasonable time frame in accordance with applicable law.
          </p>
        </section>

        {/* Contact Information */}
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-3" style={{ color: '#1E65AD', fontFamily: "'Heebo', sans-serif" }}>17. Contact Information</h2>
          <p className="mb-4" style={{ color: '#8C969F', fontFamily: "'Heebo', sans-serif", lineHeight: '1.6' }}>
            For any questions or clarifications regarding this Policy or our data handling practices,
            please contact:
          </p>
          <p className="mb-2" style={{ color: '#8C969F', fontFamily: "'Heebo', sans-serif", lineHeight: '1.6' }}>
            <strong>ExpertSetu LLP</strong><br />
            Data Protection Team
          </p>
          <p className="mb-2" style={{ color: '#8C969F', fontFamily: "'Heebo', sans-serif", lineHeight: '1.6' }}>
            <strong>Email:</strong>{' '}
            <a href="mailto:inquiry@salhakar.com" style={{ color: '#1E65AD', textDecoration: 'underline' }}>
              inquiry@salhakar.com
            </a>
          </p>
          <p className="mb-4" style={{ color: '#8C969F', fontFamily: "'Heebo', sans-serif", lineHeight: '1.6' }}>
            <strong>Response Time:</strong> Within 48 hours
          </p>
        </section>

        <div className="mt-12 pt-8 text-center">
          <p className="text-sm" style={{ color: '#8C969F', fontFamily: "'Heebo', sans-serif" }}>
            This Privacy Policy is effective as of the date of last update and applies to all users of our Services.
          </p>
        </div>
      </div>
      
    </div>
  );
};

export default PrivacyPolicy;