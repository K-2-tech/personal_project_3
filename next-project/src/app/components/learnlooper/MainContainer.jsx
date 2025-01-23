"use client";
import React, { useEffect } from "react";
import { usePomodoro } from "../../contexts/learnlooper/PomodoroContext";
import { useYouTube } from "../../contexts/learnlooper/YouTubeContext";
import PomodoroTimer from "./PomodoroTimer";
import YouTubePlayer from "./YouTubePlayer";
import TaskList from "./TaskList";
import styles from "./MainContainer.module.css";
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
    <div
      className={`${styles.mainContainer} ${
        isStudying ? styles.studyMode : ""
      }`}
    >
      <div
        className={`${styles.playerSection} ${
          isActive && isStudying
            ? styles.activeStudyMode
            : !isActive && isStudying
            ? styles.inactiveStudyMode
            : ""
        }`}
      >
        <YouTubePlayer />
      </div>
      <div
        className={`${styles.timerSection} ${
          isActive && isStudying
            ? styles.activeStudyMode
            : !isActive && isStudying
            ? styles.inactiveStudyMode
            : ""
        }`}
      >
        <PomodoroTimer />
      </div>
      <TaskList />
    </div>
  );
};

export default MainContainer;
