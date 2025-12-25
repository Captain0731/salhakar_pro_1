import React, { useState } from 'react';

const LanguageSelectorButton = ({ 
  currentLanguage = 'EN', 
  currentCountry = 'US', 
  onLanguageChange,
  className = '' 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const languages = [
    { code: 'EN', country: 'US', name: 'English', flag: '🇺🇸' },
    { code: 'EN', country: 'GB', name: 'English', flag: '🇬🇧' },
    { code: 'HI', country: 'IN', name: 'हिन्दी', flag: '🇮🇳' },
    { code: 'BN', country: 'BD', name: 'বাংলা', flag: '🇧🇩' },
    { code: 'TA', country: 'IN', name: 'தமிழ்', flag: '🇮🇳' },
    { code: 'TE', country: 'IN', name: 'తెలుగు', flag: '🇮🇳' },
    { code: 'ML', country: 'IN', name: 'മലയാളം', flag: '🇮🇳' },
    { code: 'KN', country: 'IN', name: 'ಕನ್ನಡ', flag: '🇮🇳' },
    { code: 'GU', country: 'IN', name: 'ગુજરાતી', flag: '🇮🇳' },
    { code: 'MR', country: 'IN', name: 'मराठी', flag: '🇮🇳' },
    { code: 'PA', country: 'IN', name: 'ਪੰਜਾਬੀ', flag: '🇮🇳' },
    { code: 'OR', country: 'IN', name: 'ଓଡ଼ିଆ', flag: '🇮🇳' },
    { code: 'AS', country: 'IN', name: 'অসমীয়া', flag: '🇮🇳' },
  ];

  const handleLanguageSelect = (language) => {
    onLanguageChange?.(language);
    setIsOpen(false);
  };

  const currentLang = languages.find(lang => 
    lang.code === currentLanguage && lang.country === currentCountry
  ) || languages[0];

  return (
    <div className={`relative ${className}`}>
      {/* Main Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="
          flex items-center gap-3 px-4 py-3
          rounded-xl shadow-sm
          hover:shadow-lg hover:scale-[1.02]
          transition-all duration-300 ease-in-out
          focus:outline-none focus:ring-2 focus:ring-opacity-20
          min-w-[120px] justify-between
          border-2
        "
        style={{
          fontFamily: 'Roboto, sans-serif',
          backgroundColor: '#F9FAFC',
          borderColor: '#8C969F',
          focusRingColor: '#1E65AD',
        }}
      >
        <div className="flex items-center gap-3">
          {/* Flag */}
          <span className="text-lg">{currentLang.flag}</span>
          
          {/* Language Info */}
          <div className="flex flex-col items-start">
            <span 
              className="text-sm font-semibold leading-tight"
              style={{ 
                color: '#1E65AD',
                fontFamily: "'Bricolage Grotesque', sans-serif"
              }}
            >
              {currentLang.name}
            </span>
            <span 
              className="text-xs leading-tight"
              style={{ color: '#8C969F' }}
            >
              {currentCountry} • {currentLanguage}
            </span>
          </div>
        </div>
        
        {/* Chevron Icon */}
        <svg
          className={`w-4 h-4 transition-all duration-300 ${
            isOpen ? 'rotate-180' : ''
          }`}
          style={{ color: '#1E65AD' }}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.5}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div
            className="
              absolute top-full left-0 mt-3 w-72
              rounded-2xl shadow-2xl border-2
              z-20 overflow-hidden
              animate-in slide-in-from-top-2 duration-300
            "
            style={{
              backgroundColor: '#F9FAFC',
              borderColor: '#1E65AD',
              boxShadow: '0 25px 50px -12px rgba(30, 101, 173, 0.25), 0 0 0 1px rgba(30, 101, 173, 0.1)'
            }}
          >
            {/* Header */}
            <div 
              className="px-5 py-4"
              style={{ 
                background: 'linear-gradient(135deg, #1E65AD 0%, #1a5a9a 100%)',
                borderBottom: '2px solid #CF9B63'
              }}
            >
              <h3 
                className="text-base font-bold text-white flex items-center gap-2"
                style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
              >
                <span className="text-lg">🌐</span>
                Select Language
              </h3>
            </div>

            {/* Language List */}
            <div className="max-h-80 overflow-y-auto scrollbar-hide">
              {languages.map((language, index) => {
                const isSelected = currentLanguage === language.code && currentCountry === language.country;
                return (
                  <button
                    key={`${language.code}-${language.country}-${index}`}
                    onClick={() => handleLanguageSelect(language)}
                    className={`
                      w-full px-5 py-4 text-left
                      transition-all duration-200 ease-in-out
                      flex items-center gap-4
                      hover:scale-[1.02] hover:shadow-sm
                      ${isSelected ? 'shadow-inner' : ''}
                    `}
                    style={{
                      fontFamily: 'Roboto, sans-serif',
                      backgroundColor: isSelected 
                        ? '#1E65AD' 
                        : 'transparent',
                      color: isSelected 
                        ? '#FFFFFF' 
                        : '#8C969F',
                    }}
                  >
                    {/* Flag */}
                    <span className="text-xl">{language.flag}</span>
                    
                    {/* Language Info */}
                    <div className="flex-1">
                      <div 
                        className="text-sm font-semibold mb-1"
                        style={{ 
                          color: isSelected 
                            ? '#FFFFFF' 
                            : '#1E65AD',
                          fontFamily: isSelected 
                            ? "'Bricolage Grotesque', sans-serif" 
                            : 'Roboto, sans-serif'
                        }}
                      >
                        {language.name}
                      </div>
                      <div 
                        className="text-xs flex items-center gap-1"
                        style={{ 
                          color: isSelected 
                            ? '#CF9B63' 
                            : '#8C969F'
                        }}
                      >
                        <span className="font-medium">{language.country}</span>
                        <span>•</span>
                        <span className="font-medium">{language.code}</span>
                      </div>
                    </div>

                    {/* Selection Indicator */}
                    {isSelected && (
                      <div 
                        className="w-6 h-6 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: '#CF9B63' }}
                      >
                        <svg
                          className="w-3 h-3"
                          style={{ color: '#FFFFFF' }}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Footer */}
            <div 
              className="px-5 py-3"
              style={{ 
                borderTop: '1px solid #8C969F',
                backgroundColor: 'rgba(30, 101, 173, 0.05)'
              }}
            >
              <p 
                className="text-xs text-center flex items-center justify-center gap-1"
                style={{ 
                  color: '#8C969F', 
                  fontFamily: 'Roboto, sans-serif' 
                }}
              >
                <span>✨</span>
                More languages coming soon
                <span>✨</span>
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default LanguageSelectorButton;
