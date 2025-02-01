'use client';
import React from 'react';
import { useDisplayLock } from '../common/DisplayLockProvider';

const DisplayLock = () => {
  const { 
    isEnabled, 
    toggleDisplayLock,
    warningThreshold  // カスタマイズされた警告時間を取得
  } = useDisplayLock();

  return (
    <button
      onClick={toggleDisplayLock}
      className={`display-lock-button ${isEnabled ? 'enabled' : 'disabled'}`}
    >
      <div className="display-lock-icon">
        {isEnabled ? '🔔' : '🔕'}
      </div>
      <span>Display Lock: {isEnabled ? 'ON' : 'OFF'}</span>
    </button>
  );
};

export default DisplayLock;