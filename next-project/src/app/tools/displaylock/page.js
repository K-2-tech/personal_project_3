'use client';
import DisplayLock from '../../components/displaylock/DisplayLock';
import styles from './DisplayLockPage.module.css';

export default function DisplayLockPage() {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Display Lock</h1>
      <p className={styles.description}>
      To maintain focus, we monitor the switching of tabs.<br/>Within LearnLooper, you are free to move around, and if we detect prolonged absence from the learning environment to external sites, we will prompt you to return to your studies.
      </p>
      <div className={styles.contentWrapper}>
        <DisplayLock />
      </div>
    </div>
  );
}