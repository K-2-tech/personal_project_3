// DisplayLockProvider.jsx
'use client';
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import styles from './DisplayLock.module.css';

const DisplayLockContext = createContext(null);

export const useDisplayLock = () => {
  const context = useContext(DisplayLockContext);
  if (!context) {
    throw new Error('useDisplayLock must be used within a DisplayLockProvider');
  }
  return context;
};

const DisplayLockProvider = ({ children }) => {
  // 既存のステート管理
  const [isEnabled, setIsEnabled] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');
  const [warningType, setWarningType] = useState('default'); // 新しく追加: 警告タイプの管理
  const [warningThreshold] = useState(10);
  const [notificationPermission, setNotificationPermission] = useState('default');
  const [isMounted, setIsMounted] = useState(false);

  // Refs
  const isEnabledRef = useRef(isEnabled);
  const warningThresholdRef = useRef(warningThreshold);
  const leaveTimeRef = useRef(null);
  const lastActiveTimeRef = useRef(Date.now());
  const focusIntervalRef = useRef(null);

  const ALLOWED_DOMAIN = 'learnlooper.app';
  const CHECK_INTERVAL = 5000;

  // SNSドメインのリスト
  const SNS_DOMAINS = [
    'twitter.com',
    'x.com',
    'facebook.com',
    'instagram.com',
    'tiktok.com',
    'linkedin.com',
    'youtube.com',
    'line.me',
    'pinterest.com',
    'reddit.com'
  ];

  // 通知を送る関数
  const showNotification = useCallback((message) => {
    if (!('Notification' in window)) return;

    if (Notification.permission === 'granted') {
      new Notification('LearnLooper Focus Alert', {
        body: message,
        icon: '/favicon.ico'
      });
    }
  }, []);

  // 通知の許可を要求する関数
  const requestNotificationPermission = useCallback(async () => {
    if (!('Notification' in window)) return 'denied';

    try {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      return permission;
    } catch (error) {
      console.error('Failed to request notification permission:', error);
      return 'denied';
    }
  }, []);

  // ドメインチェック関数
  const checkDomain = useCallback((hostname) => {
    return SNS_DOMAINS.some(domain => 
      hostname === domain || hostname.endsWith('.' + domain)
    );
  }, []);

  // 警告メッセージの生成
  const getRandomMessage = useCallback((messageType = 'default') => {
    const messages = {
      sns: [
        "🚫 Social media detected! Stay focused on your studies!",
        "📚 Learning time, not scrolling time!",
        "🎯 Eyes on the prize - back to studying!",
        "💪 Don't let social media break your concentration!"
      ],
      longAbsence: [
        "⏰ Time to get back to your studies!",
        "📚 Your learning materials are waiting!",
        "🔄 Let's resume where you left off!",
        "⚡ Reactivate your focus mode!"
      ],
      default: [
        "👀 Keep your focus!",
        "📝 Stay on track!",
        "🎯 Eyes on the goal!",
        "💡 Back to learning!"
      ]
    };

    return messages[messageType][Math.floor(Math.random() * messages[messageType].length)];
  }, []);

  // フォーカスチェック関数
  const checkFocusAndActivity = useCallback(() => {
    if (!isEnabledRef.current) return;

    const currentTime = Date.now();
    const currentHostname = window.location.hostname;
    const isLearnLooper = currentHostname === ALLOWED_DOMAIN;
    const isDocumentHidden = document.hidden;
    const isSNS = checkDomain(currentHostname);

    // LearnLooperに戻ってきた場合
    if (isLearnLooper && !isDocumentHidden) {
      leaveTimeRef.current = null;
      lastActiveTimeRef.current = currentTime;
      setShowWarning(false);
      return;
    }

    // SNSサイトを検知した場合
    if (isSNS) {
      const message = getRandomMessage('sns');
      setWarningMessage(message);
      setWarningType('sns');
      setShowWarning(true);
      showNotification(message);
      return;
    }

    // 初めてLearnLooperを離れた場合
    if (!leaveTimeRef.current && (!isLearnLooper || isDocumentHidden)) {
      leaveTimeRef.current = currentTime;
      const message = getRandomMessage('default');
      setWarningMessage(message);
      setWarningType('default');
      setShowWarning(true);
      return;
    }

    // 長時間離れている場合
    if (leaveTimeRef.current) {
      const timeDiff = currentTime - leaveTimeRef.current;
      const thresholdMs = warningThresholdRef.current * 60 * 1000;

      if (timeDiff >= thresholdMs) {
        const message = getRandomMessage('longAbsence');
        setWarningMessage(message);
        setWarningType('longAbsence');
        setShowWarning(true);
        showNotification(message);
      }
    }
  }, [getRandomMessage, showNotification, checkDomain]);

  // Effect hooks
  useEffect(() => {
    isEnabledRef.current = isEnabled;
  }, [isEnabled]);

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    try {
      const savedSettings = localStorage.getItem('displayLockSettings');
      if (savedSettings) {
        const { isEnabled: savedIsEnabled } = JSON.parse(savedSettings);
        setIsEnabled(savedIsEnabled);
      }

      if ('Notification' in window) {
        setNotificationPermission(Notification.permission);
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  }, [isMounted]);

  useEffect(() => {
    if (!isMounted || !isEnabled) return;

    const handleVisibilityChange = () => {
      checkFocusAndActivity();
    };

    const handleActivityCheck = () => {
      checkFocusAndActivity();
    };

    focusIntervalRef.current = setInterval(handleActivityCheck, CHECK_INTERVAL);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (focusIntervalRef.current) {
        clearInterval(focusIntervalRef.current);
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isMounted, isEnabled, checkFocusAndActivity]);

  const toggleDisplayLock = useCallback(async () => {
    if (!isMounted) return;

    const newState = !isEnabled;

    if (newState && notificationPermission === 'default') {
      const permission = await requestNotificationPermission();
      setNotificationPermission(permission);
    }

    setIsEnabled(newState);
    leaveTimeRef.current = null;
    lastActiveTimeRef.current = Date.now();
    setShowWarning(false);

    try {
      localStorage.setItem('displayLockSettings', JSON.stringify({
        isEnabled: newState,
        warningThreshold
      }));
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  }, [isMounted, isEnabled, notificationPermission, warningThreshold, requestNotificationPermission]);

  return (
    <DisplayLockContext.Provider value={{
      isEnabled,
      toggleDisplayLock,
      notificationPermission,
      requestNotificationPermission
    }}>
      {children}
      {showWarning && (
        <div className={`${styles.warningContainer} ${styles[warningType]}`}>
          <div className={styles.warningContent}>
            <p className={styles.warningMessage}>{warningMessage}</p>
            <button
              onClick={() => setShowWarning(false)}
              className={styles.closeButton}
              aria-label="Close warning"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </DisplayLockContext.Provider>
  );
};

export default DisplayLockProvider;