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

  // useRefを使用して最新の状態を追跡
  const isEnabledRef = useRef(isEnabled);
  const warningThresholdRef = useRef(warningThreshold);
  const checkIntervalRef = useRef(null);

  const ALLOWED_DOMAIN = 'learnlooper.app';
  const CHECK_INTERVAL = 30000; // 30秒

  // 状態が変更されたときにrefを更新
  useEffect(() => {
    isEnabledRef.current = isEnabled;
    warningThresholdRef.current = warningThreshold;
  }, [isEnabled, warningThreshold]);

  // 通知の初期化と権限チェック
  useEffect(() => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
    return () => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
    };
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
  }, []);

  const showNotification = useCallback((message) => {
    if (!('Notification' in window)) {
      console.warn('Notifications not supported');
      return;
    }

    if (Notification.permission === 'granted') {
      try {
        const notification = new Notification('LearnLooper', {
          body: message,
          icon: '/icon.svg',
          tag: 'learnlooper-warning', // 重複通知を防ぐ
          requireInteraction: true, // 手動で閉じるまで表示し続ける
        });

        notification.onclick = () => {
          window.focus();
          notification.close();
        };
      } catch (error) {
        console.error('Failed to create notification:', error);
      }
    }
  }, []);

  const requestNotificationPermission = useCallback(async () => {
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
  }, []);

  const isInternalNavigation = useCallback((url) => {
    try {
      const domain = new URL(url).hostname;
      return domain === ALLOWED_DOMAIN || domain === window.location.hostname;
    } catch {
      return false;
    }
  }, []);

  // 離脱時間のチェックとアラート表示
  const checkTimeAndAlert = useCallback((currentTime) => {
    if (!leaveTime || !isExternalSite || !isEnabledRef.current) return;

    const timeDiff = currentTime - leaveTime;
    if (timeDiff >= warningThresholdRef.current * 60 * 1000) {
      const message = getRandomMessage(true);
      setWarningMessage(message);
      setShowWarning(true);
      showNotification(message);
    }
  }, [leaveTime, isExternalSite, getRandomMessage, showNotification]);

  // メイン機能の実装
  useEffect(() => {
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
        checkTimeAndAlert(currentTime);
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

    // 定期的なチェックの設定
    if (isEnabled) {
      checkIntervalRef.current = setInterval(() => {
        checkTimeAndAlert(Date.now());
      }, CHECK_INTERVAL);
    }

    // イベントリスナーの設定
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    // クリーンアップ
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.addEventListener('beforeunload', handleBeforeUnload);
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
    };
  }, [isEnabled, getRandomMessage, checkTimeAndAlert, isInternalNavigation]);

  const toggleDisplayLock = useCallback(async () => {
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

    // インターバルの設定を更新
    if (checkIntervalRef.current) {
      clearInterval(checkIntervalRef.current);
    }
    if (newState) {
      checkIntervalRef.current = setInterval(() => {
        checkTimeAndAlert(Date.now());
      }, CHECK_INTERVAL);
    }
  }, [isEnabled, notificationPermission, warningThreshold, requestNotificationPermission, checkTimeAndAlert]);

  const updateSettings = useCallback((newWarningThreshold) => {
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
  }, [isEnabled]);

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