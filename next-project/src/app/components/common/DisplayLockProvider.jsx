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
  const [isEnabled, setIsEnabled] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');
  const [warningType, setWarningType] = useState('default');
  const [warningThreshold] = useState(10);
  const [notificationPermission, setNotificationPermission] = useState('default');
  const [isMounted, setIsMounted] = useState(false);

  const leaveTimeRef = useRef(null);
  const warningTimeoutRef = useRef(null);
  const isVisibleRef = useRef(true);
  const isEnabledRef = useRef(isEnabled);

  // デバッグ用のログ関数
  const log = useCallback((message, data = {}) => {
    console.log(`[DisplayLock] ${message}`, data);
  }, []);

  // 警告メッセージの生成
  const getRandomMessage = useCallback((messageType = 'default', snsUrl = '') => {
    const messages = {
      sns: [
        `🚫 ${snsUrl} detected! Stay focused on your studies!`,
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

  // 警告を表示する関数
  const showWarningMessage = useCallback((type, snsUrl = '') => {
    const message = getRandomMessage(type, snsUrl);
    setWarningMessage(message);
    setWarningType(type);
    setShowWarning(true);
    showNotification(message);
  }, [getRandomMessage, showNotification]);

  // 通知の許可を要求する関数
  const requestNotificationPermission = useCallback(async () => {
    if (!('Notification' in window)) return 'denied';

    try {
      const permission = await Notification.requestPermission();
      log('Notification permission result', { permission });
      setNotificationPermission(permission);
      return permission;
    } catch (error) {
      console.error('Failed to request notification permission:', error);
      return 'denied';
    }
  }, [log]);

  // タブの可視性変更を監視
  useEffect(() => {
    if (!isEnabled) return;

    const handleVisibilityChange = () => {
      const isVisible = !document.hidden;
      log('Visibility changed', { isVisible });
      isVisibleRef.current = isVisible;

      if (isVisible) {
        // LearnLooperに戻ってきた場合
        leaveTimeRef.current = null;
        if (warningTimeoutRef.current) {
          clearTimeout(warningTimeoutRef.current);
          warningTimeoutRef.current = null;
        }
        setShowWarning(false);
      } else {
        // LearnLooperを離れた場合
        leaveTimeRef.current = Date.now();
        // longAbsence警告のタイマーをセット
        warningTimeoutRef.current = setTimeout(() => {
          if (isEnabledRef.current && !isVisibleRef.current) {
            showWarningMessage('longAbsence');
          }
        }, warningThreshold * 60 * 1000);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (warningTimeoutRef.current) {
        clearTimeout(warningTimeoutRef.current);
      }
    };
  }, [isEnabled, warningThreshold, showWarningMessage, log]);

  // BroadcastChannelを使用してSNS検出を共有
  useEffect(() => {
    if (!isEnabled) return;

    const channel = new BroadcastChannel('learnlooper_focus');
    
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

    // 現在のドメインがSNSかチェック
    const checkCurrentDomain = () => {
      const currentDomain = window.location.hostname;
      if (SNS_DOMAINS.some(domain => 
        currentDomain === domain || currentDomain.endsWith('.' + domain)
      )) {
        channel.postMessage({ type: 'SNS_DETECTED', domain: currentDomain });
      }
    };

    // メッセージを受信したときの処理
    const handleMessage = (event) => {
      if (event.data.type === 'SNS_DETECTED' && !isVisibleRef.current) {
        showWarningMessage('sns', event.data.domain);
      }
    };

    channel.addEventListener('message', handleMessage);
    
    // 定期的にドメインをチェック
    const checkInterval = setInterval(checkCurrentDomain, 5000);

    return () => {
      channel.removeEventListener('message', handleMessage);
      channel.close();
      clearInterval(checkInterval);
    };
  }, [isEnabled, showWarningMessage]);

  // isEnabledの参照を更新
  useEffect(() => {
    isEnabledRef.current = isEnabled;
  }, [isEnabled]);

  // 設定の読み込み
  useEffect(() => {
    setIsMounted(true);
    
    try {
      const savedSettings = localStorage.getItem('displayLockSettings');
      if (savedSettings) {
        const { isEnabled: savedIsEnabled } = JSON.parse(savedSettings);
        log('Loaded saved settings', { savedIsEnabled });
        setIsEnabled(savedIsEnabled);
      }

      if ('Notification' in window) {
        setNotificationPermission(Notification.permission);
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }

    return () => setIsMounted(false);
  }, [log]);

  // DisplayLockの切り替え
  const toggleDisplayLock = useCallback(async () => {
    if (!isMounted) return;

    const newState = !isEnabled;
    log('Toggling DisplayLock', { newState });

    if (newState && notificationPermission === 'default') {
      const permission = await requestNotificationPermission();
      setNotificationPermission(permission);
    }

    setIsEnabled(newState);
    setShowWarning(false);
    leaveTimeRef.current = null;

    try {
      localStorage.setItem('displayLockSettings', JSON.stringify({
        isEnabled: newState,
        warningThreshold
      }));
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  }, [isMounted, isEnabled, notificationPermission, warningThreshold, requestNotificationPermission, log]);

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