'use client';
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import './DisplayLock.module.css';

const DisplayLockContext = createContext(null);

export const useDisplayLock = () => {
  const context = useContext(DisplayLockContext);
  if (!context) {
    throw new Error('useDisplayLock must be used within a DisplayLockProvider');
  }
  return context;
};

const DisplayLockProvider = ({ children }) => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');
  const [leaveTime, setLeaveTime] = useState(null);
  const [isExternalSite, setIsExternalSite] = useState(false);
  const [warningThreshold, setWarningThreshold] = useState(10);
  const [notificationPermission, setNotificationPermission] = useState('default');
  const [isMounted, setIsMounted] = useState(false);

  const isEnabledRef = useRef(isEnabled);
  const warningThresholdRef = useRef(warningThreshold);
  const checkIntervalRef = useRef(null);
  const lastCheckedRef = useRef(null);
  const lastUrlRef = useRef(typeof window !== 'undefined' ? window.location.href : '');
  const ALLOWED_DOMAIN = 'learnlooper.app';
  const CHECK_INTERVAL = 1000; // デバッグ用に1秒に短縮

  useEffect(() => {
    setIsMounted(true);
    console.log('DisplayLock mounted');
    return () => {
      setIsMounted(false);
      console.log('DisplayLock unmounted');
    };
  }, []);

  useEffect(() => {
    isEnabledRef.current = isEnabled;
    warningThresholdRef.current = warningThreshold;
    console.log('State updated:', { isEnabled, warningThreshold });
  }, [isEnabled, warningThreshold]);

  const getRandomMessage = useCallback((isLongAbsence = false) => {
    const messages = isLongAbsence ? [
      `It's been over ${warningThreshold} minutes! Let's get back to studying! 😤`,
      "It's time to get back into focus mode! ⏰",
      "Isn't the break too long? Come on, let's resume studying! 📚",
      `It's already been ${warningThreshold} minutes! Let's do our best! 💪`
      ] : [
      "Hey, you're supposed to be studying! 💪",
      "Don't escape to social media! 📵",
      "Come back! Focus! 🧐",
      "Not there, switch back the tab! 📚",
      "Now is the time to concentrate on learning! 🎯"
      ];
    return messages[Math.floor(Math.random() * messages.length)];
  }, [warningThreshold]);

  const showNotification = useCallback((message) => {
    if (!isMounted || typeof window === 'undefined') return;

    console.log('Attempting to show notification:', message);

    if (!('Notification' in window)) {
      console.warn('Notifications not supported');
      return;
    }

    if (Notification.permission === 'granted') {
      try {
        const notification = new Notification('LearnLooper', {
          body: message,
          icon: '/icon.svg',
          tag: 'learnlooper-warning',
          requireInteraction: true,
        });

        notification.onclick = () => {
          window.focus();
          notification.close();
        };
        console.log('Notification created successfully');
      } catch (error) {
        console.error('Failed to create notification:', error);
      }
    }
  }, [isMounted]);

  const isInternalNavigation = useCallback((url) => {
    if (!url || typeof window === 'undefined') return true;
    try {
      const urlObj = new URL(url);
      const currentDomain = window.location.hostname;
      const targetDomain = urlObj.hostname;
      
      console.log('Domain check:', {
        currentDomain,
        targetDomain,
        isInternal: targetDomain === ALLOWED_DOMAIN || targetDomain === currentDomain
      });
      
      return targetDomain === ALLOWED_DOMAIN || targetDomain === currentDomain;
    } catch (error) {
      console.error('URL parsing error:', error);
      return false;
    }
  }, []);
  useEffect(() => {
    if (!isMounted || typeof window === 'undefined' || !isEnabled) return;

    const checkUrlChange = () => {
      const currentUrl = window.location.href;
      if (currentUrl !== lastUrlRef.current) {
        console.log('URL changed:', { from: lastUrlRef.current, to: currentUrl });
        const isExternal = !isInternalNavigation(currentUrl);
        
        if (isExternal) {
          console.log('External navigation detected');
          setLeaveTime(Date.now());
          setIsExternalSite(true);
          const message = getRandomMessage();
          setWarningMessage(message);
          setShowWarning(true);
        }
        
        lastUrlRef.current = currentUrl;
      }
    };

    // 定期的なURLチェック
    const urlCheckInterval = setInterval(checkUrlChange, 500);
    
    return () => clearInterval(urlCheckInterval);
  }, [isMounted, isEnabled, isInternalNavigation, getRandomMessage]);

  // タブ切り替えと離脱時間の監視
  useEffect(() => {
    if (!isMounted || typeof window === 'undefined' || !isEnabled) return;

    console.log('Setting up visibility monitoring');

    const handleVisibilityChange = () => {
      if (!isEnabledRef.current) return;

      const currentTime = Date.now();
      console.log('Visibility changed:', {
        hidden: document.hidden,
        currentTime: new Date(currentTime).toISOString()
      });

      if (document.hidden) {
        // タブが非表示になった時
        const currentUrl = window.location.href;
        const isExternal = !isInternalNavigation(currentUrl);
        
        console.log('Tab hidden check:', {
          currentUrl,
          isExternal,
          currentTime: new Date(currentTime).toISOString()
        });

        if (isExternal) {
          setLeaveTime(currentTime);
          setIsExternalSite(true);
          const message = getRandomMessage();
          setWarningMessage(message);
          setShowWarning(true);
        }
      } else {
        // タブが表示された時
        if (leaveTime && isExternalSite) {
          const timeDiff = currentTime - leaveTime;
          const thresholdMs = warningThresholdRef.current * 60 * 1000;
          
          console.log('Tab visible check:', {
            timeDiff: timeDiff / 1000,
            threshold: thresholdMs / 1000,
            exceededThreshold: timeDiff >= thresholdMs
          });

          if (timeDiff >= thresholdMs) {
            const message = getRandomMessage(true);
            setWarningMessage(message);
            setShowWarning(true);
            showNotification(message);
          }
        }
        // タブが表示された時の状態リセット
        if (isInternalNavigation(window.location.href)) {
          setLeaveTime(null);
          setIsExternalSite(false);
        }
      }
    };

    // 定期的なチェック処理
    const checkTimer = setInterval(() => {
      if (!isEnabledRef.current || !document.hidden) return;

      const currentTime = Date.now();
      if (leaveTime && isExternalSite) {
        const timeDiff = currentTime - leaveTime;
        const thresholdMs = warningThresholdRef.current * 60 * 1000;
        
        console.log('Timer check:', {
          currentTime: new Date(currentTime).toISOString(),
          leaveTime: new Date(leaveTime).toISOString(),
          timeDiff: timeDiff / 1000,
          threshold: thresholdMs / 1000
        });

        if (timeDiff >= thresholdMs) {
          const message = getRandomMessage(true);
          setWarningMessage(message);
          setShowWarning(true);
          showNotification(message);
        }
      }
    }, CHECK_INTERVAL);

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(checkTimer);
    };
  }, [isMounted, isEnabled, getRandomMessage, showNotification, leaveTime, isExternalSite, isInternalNavigation]);

  const toggleDisplayLock = useCallback(async () => {
    if (!isMounted || typeof window === 'undefined') return;

    const newState = !isEnabled;
    console.log('Toggling DisplayLock:', { newState });

    if (newState && notificationPermission === 'default') {
      const granted = await Notification.requestPermission() === 'granted';
      console.log('Requested notification permission:', { granted });
      setNotificationPermission(granted ? 'granted' : 'denied');
    }

    setIsEnabled(newState);
    setShowWarning(false);
    setLeaveTime(null);
    setIsExternalSite(false);

    try {
      localStorage.setItem('displayLockSettings', JSON.stringify({
        isEnabled: newState,
        warningThreshold
      }));
      console.log('Settings saved to localStorage');
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  }, [isMounted, isEnabled, notificationPermission, warningThreshold]);

  // スタイリングを改善
  return (
<DisplayLockContext.Provider value={{
      isEnabled,
      toggleDisplayLock,
      warningThreshold,
      updateSettings: setWarningThreshold,
      notificationPermission,
      requestNotificationPermission: async () => {
        const result = await Notification.requestPermission();
        setNotificationPermission(result);
        return result === 'granted';
      }
    }}>
      {children}
      {showWarning && (
        <div className="fixed top-4 right-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded shadow-lg z-50 max-w-md">
          <div className="flex items-start">
            <div className="ml-3">
              <p className="font-bold">{warningMessage}</p>
            </div>
            <button
              onClick={() => setShowWarning(false)}
              className="ml-auto -mx-1.5 -my-1.5 bg-red-100 text-red-500 rounded-lg p-1.5 hover:bg-red-200 inline-flex"
            >
              <span className="sr-only">Dismiss</span>
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </DisplayLockContext.Provider>
  );
};

export default DisplayLockProvider;