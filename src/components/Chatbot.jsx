import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Spline from '@splinetool/react-spline';

const Chatbot = () => {
  const navigate = useNavigate();
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [splineError, setSplineError] = useState(false);
  const chatbotRef = useRef(null);
  const dragStartRef = useRef({ x: 0, y: 0 });
  
  // Suppress console errors from Spline component
  useEffect(() => {
    const originalError = console.error;
    console.error = (...args) => {
      // Filter out Spline-related errors that don't affect functionality
      const errorMessage = args[0];
      if (errorMessage && typeof errorMessage === 'string') {
        if (
          errorMessage.includes('jsx') || 
          errorMessage.includes('Missing property') || 
          errorMessage.includes('non-boolean attribute') ||
          errorMessage.includes('Received `true` for a non-boolean')
        ) {
          // Suppress these specific Spline internal errors
          return;
        }
      }
      // Check all arguments for error patterns
      const allArgs = args.join(' ');
      if (
        allArgs.includes('jsx') || 
        allArgs.includes('Missing property') || 
        allArgs.includes('non-boolean attribute')
      ) {
        return;
      }
      originalError.apply(console, args);
    };
    
    return () => {
      console.error = originalError;
    };
  }, []);

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    // Set initial position based on screen size - bottom right
    if (isMobile) {
      setPosition({ 
        x: window.innerWidth - 120, 
        y: window.innerHeight - 120 
      });
    }
  }, [isMobile]);

  const handleChatbotClick = useCallback((e) => {
    // Only navigate if not dragging
    if (!isDragging) {
      navigate('/legal-chatbot');
    }
  }, [isDragging, navigate]);

  const handleTouchStart = useCallback((e) => {
    if (!isMobile) return;
    const touch = e.touches[0];
    dragStartRef.current = {
      x: touch.clientX - position.x,
      y: touch.clientY - position.y
    };
    setIsDragging(true);
  }, [isMobile, position]);

  const handleTouchMove = useCallback((e) => {
    if (!isMobile || !isDragging) return;
    e.preventDefault();
    const touch = e.touches[0];
    const newX = touch.clientX - dragStartRef.current.x;
    const newY = touch.clientY - dragStartRef.current.y;
    
    // Constrain to viewport
    const chatbotSize = 100;
    const maxX = window.innerWidth - chatbotSize;
    const maxY = window.innerHeight - chatbotSize;
    const minX = 0;
    const minY = 0;
    
    setPosition({
      x: Math.max(minX, Math.min(maxX, newX)),
      y: Math.max(minY, Math.min(maxY, newY))
    });
  }, [isMobile, isDragging]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging && isMobile) {
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleTouchEnd);
      
      return () => {
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [isDragging, isMobile, handleTouchMove, handleTouchEnd]);

  // Responsive sizes
  const chatbotWidth = isMobile ? '100px' : '200px';
  const chatbotHeight = isMobile ? '75px' : '150px';

  return (
    <div 
      ref={chatbotRef}
      className={`fixed z-50 transition-transform duration-300 ${isDragging ? 'scale-110' : 'hover:scale-110'} cursor-pointer ${isMobile ? 'touch-none' : ''}`}
      onClick={handleChatbotClick}
      onTouchStart={handleTouchStart}
      style={{
        width: chatbotWidth,
        height: chatbotHeight,
        backgroundColor: 'transparent',
        bottom: '1rem',
        right: '1rem',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        WebkitTouchCallout: 'none'
      }}
    >
      {splineError ? (
        <div style={{ 
          width: '100%', 
          height: '100%', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          backgroundColor: '#1E65AD',
          borderRadius: '50%',
          color: 'white',
          fontSize: isMobile ? '24px' : '48px',
          fontWeight: 'bold',
          cursor: 'pointer'
        }}>
          💬
        </div>
      ) : (
        <Spline 
          scene="https://prod.spline.design/lBliC7y81-01lRxX/scene.splinecode"
          style={{ width: '100%', height: '100%' }}
          onError={() => {
            console.warn('Spline failed to load, using fallback');
            setSplineError(true);
          }}
        />
      )}
    </div>
  );
}

export default Chatbot;
