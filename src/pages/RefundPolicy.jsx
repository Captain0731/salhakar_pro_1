import React from 'react';
import Navbar from '../components/landing/Navbar';
import Footer from '../components/landing/Footer';

const RefundPolicy = () => {
  return (
    <div className="min-h-screen pt-28" style={{ backgroundColor: '#F9FAFC' }}>
      <Navbar />
      <div className="w-full max-w-7xl mx-auto px-4 py-8 border-2 border-gray-200 shadow-lg">
        <h1 className="text-2xl font-bold mb-4" style={{ color: '#1E65AD', fontFamily: "'Bricolage Grotesque', sans-serif" }}>
          Refund Policy
        </h1>
        <p className="mb-6" style={{ color: '#8C969F', fontFamily: "'Heebo', sans-serif" }}>
          Last updated: {new Date().toLocaleDateString('en-IN')}
        </p>

        {/* Introduction */}
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-3" style={{ color: '#1E65AD', fontFamily: "'Heebo', sans-serif" }}>1. Introduction</h2>
          <p className="mb-4" style={{ color: '#8C969F', fontFamily: "'Heebo', sans-serif", lineHeight: '1.6' }}>
            This Refund Policy ("Policy") outlines the terms and conditions under which
            ExpertSetu LLP ("Company", "ExpertSetu", "we", "our", or "us") provides refunds for
            payments made for the use of our website, mobile application, and AI-powered legal
            assistance platform ("Services").
          </p>
          <p className="mb-4" style={{ color: '#8C969F', fontFamily: "'Heebo', sans-serif", lineHeight: '1.6' }}>
            By subscribing to, purchasing, or using any of our Services, you acknowledge that you
            have read, understood, and agreed to this Policy.
          </p>
          <p className="mb-4" style={{ color: '#8C969F', fontFamily: "'Heebo', sans-serif", lineHeight: '1.6' }}>
            This Policy forms an integral part of our Terms of Service and must be read together
            with our Privacy Policy and Cookie Policy.
          </p>
        </section>

        {/* Nature of Services */}
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-3" style={{ color: '#1E65AD', fontFamily: "'Heebo', sans-serif" }}>2. Nature of Our Services</h2>
          <p className="mb-4" style={{ color: '#8C969F', fontFamily: "'Heebo', sans-serif", lineHeight: '1.6' }}>
            ExpertSetu provides AI-driven legal assistance and SaaS-based solutions intended to
            help users access, organize, and research legal information efficiently.
          </p>
          <p className="mb-4" style={{ color: '#8C969F', fontFamily: "'Heebo', sans-serif", lineHeight: '1.6' }}>
            Given the intangible, digital, and subscription-based nature of these services, we do
            not provide refunds once a payment or subscription has been successfully processed.
          </p>
        </section>

        {/* No Refund Policy */}
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-3" style={{ color: '#1E65AD', fontFamily: "'Heebo', sans-serif" }}>3. No Refund Policy</h2>
          <p className="mb-4" style={{ color: '#8C969F', fontFamily: "'Heebo', sans-serif", lineHeight: '1.6' }}>
            All payments made for any subscription plan, credit purchase, consultation, or
            custom legal data access on the ExpertSetu platform are final and non-refundable.
          </p>
          <p className="mb-2" style={{ color: '#8C969F', fontFamily: "'Heebo', sans-serif", lineHeight: '1.6' }}>Once a service is purchased or activated:</p>
          <ul className="list-disc pl-6 mb-4" style={{ color: '#8C969F', fontFamily: "'Heebo', sans-serif", lineHeight: '1.6' }}>
            <li>No refund or cancellation will be permitted, whether partially or in full.</li>
            <li>This applies even if the user does not utilize or access the service after purchase.</li>
          </ul>
          <p className="mb-4" style={{ color: '#8C969F', fontFamily: "'Heebo', sans-serif", lineHeight: '1.6' }}>
            We strongly encourage users to review the service details, pricing, and features
            before completing a transaction.
          </p>
        </section>

        {/* Exceptions */}
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-3" style={{ color: '#1E65AD', fontFamily: "'Heebo', sans-serif" }}>4. Exceptions</h2>
          <p className="mb-4" style={{ color: '#8C969F', fontFamily: "'Heebo', sans-serif", lineHeight: '1.6' }}>
            Notwithstanding the above, refunds may be issued only under the following limited
            circumstances:
          </p>
          
          <p className="mb-2 font-semibold" style={{ color: '#1E65AD', fontFamily: "'Heebo', sans-serif" }}>A. Duplicate Payment</p>
          <p className="mb-4" style={{ color: '#8C969F', fontFamily: "'Heebo', sans-serif", lineHeight: '1.6' }}>
            If a user is charged more than once for the same transaction due to a technical or
            payment gateway error, we will refund the duplicate amount upon verification.
          </p>

          <p className="mb-2 font-semibold" style={{ color: '#1E65AD', fontFamily: "'Heebo', sans-serif" }}>B. Incorrect or Failed Transaction</p>
          <p className="mb-4" style={{ color: '#8C969F', fontFamily: "'Heebo', sans-serif", lineHeight: '1.6' }}>
            If a transaction fails but the payment is still debited from your account, and the service
            is not delivered, the amount will be refunded once confirmed by our payment
            processor.
          </p>

          <p className="mb-2 font-semibold" style={{ color: '#1E65AD', fontFamily: "'Heebo', sans-serif" }}>C. Unauthorized Payment</p>
          <p className="mb-4" style={{ color: '#8C969F', fontFamily: "'Heebo', sans-serif", lineHeight: '1.6' }}>
            If a payment is made without the account holder's authorization and is reported within 7
            working days, we will investigate and issue a refund if verified as unauthorized.
          </p>

          <p className="mb-2" style={{ color: '#8C969F', fontFamily: "'Heebo', sans-serif", lineHeight: '1.6' }}>Note:</p>
          <p className="mb-4" style={{ color: '#8C969F', fontFamily: "'Heebo', sans-serif", lineHeight: '1.6' }}>
            All refund requests under these exceptions must be supported by relevant transaction
            details (payment receipt, order ID, or screenshot).
          </p>
        </section>

        {/* Refund Request Procedure */}
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-3" style={{ color: '#1E65AD', fontFamily: "'Heebo', sans-serif" }}>5. Refund Request Procedure</h2>
          <p className="mb-4" style={{ color: '#8C969F', fontFamily: "'Heebo', sans-serif", lineHeight: '1.6' }}>To request a refund under the above exceptions, users must:</p>
          
          <ol className="list-decimal pl-6 mb-4" style={{ color: '#8C969F', fontFamily: "'Heebo', sans-serif", lineHeight: '1.6' }}>
            <li>Send an email to <a href="mailto:inquiry@salhakar.com" style={{ color: '#1E65AD', textDecoration: 'underline' }}>inquiry@salhakar.com</a> with the subject line: "Refund Request – [Transaction ID]"</li>
            <li>Provide:
              <ul className="list-disc pl-6 mt-2">
                <li>Full name and registered email address</li>
                <li>Payment ID or transaction reference</li>
                <li>Reason for refund request</li>
                <li>Supporting evidence (such as payment confirmation, error message, or gateway reference)</li>
              </ul>
            </li>
          </ol>

          <p className="mb-2" style={{ color: '#8C969F', fontFamily: "'Heebo', sans-serif", lineHeight: '1.6' }}>Refund requests will be reviewed by our support and finance teams.</p>
          <ul className="list-disc pl-6 mb-4" style={{ color: '#8C969F', fontFamily: "'Heebo', sans-serif", lineHeight: '1.6' }}>
            <li>Acknowledgment of the request will be sent within 48 business hours</li>
            <li>Approved refunds will be processed within 7 to 14 working days, depending on your bank or payment provider</li>
          </ul>
        </section>

        {/* Refund Mode and Timeline */}
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-3" style={{ color: '#1E65AD', fontFamily: "'Heebo', sans-serif" }}>6. Refund Mode and Timeline</h2>
          <p className="mb-4" style={{ color: '#8C969F', fontFamily: "'Heebo', sans-serif", lineHeight: '1.6' }}>
            Approved refunds will be made only through the original payment method used
            during the transaction.
          </p>
          <p className="mb-4" style={{ color: '#8C969F', fontFamily: "'Heebo', sans-serif", lineHeight: '1.6' }}>
            No cash or alternate refund channels will be provided.
          </p>
          
          <p className="mb-2 font-semibold" style={{ color: '#1E65AD', fontFamily: "'Heebo', sans-serif" }}>Processing timelines may vary based on the payment method:</p>
          <ul className="list-disc pl-6 mb-4" style={{ color: '#8C969F', fontFamily: "'Heebo', sans-serif", lineHeight: '1.6' }}>
            <li><strong>UPI/Credit Card/Debit Card:</strong> 7–10 working days</li>
            <li><strong>Net Banking or Wallet Payments:</strong> 10–14 working days</li>
          </ul>
        </section>

        {/* Non-Eligible Transactions */}
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-3" style={{ color: '#1E65AD', fontFamily: "'Heebo', sans-serif" }}>7. Non-Eligible Transactions</h2>
          <p className="mb-4" style={{ color: '#8C969F', fontFamily: "'Heebo', sans-serif", lineHeight: '1.6' }}>Refunds will not be provided for the following situations:</p>
          <ul className="list-disc pl-6 mb-4" style={{ color: '#8C969F', fontFamily: "'Heebo', sans-serif", lineHeight: '1.6' }}>
            <li>Change of mind or dissatisfaction with features</li>
            <li>User error or incorrect data input</li>
            <li>Service interruptions or delays due to internet or device issues</li>
            <li>Account suspension or termination due to violation of Terms of Service</li>
            <li>Expired or unused subscription credits</li>
          </ul>
        </section>

        {/* Cancellation of Subscription */}
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-3" style={{ color: '#1E65AD', fontFamily: "'Heebo', sans-serif" }}>8. Cancellation of Subscription</h2>
          <p className="mb-4" style={{ color: '#8C969F', fontFamily: "'Heebo', sans-serif", lineHeight: '1.6' }}>
            Users may choose to cancel their subscription or recurring plan at any time.
          </p>
          <p className="mb-4" style={{ color: '#8C969F', fontFamily: "'Heebo', sans-serif", lineHeight: '1.6' }}>
            However, cancellation will only stop future renewals — it will not trigger a refund for
            the current billing period.
          </p>
          <p className="mb-4" style={{ color: '#8C969F', fontFamily: "'Heebo', sans-serif", lineHeight: '1.6' }}>
            Access to paid features will continue until the subscription term expires.
          </p>
        </section>

        {/* Governing Law */}
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-3" style={{ color: '#1E65AD', fontFamily: "'Heebo', sans-serif" }}>9. Governing Law and Jurisdiction</h2>
          <p className="mb-4" style={{ color: '#8C969F', fontFamily: "'Heebo', sans-serif", lineHeight: '1.6' }}>
            This Policy shall be governed by and construed in accordance with the laws of India,
            without regard to conflict of law principles.
          </p>
          <p className="mb-4" style={{ color: '#8C969F', fontFamily: "'Heebo', sans-serif", lineHeight: '1.6' }}>
            Any disputes, claims, or proceedings arising out of or relating to this Policy shall be
            subject to the exclusive jurisdiction of the competent courts located in Ahmedabad,
            Gujarat.
          </p>
        </section>

        {/* Contact Information */}
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-3" style={{ color: '#1E65AD', fontFamily: "'Heebo', sans-serif" }}>10. Contact Information</h2>
          <p className="mb-4" style={{ color: '#8C969F', fontFamily: "'Heebo', sans-serif", lineHeight: '1.6' }}>
            For refund-related queries, disputes, or support, please contact:
          </p>
          <p className="mb-2" style={{ color: '#8C969F', fontFamily: "'Heebo', sans-serif", lineHeight: '1.6' }}>
            <strong>ExpertSetu LLP</strong><br />
            Refund Support Team
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

        {/* Grievance Officer */}
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-3" style={{ color: '#1E65AD', fontFamily: "'Heebo', sans-serif" }}>11. Grievance Officer</h2>
          <p className="mb-4" style={{ color: '#8C969F', fontFamily: "'Heebo', sans-serif", lineHeight: '1.6' }}>
            In compliance with Rule 5(9) of the Information Technology (Reasonable Security
            Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011,
            and Section 13(2) of the Digital Personal Data Protection Act, 2023, the following
            officer has been appointed to handle user grievances and payment-related issues:
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
            All grievances will be acknowledged within 48 hours and resolved within 30 days of receipt.
          </p>
        </section>

        <div className="mt-12 pt-8 text-center">
          <p className="text-sm" style={{ color: '#8C969F', fontFamily: "'Heebo', sans-serif" }}>
            This Refund Policy is effective as of the date of last update and applies to all users of our Services.
          </p>
        </div>
      </div>
     
    </div>
  );
};

export default RefundPolicy;
