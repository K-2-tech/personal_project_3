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

  const ALLOWED_DOMAIN = 'learnlooper.app';
  const CHECK_INTERVAL = 5000; // デバッグ用に5秒に短縮

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
    if (!isMounted || typeof window === 'undefined') return true;

    try {
      const domain = new URL(url).hostname;
      const isInternal = domain === ALLOWED_DOMAIN || domain === window.location.hostname;
      console.log('Navigation check:', { url, domain, isInternal });
      return isInternal;
    } catch (error) {
      console.error('URL parsing error:', error);
      return false;
    }
  }, [isMounted]);

  // タブ切り替えと離脱時間の監視
  useEffect(() => {
    if (!isMounted || typeof window === 'undefined' || !isEnabled) return;

    console.log('Setting up visibility change monitoring');

    const handleVisibilityChange = () => {
      if (!isEnabledRef.current) return;

      const currentTime = Date.now();
      console.log('Visibility changed:', { 
        hidden: document.hidden, 
        currentTime: new Date(currentTime).toISOString() 
      });

      if (document.hidden) {
        setLeaveTime(currentTime);
        const isExternal = !isInternalNavigation(window.location.href);
        setIsExternalSite(isExternal);
        console.log('Tab hidden:', { isExternal, leaveTime: currentTime });

        if (isExternal) {
          const message = getRandomMessage();
          console.log('Setting initial warning:', message);
          setWarningMessage(message);
          setShowWarning(true);
        }
      } else {
        console.log('Tab visible again:', { 
          leaveTime, 
          isExternalSite, 
          timeDiff: leaveTime ? (currentTime - leaveTime) / 1000 : 0 
        });

        if (leaveTime && isExternalSite) {
          const timeDiff = currentTime - leaveTime;
          console.log('Checking time difference:', {
            timeDiff: timeDiff / 1000,
            threshold: warningThresholdRef.current * 60
          });

          if (timeDiff >= warningThresholdRef.current * 60 * 1000) {
            const message = getRandomMessage(true);
            console.log('Setting long absence warning:', message);
            setWarningMessage(message);
            setShowWarning(true);
            showNotification(message);
          }
        }
        setLeaveTime(null);
        setIsExternalSite(false);
      }
    };

    // 定期的なチェック
    const checkTimer = setInterval(() => {
      if (!isEnabledRef.current) return;

      const currentTime = Date.now();
      if (document.hidden && leaveTime && isExternalSite) {
        const timeDiff = currentTime - leaveTime;
        console.log('Timer check:', {
          currentTime: new Date(currentTime).toISOString(),
          leaveTime: new Date(leaveTime).toISOString(),
          timeDiff: timeDiff / 1000,
          threshold: warningThresholdRef.current * 60
        });

        // 最後のチェックから一定時間経過している場合のみ警告を表示
        if (timeDiff >= warningThresholdRef.current * 60 * 1000 &&
            (!lastCheckedRef.current || currentTime - lastCheckedRef.current >= CHECK_INTERVAL)) {
          const message = getRandomMessage(true);
          console.log('Setting periodic warning:', message);
          setWarningMessage(message);
          setShowWarning(true);
          showNotification(message);
          lastCheckedRef.current = currentTime;
        }
      }
    }, CHECK_INTERVAL);

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(checkTimer);
      console.log('Cleanup: removed event listeners and timer');
    };
  }, [isMounted, isEnabled, getRandomMessage, showNotification, isInternalNavigation]);

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
        <div className="fixed top-4 right-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded shadow-lg z-50">
          <p className="font-bold">{warningMessage}</p>
        </div>
      )}
    </DisplayLockContext.Provider>
  );
};

export default DisplayLockProvider;