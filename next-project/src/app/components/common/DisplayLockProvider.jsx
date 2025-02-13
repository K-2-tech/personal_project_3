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

  // Refs
  const isEnabledRef = useRef(isEnabled);
  const warningThresholdRef = useRef(warningThreshold);
  const leaveTimeRef = useRef(null);
  const lastActiveTimeRef = useRef(Date.now());
  const focusIntervalRef = useRef(null);
  const documentHiddenRef = useRef(false);

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

  // 通知を送る関数を追加
  const showNotification = useCallback((message) => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      console.log('Notifications not supported');
      return;
    }

    if (Notification.permission === 'granted') {
      try {
        new Notification('LearnLooper Focus Alert', {
          body: message,
          icon: '/favicon.ico', // あなたのサイトのfaviconパスに変更してください
        });
      } catch (error) {
        console.error('Failed to show notification:', error);
      }
    }
  }, []);

  // 通知の許可を要求する関数を追加
  const requestNotificationPermission = useCallback(async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return;
    }

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

  // 既存のgetRandomMessage関数を拡張
  const getRandomMessage = useCallback((messageType = 'default') => {
    const messages = {
      sns: [
        "Social media is the enemy of studying! Get back now! 🚫",
        "Use this time for studying instead of social media! 📚",
        "Now is not the time for social media! 🎯",
        "Don't break your concentration! Save social media for later! 💪"
      ],
      longAbsence: [
        `It's been over ${warningThreshold} minutes! Time to get back to studying! 😤`,
        "Time to return to focus mode! ⏰",
        "Isn't this break too long? Let's resume studying! 📚",
        `${warningThreshold} minutes have passed! Let's keep going! 💪`
      ],
      default: [
        "Aren't you supposed to be studying? 💪",
        "Don't escape to other tabs! 📵",
        "Come back! Stay focused! 🧐",
        "Wrong tab! Switch back to studying! 📚",
        "Now is the time to focus on learning! 🎯"
      ]
    };

    const messageArray = messages[messageType] || messages.default;
    return messageArray[Math.floor(Math.random() * messageArray.length)];
  }, [warningThreshold]);

  // checkFocusAndActivity関数を更新
  const checkFocusAndActivity = useCallback(() => {
    if (!isEnabledRef.current) return;

    const currentTime = Date.now();
    const currentHostname = window.location.hostname;
    const isLearnLooper = currentHostname === ALLOWED_DOMAIN;
    const isDocumentHidden = document.hidden;
    const isSNS = checkDomain(currentHostname);
    
    console.log('Focus check:', {
      isLearnLooper,
      isDocumentHidden,
      isSNS,
      lastActiveTime: new Date(lastActiveTimeRef.current).toISOString(),
      currentTime: new Date(currentTime).toISOString(),
    });

    // LearnLooperに戻ってきた場合
    if (isLearnLooper && !isDocumentHidden) {
      leaveTimeRef.current = null;
      lastActiveTimeRef.current = currentTime;
      setShowWarning(false);
      return;
    }

    // SNSサイトを検知した場合は即座に警告
    if (isSNS) {
      const message = getRandomMessage('sns');
      setWarningMessage(message);
      setShowWarning(true);
      showNotification(message);
      return;
    }

    // 初めてLearnLooperを離れた場合
    if (!leaveTimeRef.current && (!isLearnLooper || isDocumentHidden)) {
      leaveTimeRef.current = currentTime;
      console.log('Started tracking leave time:', new Date(currentTime).toISOString());
      
      const message = getRandomMessage('default');
      setWarningMessage(message);
      setShowWarning(true);
      return;
    }

    // 長時間離れている場合のチェック
    if (leaveTimeRef.current) {
      const timeDiff = currentTime - leaveTimeRef.current;
      const thresholdMs = warningThresholdRef.current * 60 * 1000;

      if (timeDiff >= thresholdMs) {
        const message = getRandomMessage('longAbsence');
        setWarningMessage(message);
        setShowWarning(true);
        showNotification(message);
      }
    }
  }, [getRandomMessage, showNotification, checkDomain]);

  // isEnabledの変更を追跡
  useEffect(() => {
    isEnabledRef.current = isEnabled;
  }, [isEnabled]);

  // warningThresholdの変更を追跡
  useEffect(() => {
    warningThresholdRef.current = warningThreshold;
  }, [warningThreshold]);

  // コンポーネントのマウント状態を設定
  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  // 初期設定の読み込み
  useEffect(() => {
    if (!isMounted || typeof window === 'undefined') return;

    try {
      const savedSettings = localStorage.getItem('displayLockSettings');
      if (savedSettings) {
        const { isEnabled: savedIsEnabled, warningThreshold: savedThreshold } = JSON.parse(savedSettings);
        setIsEnabled(savedIsEnabled);
        setWarningThreshold(savedThreshold);
      }

      // 通知の許可状態を確認
      if ('Notification' in window) {
        setNotificationPermission(Notification.permission);
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  }, [isMounted]);

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
      const permission = await requestNotificationPermission();
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
  }, [isMounted, isEnabled, notificationPermission, warningThreshold, requestNotificationPermission]);

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