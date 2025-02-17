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
  const [serviceWorkerRegistration, setServiceWorkerRegistration] = useState(null);

  // デバッグ用のログ関数
  const log = useCallback((message, data = {}) => {
    console.log(`[DisplayLock] ${message}`, data);
  }, []);

  // Service Workerの登録
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      log('Registering Service Worker');
      navigator.serviceWorker
        .register('/display-lock-sw.js', { scope: '/' }) //ファイルパスはデフォルトでpublic直下
        .then(registration => {
          log('Service Worker registered successfully', { registration });
          setServiceWorkerRegistration(registration);
          
          // Service Worker がアクティブになるのを待つ
          if (registration.active) {
            initializeServiceWorker(registration.active);
          } else {
            registration.addEventListener('activate', () => {
              log('Service Worker activated');
              initializeServiceWorker(registration.active);
            });
          }
        })
        .catch(error => {
          console.error('Service Worker registration failed:', error);
        });
    }
  }, []);

  // Service Workerの初期化
  const initializeServiceWorker = useCallback((serviceWorker) => {
    log('Initializing Service Worker', { isEnabled, warningThreshold });
    serviceWorker.postMessage({
      type: 'INITIALIZE',
      data: {
        isEnabled,
        warningThreshold
      }
    });
  }, [isEnabled, warningThreshold]);

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

  // Service Workerからのメッセージを処理
  useEffect(() => {
    if (!navigator.serviceWorker) return;

    const handleMessage = (event) => {
      log('Received message from Service Worker', event.data);
      
      if (event.data.type === 'DISPLAY_LOCK_WARNING') {
        const { warningType, snsUrl } = event.data;
        const message = getRandomMessage(warningType, snsUrl);
        setWarningMessage(message);
        setWarningType(warningType);
        setShowWarning(true);
        showNotification(message);
      }
    };

    navigator.serviceWorker.addEventListener('message', handleMessage);
    
    return () => {
      navigator.serviceWorker.removeEventListener('message', handleMessage);
    };
  }, [getRandomMessage, showNotification, log]);

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

    // Service Workerに状態を通知
    if (serviceWorkerRegistration?.active) {
      log('Sending state update to Service Worker', { newState });
      serviceWorkerRegistration.active.postMessage({
        type: 'UPDATE_STATE',
        data: { isEnabled: newState }
      });
    } else {
      log('Service Worker not ready for state update');
    }

    try {
      localStorage.setItem('displayLockSettings', JSON.stringify({
        isEnabled: newState,
        warningThreshold
      }));
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  }, [isMounted, isEnabled, notificationPermission, warningThreshold, requestNotificationPermission, serviceWorkerRegistration, log]);

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