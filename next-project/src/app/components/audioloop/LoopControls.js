import React from 'react';
import styles from './LoopControls.module.css';

const LoopControls = ({
  isRandomPlay,
  isRepeatMode,
  onRandomPlayToggle,
  onRepeatModeToggle
}) => {
  return (
    <div className={styles.container}>
      <button 
        onClick={onRandomPlayToggle}
        className={`
          ${styles.button} 
          ${isRandomPlay ? styles.activeButton : styles.inactiveButton}
        `}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 16V6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2Z"></path>
          <path d="M7 8l4 4 4-4"></path>
          <path d="M7 16l4-4 4 4"></path>
        </svg>
        Random Play
      </button>

      <button 
        onClick={onRepeatModeToggle}
        className={`
          ${styles.button} 
          ${isRepeatMode ? styles.activeButton : styles.inactiveButton}
        `}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="17 1 21 5 17 9"></polyline>
          <path d="M3 11V9a4 4 0 0 1 4-4h14"></path>
          <polyline points="7 23 3 19 7 15"></polyline>
          <path d="M21 13v2a4 4 0 0 1-4 4H3"></path>
        </svg>
        Repeat Mode
      </button>
    </div>
  );
};

export default LoopControls;