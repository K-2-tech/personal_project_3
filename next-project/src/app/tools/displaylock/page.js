'use client';
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import styles from './DisplayLockPage.module.css';
import Header from "../../components/common/Header";
import Footer from "../../components/common/Footer";

// クライアントサイドでのみ読み込むコンポーネント
const DisplayLock = dynamic(
  () => import('../../components/displaylock/DisplayLock'),
  { ssr: false }
);

// DisplayLockProviderをラップしたコンポーネント
const DisplayLockWrapper = dynamic(
  () => import('../../components/common/DisplayLockProvider').then(mod => {
    const { useDisplayLock } = mod;
    return function DisplayLockPageContent() {
      const { 
        isEnabled,
        warningThreshold, 
        updateSettings,
        notificationPermission,
        requestNotificationPermission
      } = useDisplayLock();
      
      const [timeInput, setTimeInput] = useState(warningThreshold);
      const [showSaved, setShowSaved] = useState(false);
      const [isMounted, setIsMounted] = useState(false);

      useEffect(() => {
        setIsMounted(true);
        setTimeInput(warningThreshold);
      }, [warningThreshold]);

      if (!isMounted) {
        return null; // 初期レンダリング時は何も表示しない
      }

      const handleTimeChange = (e) => {
        const value = parseInt(e.target.value, 10);
        if (!isNaN(value) && value > 0) {
          setTimeInput(value);
        }
      };

      const handleTimeBlur = () => {
        if (timeInput !== warningThreshold) {
          updateSettings(timeInput);
          setShowSaved(true);
          setTimeout(() => setShowSaved(false), 2000);
        }
      };

      const handleTimeSubmit = (e) => {
        e.preventDefault();
        if (timeInput !== warningThreshold) {
          updateSettings(timeInput);
          setShowSaved(true);
          setTimeout(() => setShowSaved(false), 2000);
        }
      };

      const getNotificationStatus = () => {
        if (typeof window === 'undefined') return '';
        if (!('Notification' in window)) {
          return 'Notifications are not supported in this browser';
        }
        switch (notificationPermission) {
          case 'granted':
            return 'Notifications are enabled';
          case 'denied':
            return 'Notifications are blocked. Please enable them in your browser settings.';
          default:
            return 'Notifications permission is required for optimal functionality';
        }
      };

      return (
        <div className={styles.settingsWrapper}>
          <div className={styles.settingGroup}>
            <label className={styles.settingLabel}>
              Enable/Disable Display Lock
              <span className={`${styles.statusIndicator} ${isEnabled ? styles.enabled : styles.disabled}`}>
                {isEnabled ? 'Enabled' : 'Disabled'}
              </span>
            </label>
            <DisplayLock />
            <p className={styles.hint}>
              Toggle the Display Lock feature on or off. When enabled, it monitors your activity on LearnLooper and sends notifications if you become inactive.
            </p>
          </div>

          <div className={styles.settingGroup}>
            <label className={styles.settingLabel}>
              Warning Time Threshold
            </label>
            <form onSubmit={handleTimeSubmit}>
              <input
                type="number"
                min="1"
                max="120"
                value={timeInput}
                onChange={handleTimeChange}
                onBlur={handleTimeBlur}
                className={styles.timeInput}
                aria-label="Warning time threshold in minutes"
              />
              <span> minutes</span>
              {showSaved && (
                <span className={`${styles.statusIndicator} ${styles.enabled}`}>
                  Saved
                </span>
              )}
            </form>
            <p className={styles.hint}>
              Set the duration (in minutes) of inactivity on LearnLooper before a warning is issued. The default is 1 minute.
            </p>
          </div>

          <div className={styles.settingGroup}>
            <label className={styles.settingLabel}>
              Notification Settings
              <span className={`${styles.statusIndicator} ${notificationPermission === 'granted' ? styles.enabled : styles.disabled}`}>
                {notificationPermission === 'granted' ? 'Enabled' : 'Disabled'}
              </span>
            </label>
            {notificationPermission === 'default' && (
              <button 
                onClick={requestNotificationPermission}
                className={styles.notificationButton}
              >
                Enable Browser Notifications
              </button>
            )}
            <p className={styles.hint}>
              {getNotificationStatus()}
            </p>
          </div>

          <div className={styles.settingGroup}>
            <label className={styles.settingLabel}>
              About Display Lock
            </label>
            <p className={styles.hint}>
              Display Lock enhances your study sessions by:
            </p>
            <ul className={styles.featureList}>
              <li>Monitoring tab switches within LearnLooper</li>
              <li>Sending immediate reminders when you switch tabs</li>
              <li>Issuing a warning if you remain inactive for longer than the set threshold</li>
              <li>Providing customizable warning thresholds</li>
            </ul>
          </div>
        </div>
      );
    };
  }),
  { ssr: false }
);

// メインのページコンポーネント
export default function DisplayLockPage() {
  return (
    <>
      <Header />
      <div className={styles.container}>
        <h1 className={styles.title}>Display Lock Settings</h1>
        <p className={styles.description}>
          Display Lock helps you stay focused by monitoring your activity on LearnLooper. 
          It sends an immediate warning when you switch tabs and another notification 
          if you remain inactive for a set period.
        </p>
        <DisplayLockWrapper />
      </div>
      <Footer />
    </>
  );
}
