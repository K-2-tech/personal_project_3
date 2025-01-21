import React, { createContext, useState, useContext, useCallback } from 'react';

const PomodoroContext = createContext();

export const PomodoroProvider = ({ children }) => {
  const [isStudying, setIsStudying] = useState(false);
  const [studyDuration, setStudyDuration] = useState(25 * 60); // 25 minutes in seconds
  const [breakDuration, setBreakDuration] = useState(5 * 60); // 5 minutes in seconds
  const [timeRemaining, setTimeRemaining] = useState(studyDuration);
  const [isActive, setIsActive] = useState(false);

  const startTimer = useCallback(() => {
    setIsActive(true);
    setIsStudying(true);
  }, []);

  const pauseTimer = useCallback(() => {
    setIsActive(false);
  }, []);

  const resetTimer = useCallback(() => {
    setIsActive(false);
    setIsStudying(true);
    setTimeRemaining(studyDuration);
  }, [studyDuration]);

  const updateStudyDuration = useCallback((minutes) => {
    const newDuration = minutes * 60;
    setStudyDuration(newDuration);
    if (!isActive) {
      setTimeRemaining(newDuration);
    }
  }, [isActive]);

  return (
    <PomodoroContext.Provider
      value={{
        isStudying,
        studyDuration,
        breakDuration,
        timeRemaining,
        isActive,
        startTimer,
        pauseTimer,
        resetTimer,
        updateStudyDuration,
        setTimeRemaining,
        setIsStudying,
      }}
    >
      {children}
    </PomodoroContext.Provider>
  );
};

export const usePomodoro = () => useContext(PomodoroContext);

