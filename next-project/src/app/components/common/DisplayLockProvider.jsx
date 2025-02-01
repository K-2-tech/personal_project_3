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
  const CHECK_INTERVAL = 1000; // Check every second

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

  const showNotification = useCallback((message) => {
    if (!isMounted || typeof window === 'undefined') return;
  
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        // 既存の通知をクローズ
        const existingNotification = document.querySelector('[data-notification-id="learnlooper-warning"]');
        if (existingNotification) {
          existingNotification.close();
        }
  
        const notification = new Notification('LearnLooper - 勉強に戻りましょう！', {
          body: message,
          icon: '/icon.svg',
          tag: 'learnlooper-warning',
          requireInteraction: true, // ユーザーが明示的に閉じるまで表示され続ける
          badge: '/icon.svg',      // モバイルデバイスでの小さいアイコン
          vibrate: [200, 100, 200], // バイブレーションパターン
          // サウンドも追加可能ですが、ユーザーを驚かせないよう慎重に検討する必要があります
          // sound: '/notification-sound.wav'
        });
  
        // 通知がクリックされたときの処理
        notification.onclick = () => {
          // LearnLooperのタブをアクティブにする
          window.focus();
          // 特定のタブにフォーカスを移動（必要な場合）
          if (window.opener) {
            window.opener.focus();
          }
          notification.close();
        };
  
        // 通知が閉じられたときの処理
        notification.onclose = () => {
          console.log('Notification was closed');
        };
  
        // エラーハンドリング
        notification.onerror = (error) => {
          console.error('Notification error:', error);
        };
  
      } catch (error) {
        console.error('Failed to show notification:', error);
      }
    }
  }, [isMounted]);

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
      requestNotificationPermission: async () => {
        if (typeof window === 'undefined') return false;
        const permission = await Notification.requestPermission();
        setNotificationPermission(permission);
        return permission === 'granted';
      }
    }}>
      {children}
      {showWarning && (
        <div className="fixed top-4 right-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded shadow-lg z-50 max-w-md">
          <div className="flex items-start">
            <div className="ml-3">
              <p className="font-bold">{warningMessage}</p>
            </div>
            <button
              onClick={() => setShowWarning(false)}
              className="ml-auto -mx-1.5 -my-1.5 bg-red-100 text-red-500 rounded-lg p-1.5 hover:bg-red-200 inline-flex"
            >
              <span className="sr-only">Dismiss</span>
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