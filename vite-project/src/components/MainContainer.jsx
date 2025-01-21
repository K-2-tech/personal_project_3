import React, { useEffect } from 'react';
import { usePomodoro } from '../contexts/PomodoroContext';
import { useYouTube } from '../contexts/YouTubeContext';
import PomodoroTimer from './PomodoroTimer';
import YouTubePlayer from './YouTubePlayer';

const MainContainer = () => {
  const { isStudying, isActive } = usePomodoro();
  const { playVideo, pauseVideo } = useYouTube();

  useEffect(() => {
    if (isActive && isStudying) {
      playVideo();
    } else {
      pauseVideo();
    }
  }, [isActive, isStudying, playVideo, pauseVideo]);

  return (
    <div className={`main-container ${!isStudying ? 'break-mode' : ''}`}>
      <div className="player-section">
        <YouTubePlayer />
      </div>
      <div className="timer-section">
        <PomodoroTimer />
      </div>
    </div>
  );
};

export default MainContainer;