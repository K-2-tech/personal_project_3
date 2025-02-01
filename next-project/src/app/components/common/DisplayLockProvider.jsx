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

  const ALLOWED_DOMAIN = 'learnlooper.app';
  const CHECK_INTERVAL = 30000;

  // コンポーネントのマウント状態を管理
  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  // 状態が変更されたときにrefを更新
  useEffect(() => {
    if (!isMounted) return;
    isEnabledRef.current = isEnabled;
    warningThresholdRef.current = warningThreshold;
  }, [isEnabled, warningThreshold, isMounted]);

  // 通知の初期化と権限チェック
  useEffect(() => {
    if (!isMounted) return;

    const checkNotificationPermission = () => {
      if (typeof window !== 'undefined' && 'Notification' in window) {
        setNotificationPermission(Notification.permission);
      }
    };

    checkNotificationPermission();

    return () => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
    };
  }, [isMounted]);

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
      } catch (error) {
        console.error('Failed to create notification:', error);
      }
    }
  }, [isMounted]);

  const requestNotificationPermission = useCallback(async () => {
    if (!isMounted || typeof window === 'undefined') return false;

    if (!('Notification' in window)) {
      console.warn('Notifications not supported');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      return permission === 'granted';
    } catch (error) {
      console.error('Failed to request notification permission:', error);
      return false;
    }
  }, [isMounted]);

  const isInternalNavigation = useCallback((url) => {
    if (!isMounted || typeof window === 'undefined') return true;

    try {
      const domain = new URL(url).hostname;
      return domain === ALLOWED_DOMAIN || domain === window.location.hostname;
    } catch {
      return false;
    }
  }, [isMounted]);

  // メイン機能の実装
  useEffect(() => {
    if (!isMounted || typeof window === 'undefined') return;

    // 設定の読み込み
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

    const handleVisibilityChange = () => {
      if (!isEnabledRef.current) return;

      const currentTime = Date.now();
      
      if (document.hidden) {
        setLeaveTime(currentTime);
        const isExternal = !isInternalNavigation(window.location.href);
        setIsExternalSite(isExternal);
        
        if (isExternal) {
          const message = getRandomMessage();
          setWarningMessage(message);
          setShowWarning(true);
        }
      } else {
        if (leaveTime && isExternalSite) {
          const timeDiff = currentTime - leaveTime;
          if (timeDiff >= warningThresholdRef.current * 60 * 1000) {
            const message = getRandomMessage(true);
            setWarningMessage(message);
            setShowWarning(true);
            showNotification(message);
          }
        }
        setLeaveTime(null);
        setIsExternalSite(false);
      }
    };

    const handleBeforeUnload = (event) => {
      if (!isEnabledRef.current) return;
      
      const targetUrl = event.target.activeElement?.href;
      if (targetUrl && !isInternalNavigation(targetUrl)) {
        setIsExternalSite(true);
        setLeaveTime(Date.now());
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    if (isEnabled) {
      checkIntervalRef.current = setInterval(() => {
        if (leaveTime && isExternalSite) {
          const currentTime = Date.now();
          const timeDiff = currentTime - leaveTime;
          if (timeDiff >= warningThresholdRef.current * 60 * 1000) {
            const message = getRandomMessage(true);
            setWarningMessage(message);
            setShowWarning(true);
            showNotification(message);
          }
        }
      }, CHECK_INTERVAL);
    }

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
    };
  }, [isMounted, isEnabled, getRandomMessage, showNotification, leaveTime, isExternalSite, isInternalNavigation]);

  const toggleDisplayLock = useCallback(async () => {
    if (!isMounted || typeof window === 'undefined') return;

    const newState = !isEnabled;
    if (newState && notificationPermission === 'default') {
      await requestNotificationPermission();
    }

    setIsEnabled(newState);
    try {
      localStorage.setItem('displayLockSettings', JSON.stringify({
        isEnabled: newState,
        warningThreshold
      }));
    } catch (error) {
      console.error('Failed to save settings:', error);
    }

    setShowWarning(false);
    setLeaveTime(null);
    setIsExternalSite(false);

    if (checkIntervalRef.current) {
      clearInterval(checkIntervalRef.current);
    }

    if (newState) {
      checkIntervalRef.current = setInterval(() => {
        if (leaveTime && isExternalSite) {
          const currentTime = Date.now();
          const timeDiff = currentTime - leaveTime;
          if (timeDiff >= warningThresholdRef.current * 60 * 1000) {
            const message = getRandomMessage(true);
            setWarningMessage(message);
            setShowWarning(true);
            showNotification(message);
          }
        }
      }, CHECK_INTERVAL);
    }
  }, [isMounted, isEnabled, notificationPermission, warningThreshold, requestNotificationPermission, getRandomMessage, showNotification, leaveTime, isExternalSite]);

  const updateSettings = useCallback((newWarningThreshold) => {
    if (!isMounted || typeof window === 'undefined') return;

    if (typeof newWarningThreshold !== 'number' || newWarningThreshold <= 0) {
      console.error('Invalid warning threshold');
      return;
    }

    setWarningThreshold(newWarningThreshold);
    try {
      localStorage.setItem('displayLockSettings', JSON.stringify({
        isEnabled,
        warningThreshold: newWarningThreshold
      }));
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  }, [isMounted, isEnabled]);

  return (
    <DisplayLockContext.Provider value={{ 
      isEnabled, 
      toggleDisplayLock, 
      warningThreshold,
      updateSettings,
      notificationPermission,
      requestNotificationPermission 
    }}>
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