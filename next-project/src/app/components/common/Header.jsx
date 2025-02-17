// Header.jsx
import React from "react";
import styles from "./Header.module.css";
import Image from "next/image";
import Link from "next/link";
import { Lock, Unlock } from "lucide-react";
import { useDisplayLock } from "./DisplayLockProvider";

const Header = () => {
  const {
    isEnabled,
    toggleDisplayLock,
    notificationPermission,
    requestNotificationPermission,
  } = useDisplayLock();

  const handleLockToggle = async () => {
    if (!isEnabled && notificationPermission === 'default') {
      await requestNotificationPermission();
    }
    toggleDisplayLock();
  };

  return (
    <div className={styles.headerWrapper}>
      <div className={styles.contentContainer}>
        <div className={styles.leftSection}>
          <Image src="/icon.svg" height={45} width={45} alt="icon" />
          <Link href="/" className={styles.headerLink}>
            <div className={styles.title}>LearnLooper</div>
          </Link>
        </div>

        <div className={styles.rightSection}>
          <button
            onClick={handleLockToggle}
            className={`${styles.lockButton} ${
              isEnabled ? styles.lockEnabled : styles.lockDisabled
            }`}
            title={isEnabled ? "Disable focus mode" : "Enable focus mode"}
          >
            {isEnabled ? (
              <>
                <Lock size={20} />
                <span className={styles.lockText}>Focus Mode ON</span>
              </>
            ) : (
              <>
                <Unlock size={20} />
                <span className={styles.lockText}>Focus Mode OFF</span>
              </>
            )}
          </button>

          <a
            href="https://docs.google.com/forms/d/e/1FAIpQLScKDnNGjQM9ml7GSCCZTITNWZMoNfCYFcmxncnxiixVcoxbtg/viewform?usp=header"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.feedbackButton}
          >
            Feedback
          </a>
        </div>
      </div>
    </div>
  );
};

export default Header;