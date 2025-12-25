import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Linkedin, Youtube, Mail, Phone, MapPin, Instagram } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleSubscribe = () => {
    if (isAuthenticated) {
      navigate("/");
    } else {
      navigate("/login");
    }
  };

  const footerLinks = {
    services: [
      { name: "Legal Judgment", href: "/judgment-access" },
      { name: "Law Library", href: "/law-library" },
      { name: "Law Mapping", href: "/law-mapping" },
      { name: "YouTube Summarizer", href: "/youtube-summary" }
    ],
    company: [
      { name: "About Us", href: "/about" },
      { name: "Our Team", href: "/about#our-team" },
      { name: "Careers", href: "/about#careers" },
      { name: "Blog", href: "/blog" }
    ],
    legal: [
      { name: "Privacy Policy", href: "/privacy-policy#privacy-policy-section" },
      { name: "Terms of Service", href: "/terms-of-service#terms-of-service-section" },
      { name: "Cookie Policy", href: "/cookie-policy#cookie-policy-section" }
    ]
  };

  const socialLinks = [
    { name: "LinkedIn", icon: Linkedin, href: "https://www.linkedin.com/company/salhakar/" },
    { name: "Twitter", icon: null, image: "/twitter.png", href: "https://x.com/Salhakar_legal" },
    { name: "Instagram", icon: Instagram, href: "https://www.instagram.com/salhakar.legal/" },
    { name: "YouTube", icon: Youtube, href: "#youtube" }
  ];
  
  const contactInfo = [
    { icon: Mail, text: "inquiry@salhakar.com" },
    { icon: Phone, text: "+91 7069900088" },
    { icon: MapPin, text: "Gandhinagar, Gujarat, India" }
  ];

  return (
    <footer 
      className="relative"
      style={{ 
        backgroundColor: '#1E65AD',
        opacity: 1,
        visibility: 'visible',
        transition: 'none',
        willChange: 'auto'
      }}
    >
      {/* Subtle Top Border */}
      <div 
        className="w-full h-px"
        style={{ 
          background: 'linear-gradient(90deg, transparent, rgba(207, 155, 99, 0.3), transparent)'
        }}
      ></div>

      <div 
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16"
        style={{
          opacity: 1,
          visibility: 'visible',
          transition: 'none',
          willChange: 'auto'
        }}
      >
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 lg:gap-12 mb-10 sm:mb-12">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <div className="mb-6">
              <img 
                src="/main4.PNG" 
                alt="Salhakar" 
                className="h-16 sm:h-20 object-contain mb-4" 
                loading="eager"
                decoding="sync"
                fetchPriority="high"
                style={{ 
                  opacity: 1, 
                  visibility: 'visible',
                  animation: 'none',
                  transition: 'none',
                  transform: 'none',
                  willChange: 'auto',
                  display: 'block'
                }}
              />
              
              <p 
                className="text-sm sm:text-base leading-relaxed mb-6 max-w-md"
                style={{ 
                  color: 'rgba(255, 255, 255, 0.85)', 
                  fontFamily: 'Heebo, sans-serif',
                  opacity: 1,
                  visibility: 'visible',
                  animation: 'none',
                  transition: 'none'
                }}
              >
                Empowering legal professionals with AI-driven research tools, 
                comprehensive judgment access, and modern practice management solutions.
              </p>
            </div>

            {/* Contact Information */}
            <div className="space-y-3 mb-6">
              {contactInfo.map((contact, index) => {
                const IconComponent = contact.icon;
                return (
                  <div key={index} className="flex items-start">
                    <IconComponent 
                      className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" 
                      style={{ color: '#CF9B63' }} 
                    />
                    <span 
                      className="text-sm sm:text-base"
                      style={{ 
                        color: 'rgba(255, 255, 255, 0.9)', 
                        fontFamily: 'Roboto, sans-serif',
                        lineHeight: '1.5'
                      }}
                    >
                      {contact.text}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Social Links */}
            <div className="flex space-x-3">
              {socialLinks.map((social, index) => {
                const IconComponent = social.icon;
                return (
                  <a
                    key={index}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300"
                    style={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.1)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#CF9B63';
                      e.currentTarget.style.borderColor = '#CF9B63';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                    aria-label={social.name}
                  >
                    {social.image ? (
                      <img 
                        src={social.image} 
                        alt={social.name}
                        className="w-5 h-5 object-contain"
                        style={{ 
                          filter: 'brightness(0) invert(1)',
                          opacity: 0.9
                        }}
                      />
                    ) : (
                      <IconComponent className="w-5 h-5" style={{ color: 'rgba(255, 255, 255, 0.9)' }} />
                    )}
                  </a>
                );
              })}
            </div>
          </div>

          {/* Services Links */}
          <div>
            <h4 
              className="text-base sm:text-lg font-semibold mb-5 sm:mb-6"
              style={{ 
                color: 'white', 
                fontFamily: "'Bricolage Grotesque', sans-serif",
                letterSpacing: '0.02em'
              }}
            >
              Services
            </h4>
            <ul className="space-y-3">
              {footerLinks.services.map((link, index) => (
                <li key={index}>
                  <Link
                    to={link.href}
                    className="text-sm sm:text-base transition-colors duration-200 inline-block"
                    style={{ 
                      color: 'rgba(255, 255, 255, 0.8)', 
                      fontFamily: 'Roboto, sans-serif'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.color = '#CF9B63';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.color = 'rgba(255, 255, 255, 0.8)';
                    }}
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 
              className="text-base sm:text-lg font-semibold mb-5 sm:mb-6"
              style={{ 
                color: 'white', 
                fontFamily: "'Bricolage Grotesque', sans-serif",
                letterSpacing: '0.02em'
              }}
            >
              Company
            </h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link, index) => (
                <li key={index}>
                  <Link
                    to={link.href}
                    className="text-sm sm:text-base transition-colors duration-200 inline-block"
                    style={{ 
                      color: 'rgba(255, 255, 255, 0.8)', 
                      fontFamily: 'Roboto, sans-serif'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.color = '#CF9B63';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.color = 'rgba(255, 255, 255, 0.8)';
                    }}
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Newsletter Section */}
        <div 
          className="py-6 sm:py-8 border-t"
          style={{ 
            borderColor: 'rgba(255, 255, 255, 0.15)',
            marginTop: '2rem'
          }}
        >
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="text-center lg:text-left w-full lg:w-auto">
              <h4 
                className="text-lg sm:text-xl font-semibold mb-2"
                style={{ 
                  color: 'white', 
                  fontFamily: "'Bricolage Grotesque', sans-serif"
                }}
              >
                Stay Updated
              </h4>
              <p 
                className="text-sm sm:text-base max-w-md mx-auto lg:mx-0"
                style={{ 
                  color: 'rgba(255, 255, 255, 0.8)', 
                  fontFamily: 'Roboto, sans-serif'
                }}
              >
                Get the latest legal insights and platform updates delivered to your inbox.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto max-w-md lg:max-w-none">
              <input
                type="email"
                placeholder="Enter your email"
                className="px-4 py-3 rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-[#CF9B63] text-sm sm:text-base flex-1"
                style={{ 
                  fontFamily: 'Roboto, sans-serif',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  color: 'white'
                }}
                onFocus={(e) => {
                  e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
                }}
                onBlur={(e) => {
                  e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                }}
              />
              <button
                onClick={handleSubscribe}
                className="px-6 py-3 rounded-lg font-semibold text-white transition-all duration-300 whitespace-nowrap text-sm sm:text-base"
                style={{ 
                  backgroundColor: '#CF9B63', 
                  fontFamily: 'Roboto, sans-serif',
                  boxShadow: '0 4px 12px rgba(207, 155, 99, 0.3)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#B8895A';
                  e.target.style.boxShadow = '0 6px 16px rgba(207, 155, 99, 0.4)';
                  e.target.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#CF9B63';
                  e.target.style.boxShadow = '0 4px 12px rgba(207, 155, 99, 0.3)';
                  e.target.style.transform = 'translateY(0)';
                }}
              >
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div 
          className="pt-6 sm:pt-8 border-t"
          style={{ 
            borderColor: 'rgba(255, 255, 255, 0.15)'
          }}
        >
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <p 
              className="text-xs sm:text-sm"
              style={{ 
                color: 'rgba(255, 255, 255, 0.7)', 
                fontFamily: 'Roboto, sans-serif'
              }}
            >
              © {currentYear} सलहाकार. All rights reserved.
            </p>
            
            <div className="flex flex-wrap items-center justify-center sm:justify-end gap-4 sm:gap-6">
              {footerLinks.legal.map((link, index) => {
                const isInternalLink = link.href.startsWith('/') && !link.href.endsWith('.pdf');
                
                if (isInternalLink) {
                  return (
                    <Link
                      key={index}
                      to={link.href}
                      className="text-xs sm:text-sm transition-colors duration-200"
                      style={{ 
                        color: 'rgba(255, 255, 255, 0.7)', 
                        fontFamily: 'Roboto, sans-serif'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.color = '#CF9B63';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.color = 'rgba(255, 255, 255, 0.7)';
                      }}
                    >
                      {link.name}
                    </Link>
                  );
                } else {
                  return (
                    <a
                      key={index}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs sm:text-sm transition-colors duration-200"
                      style={{ 
                        color: 'rgba(255, 255, 255, 0.7)', 
                        fontFamily: 'Roboto, sans-serif'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.color = '#CF9B63';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.color = 'rgba(255, 255, 255, 0.7)';
                      }}
                    >
                      {link.name}
                    </a>
                  );
                }
              })}
            </div>
          </div>
        </div>
      </div>

      {/* CSS for immediate visibility */}
      <style>{`
        footer,
        footer * {
          opacity: 1 !important;
          visibility: visible !important;
        }
        
        footer a,
        footer button {
          transition: color 0.2s ease, background-color 0.2s ease, transform 0.2s ease !important;
        }
        
        footer input::placeholder {
          color: rgba(255, 255, 255, 0.5) !important;
        }
      `}</style>
    </footer>
  );
};

export default Footer;
