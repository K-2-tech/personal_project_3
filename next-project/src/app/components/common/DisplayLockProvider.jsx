'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';
import "./DisplayLock.module.css"

const DisplayLockContext = createContext(null);

export const useDisplayLock = () => useContext(DisplayLockContext);

const DisplayLockProvider = ({ children }) => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');
  const [leaveTime, setLeaveTime] = useState(null);
  const [isExternalSite, setIsExternalSite] = useState(false);
  const [warningThreshold, setWarningThreshold] = useState(10);
  const [notificationPermission, setNotificationPermission] = useState('default');
  
  const ALLOWED_DOMAIN = 'learnlooper.app';

  // 通知の権限をチェック
  useEffect(() => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  // 通知の権限を要求
  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      try {
        const permission = await Notification.requestPermission();
        setNotificationPermission(permission);
      } catch (error) {
        console.error('Failed to request notification permission:', error);
      }
    }
  };

  const getRandomMessage = (isLongAbsence = false) => {
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
  };

  const showNotification = (message) => {
    if (notificationPermission === 'granted') {
      new Notification('LearnLooper', {
        body: message,
        icon: '/icon.svg',
      });
    }
  };

  // ... 他のユーティリティ関数 ...

  useEffect(() => {
    // ... 既存のコード ...

    const checkInterval = setInterval(() => {
      if (isEnabled && leaveTime && isExternalSite) {
        const currentTime = new Date().getTime();
        const timeDiff = currentTime - leaveTime;
        if (timeDiff >= warningThreshold * 60 * 1000) {
          const message = getRandomMessage(true);
          setWarningMessage(message);
          setShowWarning(true);
          showNotification(message); // 通知を送信
        }
      }
    }, 30000);

    return () => {
      clearInterval(checkInterval);
      // ... 他のクリーンアップ ...
    };
  }, [isEnabled, leaveTime, isExternalSite, warningThreshold, notificationPermission]);

  const toggleDisplayLock = () => {
    const newState = !isEnabled;
    if (newState && notificationPermission === 'default') {
      requestNotificationPermission();
    }
    // ... 既存のコード ...
  };

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