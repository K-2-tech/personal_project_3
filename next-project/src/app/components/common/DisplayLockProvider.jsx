// DisplayLockProvider.jsx
'use client';
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import Script from 'next/script';
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
  const [warningType, setWarningType] = useState('sns'); // sns または longAbsence
  const [warningThreshold, setWarningThreshold] = useState(1); // 1分の猶予時間
  const [notificationPermission, setNotificationPermission] = useState('default');
  const [isMounted, setIsMounted] = useState(false);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);

  // 警告メッセージの生成（sns と longAbsence のみ）
  const getRandomMessage = useCallback((messageType = 'sns') => {
    const messages = {
      sns: [
        "📚 Learning time, not scrolling time!",
        "🎯 Eyes on the prize - back to studying!",
        "💪 Don't let social media break your concentration!",
        "👀 Don't go on social media!",
        "💛 Try to resist checking social media!"
      ],
      longAbsence: [
        "⏰ Time to get back to your studies!",
        "📚 Your learning materials are waiting!",
        "🔄 Let's resume where you left off!",
        "⚡ Reactivate your focus mode!"
      ],
    };
    const list = messages[messageType] || messages.sns;
    return list[Math.floor(Math.random() * list.length)];
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

  // updateSettings 関数（warningThreshold の更新）
  const updateSettings = useCallback((newThreshold) => {
    setWarningThreshold(newThreshold);
    // focus-monitor.js 側にも反映（グローバルインスタンスの場合）
    if (window.focusMonitor) {
      window.focusMonitor.warningThreshold = newThreshold;
    }
    try {
      localStorage.setItem('displayLockSettings', JSON.stringify({
        isEnabled,
        warningThreshold: newThreshold
      }));
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  }, [isEnabled]);

  // BroadcastChannelからのメッセージを処理
  useEffect(() => {
    if (!isEnabled || !isScriptLoaded) return;
    const channel = new BroadcastChannel('learnlooper_focus');
    const handleMessage = (event) => {
      if (event.data.type === 'FOCUS_WARNING') {
        const message = getRandomMessage(event.data.warningType);
        setWarningMessage(message);
        setWarningType(event.data.warningType);
        setShowWarning(true);
        showNotification(message);
      }
    };
    channel.addEventListener('message', handleMessage);
    return () => {
      channel.removeEventListener('message', handleMessage);
      channel.close();
    };
  }, [isEnabled, isScriptLoaded, getRandomMessage, showNotification]);

  // 設定の読み込み
  useEffect(() => {
    setIsMounted(true);
    try {
      const savedSettings = localStorage.getItem('displayLockSettings');
      if (savedSettings) {
        const { isEnabled: savedIsEnabled, warningThreshold: savedThreshold } = JSON.parse(savedSettings);
        setIsEnabled(savedIsEnabled);
        setWarningThreshold(savedThreshold);
        if (window.focusMonitor) {
          window.focusMonitor.warningThreshold = savedThreshold;
        }
      }
      if ('Notification' in window) {
        setNotificationPermission(Notification.permission);
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
    return () => setIsMounted(false);
  }, []);

  // FocusMonitor の状態を更新
  useEffect(() => {
    if (!isScriptLoaded || !window.focusMonitor) return;
    if (isEnabled) {
      window.focusMonitor.enable();
    } else {
      window.focusMonitor.disable();
    }
  }, [isEnabled, isScriptLoaded]);

  // DisplayLock の切り替え
  const toggleDisplayLock = useCallback(async () => {
    if (!isMounted) return;
    const newState = !isEnabled;
    if (newState && notificationPermission === 'default') {
      const permission = await requestNotificationPermission();
      setNotificationPermission(permission);
    }
    setIsEnabled(newState);
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
      warningThreshold,
      updateSettings,
      notificationPermission,
      requestNotificationPermission
    }}>
      <Script 
        src="/focus-monitor.js"
        onLoad={() => setIsScriptLoaded(true)}
      />
      {children}
      
    </DisplayLockContext.Provider>
  );
};

export default DisplayLockProvider;
