'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';
import './displayLock.module.css';

const DisplayLockContext = createContext(null);

export const useDisplayLock = () => useContext(DisplayLockContext);

const DisplayLockProvider = ({ children }) => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');
  const [leaveTime, setLeaveTime] = useState(null);
  const [isExternalSite, setIsExternalSite] = useState(false);
  
  const ALLOWED_DOMAIN = 'learnlooper.app';
  const WARNING_THRESHOLD = 10 * 60 * 1000; // 10分

  const getRandomMessage = (isLongAbsence = false) => {
    const messages = isLongAbsence ? [
      "It's been over 10 minutes! Let's get back to studying! 😤",
      "It's time to get back into focus mode! ⏰",
      "Isn't the break too long? Come on, let's resume studying! 📚",
      "It's already been 10 minutes! Let's do our best! 💪"
    ] : [
      "Hey, you're supposed to be studying! 💪",
      "Don't escape to social media! 📵",
      "Come back! Focus! 🧐",
      "Not there, switch back the tab! 📚",
      "Now is the time to concentrate on learning! 🎯"
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  };

  const isInternalNavigation = (url) => {
    try {
      const domain = new URL(url).hostname;
      return domain === ALLOWED_DOMAIN;
    } catch {
      return false;
    }
  };

  useEffect(() => {
    const savedState = localStorage.getItem('displayLockEnabled');
    if (savedState) {
      setIsEnabled(JSON.parse(savedState));
    }

    const handleVisibilityChange = () => {
      if (!isEnabled) return;

      const currentTime = new Date().getTime();
      
      if (document.hidden) {
        setLeaveTime(currentTime);
        const isExternal = !isInternalNavigation(window.location.href);
        setIsExternalSite(isExternal);
        
        if (isExternal) {
          setWarningMessage(getRandomMessage());
          setShowWarning(true);
        }
      } else {
        if (leaveTime && isExternalSite) {
          const timeDiff = currentTime - leaveTime;
          if (timeDiff >= WARNING_THRESHOLD) {
            setWarningMessage(getRandomMessage(true));
            setShowWarning(true);
          } else {
            setShowWarning(false);
          }
        }
        setLeaveTime(null);
        setIsExternalSite(false);
      }
    };

    const handleBeforeUnload = (event) => {
      if (!isEnabled) return;
      
      const targetUrl = event.target.activeElement?.href;
      if (targetUrl && !isInternalNavigation(targetUrl)) {
        setIsExternalSite(true);
        setLeaveTime(new Date().getTime());
      }
    };

    const handlePopState = () => {
      if (!isEnabled) return;
      
      const isInternal = isInternalNavigation(window.location.href);
      if (!isInternal) {
        setIsExternalSite(true);
        setLeaveTime(new Date().getTime());
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handlePopState);

    const checkInterval = setInterval(() => {
      if (isEnabled && leaveTime && isExternalSite) {
        const currentTime = new Date().getTime();
        const timeDiff = currentTime - leaveTime;
        if (timeDiff >= WARNING_THRESHOLD) {
          setWarningMessage(getRandomMessage(true));
          setShowWarning(true);
        }
      }
    }, 30000);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
      clearInterval(checkInterval);
    };
  }, [isEnabled, leaveTime, isExternalSite]);

  const toggleDisplayLock = () => {
    const newState = !isEnabled;
    setIsEnabled(newState);
    localStorage.setItem('displayLockEnabled', JSON.stringify(newState));
    setShowWarning(false);
    setLeaveTime(null);
    setIsExternalSite(false);
  };

  return (
    <DisplayLockContext.Provider value={{ isEnabled, toggleDisplayLock }}>
      {children}
      {showWarning && (
        <div className="warning-message">
          <p className="warning-text">{warningMessage}</p>
        </div>
      )}
    </DisplayLockContext.Provider>
  );
};

export default DisplayLockProvider;