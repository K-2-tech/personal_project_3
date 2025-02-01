'use client';
import { useState, useEffect } from 'react';
import DisplayLock from '../../displaylock/DisplayLock';
import { useDisplayLock } from '../../common/DisplayLockProvider';
import styles from './DisplayLockPage.module.css';

export default function DisplayLockPage() {
  const { 
    isEnabled,
    warningThreshold, 
    updateSettings,
    notificationPermission,
    requestNotificationPermission
  } = useDisplayLock();

  const [timeInput, setTimeInput] = useState(warningThreshold);
  const [showSaved, setShowSaved] = useState(false);

  useEffect(() => {
    setTimeInput(warningThreshold);
  }, [warningThreshold]);

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
    <div className={styles.container}>
      <h1 className={styles.title}>Display Lock Settings</h1>
      <p className={styles.description}>
        Display Lock helps maintain your focus by monitoring tab switches and 
        detecting prolonged absences from your study session. It allows free 
        navigation within LearnLooper while sending notifications when you spend 
        too much time on external websites.
      </p>

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
            Toggle Display Lock functionality on or off. When enabled, it will 
            monitor your browsing activity and help you stay focused.
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
              <span className={styles.statusIndicator + ' ' + styles.enabled}>
                Saved
              </span>
            )}
          </form>
          <p className={styles.hint}>
            Set how long you can spend on external sites before receiving a 
            warning notification (1-120 minutes).
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
            Display Lock is designed to enhance your study sessions by:
          </p>
          <ul className={styles.featureList}>
            <li>Monitoring tab switches and website navigation</li>
            <li>Sending timely reminders when you're off-track</li>
            <li>Allowing free movement within LearnLooper</li>
            <li>Providing customizable warning thresholds</li>
          </ul>
        </div>
      </div>
    </div>
  );
}