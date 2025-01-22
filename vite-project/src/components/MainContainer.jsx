import React, { useEffect } from "react";
import { usePomodoro } from "../contexts/PomodoroContext";
import { useYouTube } from "../contexts/YouTubeContext";
import PomodoroTimer from "./PomodoroTimer";
import YouTubePlayer from "./YouTubePlayer";
import TaskList from "./TaskList";

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
    <div className={`main-container ${isStudying ? "study-mode" : ""}`}>
      <div
        className={`player-section ${
          isActive && isStudying
            ? "active-study-mode"
            : !isActive && isStudying
            ? "inactive-study-mode"
            : ""
        }`}
      >
        <YouTubePlayer />
      </div>
      <div
        className={`timer-section ${
          isActive && isStudying
            ? "active-study-mode"
            : !isActive && isStudying
            ? "inactive-study-mode"
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
