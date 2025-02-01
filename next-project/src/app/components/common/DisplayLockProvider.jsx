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
  const [isBrowser, setIsBrowser] = useState(false);

  // useRefを使用して最新の状態を追跡
  const isEnabledRef = useRef(isEnabled);
  const warningThresholdRef = useRef(warningThreshold);
  const checkIntervalRef = useRef(null);

  const ALLOWED_DOMAIN = 'learnlooper.app';
  const CHECK_INTERVAL = 30000; // 30秒

  // クライアントサイドでのみ実行される初期化
  useEffect(() => {
    setIsBrowser(true);
  }, []);

  // 状態が変更されたときにrefを更新
  useEffect(() => {
    isEnabledRef.current = isEnabled;
    warningThresholdRef.current = warningThreshold;
  }, [isEnabled, warningThreshold]);

  // 通知の初期化と権限チェック
  useEffect(() => {
    if (isBrowser && 'Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
    return () => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
    };
  }, [isBrowser]);

  const getRandomMessage = useCallback((isLongAbsence = false) => {
    const messages = isLongAbsence ? [
      `${warningThresholdRef.current}分以上経過してるぞ！勉強に戻ろう！😤`,
      'そろそろ集中モードに戻るタイムだ！⏰',
      '休憩長すぎじゃない？さぁ、勉強再開！📚',
      `もう${warningThresholdRef.current}分も経ってるよ！さぁ、頑張ろう！💪`
    ] : [
      'おい、勉強中だぞ！💪',
      'SNSに逃げるな！📵',
      '戻ってこい！集中だ！🧐',
      'そこじゃない、タブを戻せ！📚',
      '今は学習に集中！🎯'
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  }, []);

  const showNotification = useCallback((message) => {
    if (!isBrowser) return;

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
  }, [isBrowser]);

  const requestNotificationPermission = useCallback(async () => {
    if (!isBrowser) return false;

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
  }, [isBrowser]);

  const isInternalNavigation = useCallback((url) => {
    if (!isBrowser) return true;

    try {
      const domain = new URL(url).hostname;
      return domain === ALLOWED_DOMAIN || domain === window.location.hostname;
    } catch {
      return false;
    }
  }, [isBrowser]);

  // メイン機能の実装
  useEffect(() => {
    if (!isBrowser) return;

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

    // イベントリスナーの設定
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    // 定期的なチェックの設定
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
  }, [isBrowser, isEnabled, getRandomMessage, showNotification, leaveTime, isExternalSite, isInternalNavigation]);

  const toggleDisplayLock = useCallback(async () => {
    if (!isBrowser) return;

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
  }, [isBrowser, isEnabled, notificationPermission, warningThreshold, requestNotificationPermission, getRandomMessage, showNotification, leaveTime, isExternalSite]);

  const updateSettings = useCallback((newWarningThreshold) => {
    if (!isBrowser) return;

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
  }, [isBrowser, isEnabled]);

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