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
  const [warningThreshold, setWarningThreshold] = useState(10);
  const [notificationPermission, setNotificationPermission] = useState('default');
  const [isMounted, setIsMounted] = useState(false);

  // Refs for tracking state
  const isEnabledRef = useRef(isEnabled);
  const warningThresholdRef = useRef(warningThreshold);
  const leaveTimeRef = useRef(null);
  const lastActiveTimeRef = useRef(Date.now());
  const focusIntervalRef = useRef(null);
  const documentHiddenRef = useRef(false);

  const ALLOWED_DOMAIN = 'learnlooper.app';
  const CHECK_INTERVAL = 5000; // Check every 5 seconds

  // Update refs when state changes
  useEffect(() => {
    isEnabledRef.current = isEnabled;
    warningThresholdRef.current = warningThreshold;
  }, [isEnabled, warningThreshold]);

  // Component mount handling
  useEffect(() => {
    setIsMounted(true);
    console.log('DisplayLock mounted');

    // Load saved settings
    if (typeof window !== 'undefined') {
      try {
        const savedSettings = localStorage.getItem('displayLockSettings');
        if (savedSettings) {
          const settings = JSON.parse(savedSettings);
          setIsEnabled(settings.isEnabled || false);
          setWarningThreshold(settings.warningThreshold || 10);
        }
      } catch (error) {
        console.error('Failed to load settings:', error);
      }
    }

    return () => {
      setIsMounted(false);
      console.log('DisplayLock unmounted');
    };
  }, []);

  // Notification permission check
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

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
  const requestNotificationPermission = useCallback(async () => {
    if (!isMounted || typeof window === 'undefined') return false;

    if ('Notification' in window) {
      try {
        const permission = await Notification.requestPermission();
        setNotificationPermission(permission);
        return permission === 'granted';
      } catch (error) {
        console.error('Failed to request notification permission:', error);
        return false;
      }
    } else {
      console.warn('Notifications not supported in this browser');
      return false;
    }
  }, [isMounted]);
  const showNotification = useCallback((message) => {
    if (!isMounted || typeof window === 'undefined') return;

    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    if (isMobile) {
      // モバイルの場合は画面上部に固定のアラートを表示
      setWarningMessage(message);
      setShowWarning(true);
      // 可能であればバイブレーションを実行
      if ('vibrate' in navigator) {
        navigator.vibrate([200, 100, 200]);
      }
    } else {
      // PCの場合は通常の通知を使用
      if ('Notification' in window && Notification.permission === 'granted') {
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
        } catch (error) {
          console.error('Failed to show notification:', error);
          // 通知が失敗した場合はフォールバックとして画面上部に表示
          setWarningMessage(message);
          setShowWarning(true);
        }
      }
    }
  }, [isMounted]);
   // 初期化時の通知許可チェック
   useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);
  const checkFocusAndActivity = useCallback(() => {
    if (!isEnabledRef.current) return;

    const currentTime = Date.now();
    const isLearnLooper = window.location.hostname === ALLOWED_DOMAIN;
    const isDocumentHidden = document.hidden;
    
    console.log('Focus check:', {
      isLearnLooper,
      isDocumentHidden,
      lastActiveTime: new Date(lastActiveTimeRef.current).toISOString(),
      currentTime: new Date(currentTime).toISOString(),
    });

    // If we're on LearnLooper, reset the timer
    if (isLearnLooper && !isDocumentHidden) {
      leaveTimeRef.current = null;
      lastActiveTimeRef.current = currentTime;
      setShowWarning(false);
      return;
    }

    // If this is the first time we're leaving LearnLooper
    if (!leaveTimeRef.current && (!isLearnLooper || isDocumentHidden)) {
      leaveTimeRef.current = currentTime;
      console.log('Started tracking leave time:', new Date(currentTime).toISOString());
      
      // Show initial warning
      const message = getRandomMessage(false);
      setWarningMessage(message);
      setShowWarning(true);
      return;
    }

    // If we're already away from LearnLooper, check the duration
    if (leaveTimeRef.current) {
      const timeDiff = currentTime - leaveTimeRef.current;
      const thresholdMs = warningThresholdRef.current * 60 * 1000;

      console.log('Time check:', {
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
  }, [getRandomMessage, showNotification]);

  // Set up activity monitoring
  useEffect(() => {
    if (!isMounted || typeof window === 'undefined' || !isEnabled) return;

    console.log('Setting up activity monitoring');

    const handleVisibilityChange = () => {
      documentHiddenRef.current = document.hidden;
      checkFocusAndActivity();
    };

    const handleActivityCheck = () => {
      checkFocusAndActivity();
    };

    // Set up periodic checks
    focusIntervalRef.current = setInterval(handleActivityCheck, CHECK_INTERVAL);

    // Set up visibility change listener
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (focusIntervalRef.current) {
        clearInterval(focusIntervalRef.current);
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isMounted, isEnabled, checkFocusAndActivity]);

  const toggleDisplayLock = useCallback(async () => {
    if (!isMounted || typeof window === 'undefined') return;

    const newState = !isEnabled;
    console.log('Toggling DisplayLock:', { newState });

    if (newState && notificationPermission === 'default') {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
    }

    setIsEnabled(newState);
    // Reset all tracking state
    leaveTimeRef.current = null;
    lastActiveTimeRef.current = Date.now();
    setShowWarning(false);

    // Save settings
    try {
      localStorage.setItem('displayLockSettings', JSON.stringify({
        isEnabled: newState,
        warningThreshold
      }));
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  }, [isMounted, isEnabled, notificationPermission, warningThreshold]);


  return (
    <DisplayLockContext.Provider value={{
      isEnabled,
      toggleDisplayLock,
      warningThreshold,
      updateSettings: setWarningThreshold,
      notificationPermission,
      requestNotificationPermission
    }}>
      {children}
      {showWarning && (
        <div className="fixed top-0 left-0 right-0 bg-red-500 text-white p-4 shadow-lg z-50">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex items-center">
              <span className="mr-2">⚠️</span>
              <p className="font-bold">{warningMessage}</p>
            </div>
            <button
              onClick={() => setShowWarning(false)}
              className="text-white hover:text-red-100"
            >
              <span className="sr-only">CLOSE</span>
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