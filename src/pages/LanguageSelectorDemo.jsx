import React, { useState } from 'react';
import LanguageSelectorButton from '../components/LanguageSelectorButton';

const LanguageSelectorDemo = () => {
  const [selectedLanguage, setSelectedLanguage] = useState({ code: 'EN', country: 'US', name: 'English (US)' });

  const handleLanguageChange = (language) => {
    setSelectedLanguage(language);
    console.log('Language changed to:', language);
  };

  return (
    <div 
      className="min-h-screen p-8"
      style={{ backgroundColor: '#F9FAFC' }}
    >
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 
            className="text-4xl font-bold mb-4"
            style={{ 
              color: '#1E65AD',
              fontFamily: "'Heebo', 'Bricolage Grotesque', sans-serif"
            }}
          >
            Language Selector Component
          </h1>
          <p 
            className="text-lg"
            style={{ 
              color: '#8C969F',
              fontFamily: 'Roboto, sans-serif'
            }}
          >
            Modern and stylish language selector with professional design
          </p>
        </div>

        {/* Demo Section */}
        <div 
          className="rounded-3xl shadow-2xl p-8 mb-8 border-2"
          style={{ 
            backgroundColor: '#FFFFFF',
            borderColor: '#1E65AD',
            boxShadow: '0 25px 50px -12px rgba(30, 101, 173, 0.15)'
          }}
        >
          <h2 
            className="text-3xl font-bold mb-8 text-center"
            style={{ 
              color: '#1E65AD',
              fontFamily: "'Heebo', 'Bricolage Grotesque', sans-serif"
            }}
          >
            🌐 Interactive Language Selector
          </h2>
          
          <div className="flex flex-col items-center space-y-8">
            {/* Language Selector */}
            <div className="w-full max-w-md">
              <label 
                className="block text-lg font-semibold mb-4 text-center"
                style={{ 
                  color: '#8C969F',
                  fontFamily: 'Roboto, sans-serif'
                }}
              >
                Choose Your Language:
              </label>
              <div className="flex justify-center">
                <LanguageSelectorButton
                  currentLanguage={selectedLanguage.code}
                  currentCountry={selectedLanguage.country}
                  onLanguageChange={handleLanguageChange}
                  className="transform hover:scale-105 transition-transform duration-300"
                />
              </div>
            </div>

            {/* Current Selection Display */}
            <div 
              className="rounded-2xl p-6 w-full max-w-md border-2 shadow-lg"
              style={{ 
                backgroundColor: '#F9FAFC',
                borderColor: '#CF9B63',
                boxShadow: '0 10px 25px -5px rgba(207, 155, 99, 0.2)'
              }}
            >
              <h3 
                className="text-lg font-bold mb-4 text-center"
                style={{ 
                  color: '#1E65AD',
                  fontFamily: "'Bricolage Grotesque', sans-serif"
                }}
              >
                ✨ Current Selection
              </h3>
              <div className="text-center">
                <p 
                  className="text-2xl font-bold mb-2"
                  style={{ 
                    color: '#1E65AD',
                    fontFamily: "'Bricolage Grotesque', sans-serif"
                  }}
                >
                  {selectedLanguage.name}
                </p>
                <p 
                  className="text-sm font-medium"
                  style={{ 
                    color: '#8C969F',
                    fontFamily: 'Roboto, sans-serif'
                  }}
                >
                  {selectedLanguage.country} • {selectedLanguage.code}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div 
            className="bg-white rounded-xl p-6 shadow-lg"
            style={{ backgroundColor: '#FFFFFF' }}
          >
            <h3 
              className="text-xl font-bold mb-4"
              style={{ 
                color: '#1E65AD',
                fontFamily: "'Heebo', 'Bricolage Grotesque', sans-serif"
              }}
            >
              🎨 Design Features
            </h3>
            <ul 
              className="space-y-2"
              style={{ 
                color: '#8C969F',
                fontFamily: 'Roboto, sans-serif'
              }}
            >
              <li>• Professional color scheme</li>
              <li>• Smooth animations and transitions</li>
              <li>• Hover effects and focus states</li>
              <li>• Responsive design</li>
              <li>• Clean typography</li>
            </ul>
          </div>

          <div 
            className="bg-white rounded-xl p-6 shadow-lg"
            style={{ backgroundColor: '#FFFFFF' }}
          >
            <h3 
              className="text-xl font-bold mb-4"
              style={{ 
                color: '#1E65AD',
                fontFamily: "'Heebo', 'Bricolage Grotesque', sans-serif"
              }}
            >
              ⚡ Technical Features
            </h3>
            <ul 
              className="space-y-2"
              style={{ 
                color: '#8C969F',
                fontFamily: 'Roboto, sans-serif'
              }}
            >
              <li>• React hooks integration</li>
              <li>• Customizable props</li>
              <li>• Accessibility support</li>
              <li>• TypeScript ready</li>
              <li>• Easy to integrate</li>
            </ul>
          </div>
        </div>

        {/* Color Palette */}
        <div 
          className="bg-white rounded-xl p-6 shadow-lg"
          style={{ backgroundColor: '#FFFFFF' }}
        >
          <h3 
            className="text-xl font-bold mb-4"
            style={{ 
              color: '#1E65AD',
              fontFamily: "'Heebo', 'Bricolage Grotesque', sans-serif"
            }}
          >
            🎨 Color Palette
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div 
                className="w-16 h-16 rounded-lg mx-auto mb-2"
                style={{ backgroundColor: '#1E65AD' }}
              ></div>
              <p 
                className="text-sm font-medium"
                style={{ 
                  color: '#1E65AD',
                  fontFamily: 'Roboto, sans-serif'
                }}
              >
                Primary Blue
              </p>
              <p 
                className="text-xs"
                style={{ 
                  color: '#8C969F',
                  fontFamily: 'Roboto, sans-serif'
                }}
              >
                #1E65AD
              </p>
            </div>
            <div className="text-center">
              <div 
                className="w-16 h-16 rounded-lg mx-auto mb-2"
                style={{ backgroundColor: '#CF9B63' }}
              ></div>
              <p 
                className="text-sm font-medium"
                style={{ 
                  color: '#CF9B63',
                  fontFamily: 'Roboto, sans-serif'
                }}
              >
                Accent Gold
              </p>
              <p 
                className="text-xs"
                style={{ 
                  color: '#8C969F',
                  fontFamily: 'Roboto, sans-serif'
                }}
              >
                #CF9B63
              </p>
            </div>
            <div className="text-center">
              <div 
                className="w-16 h-16 rounded-lg mx-auto mb-2"
                style={{ backgroundColor: '#8C969F' }}
              ></div>
              <p 
                className="text-sm font-medium"
                style={{ 
                  color: '#8C969F',
                  fontFamily: 'Roboto, sans-serif'
                }}
              >
                Neutral Gray
              </p>
              <p 
                className="text-xs"
                style={{ 
                  color: '#8C969F',
                  fontFamily: 'Roboto, sans-serif'
                }}
              >
                #8C969F
              </p>
            </div>
            <div className="text-center">
              <div 
                className="w-16 h-16 rounded-lg mx-auto mb-2 border-2"
                style={{ 
                  backgroundColor: '#F9FAFC',
                  borderColor: '#8C969F'
                }}
              ></div>
              <p 
                className="text-sm font-medium"
                style={{ 
                  color: '#8C969F',
                  fontFamily: 'Roboto, sans-serif'
                }}
              >
                Background
              </p>
              <p 
                className="text-xs"
                style={{ 
                  color: '#8C969F',
                  fontFamily: 'Roboto, sans-serif'
                }}
              >
                #F9FAFC
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LanguageSelectorDemo;
