import React, { useEffect } from "react";
import { usePomodoro } from "../contexts/PomodoroContext";

const PomodoroTimer = () => {
  const {
    isStudying,
    timeRemaining,
    isActive,
    startTimer,
    pauseTimer,
    resetTimer,
    setTimeRemaining,
    setIsStudying,
    studyDuration,
    breakDuration,
    updateStudyDuration,
  } = usePomodoro();

  useEffect(() => {
    let interval = null;
    if (isActive && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining((time) => time);
      }, 1000);
    } else if (timeRemaining === 0) {
      if (isStudying) {
        setIsStudying(false);
        setTimeRemaining(breakDuration);
      } else {
        setIsStudying(true);
        setTimeRemaining(studyDuration);
      }
    }
    return () => clearInterval(interval);
  }, [isActive, timeRemaining, isStudying]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="pomodoro-timer">
      <div className="timer-display">
        <h2>{isStudying ? "Study Time" : "Break Time"}</h2>
        <div className="time">{formatTime(timeRemaining)}</div>
      </div>
      <div className="timer-controls">
        <button onClick={isActive ? pauseTimer : startTimer}>
          {isActive ? "Pause" : "Start"}
        </button>
        <button onClick={resetTimer}>Reset</button>
        <select
          value={studyDuration / 60}
          onChange={(e) => updateStudyDuration(parseInt(e.target.value))}
          disabled={isActive}
        >
          <option value="1">1 min</option>
          <option value="15">15 min</option>
          <option value="25">25 min</option>
          <option value="30">30 min</option>
          <option value="45">45 min</option>
        </select>
      </div>
    </div>
  );
};

export default PomodoroTimer;
