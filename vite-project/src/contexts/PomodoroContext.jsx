import React, {
  createContext,
  useState,
  useContext,
  useCallback,
  useEffect,
} from "react";

const PomodoroContext = createContext();

export const PomodoroProvider = ({ children }) => {
  const [isStudying, setIsStudying] = useState(true);
  const [studyDuration, setStudyDuration] = useState(25 * 60);
  const [breakDuration, setBreakDuration] = useState(5 * 60);
  const [timeRemaining, setTimeRemaining] = useState(studyDuration);
  const [isActive, setIsActive] = useState(false);

  // タイマーの自動切り替え処理
  useEffect(() => {
    let interval = null;
    if (isActive && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining((prevTime) => prevTime - 1);
      }, 1000);
    } else if (timeRemaining === 0) {
      // 時間切れの処理
      if (isStudying) {
        // 学習時間が終わったらBreak timeに切り替え
        setIsStudying(false);
        setTimeRemaining(breakDuration);
      } else {
        // Break timeが終わったら学習時間に切り替え
        setIsStudying(true);
        setTimeRemaining(studyDuration);
      }
    }

    return () => clearInterval(interval);
  }, [isActive, timeRemaining, isStudying, studyDuration, breakDuration]);

  const startTimer = useCallback(() => {
    setIsActive(true);
  }, []);

  const pauseTimer = useCallback(() => {
    setIsActive(false);
  }, []);

  const resetTimer = useCallback(() => {
    setIsActive(false);
    setIsStudying(true);
    setTimeRemaining(studyDuration);
  }, [studyDuration]);

  const updateStudyDuration = useCallback(
    (minutes) => {
      const newDuration = minutes * 60;
      setStudyDuration(newDuration);
      if (!isActive && isStudying) {
        setTimeRemaining(newDuration);
      }
    },
    [isActive, isStudying]
  );

  const updateBreakDuration = useCallback(
    (minutes) => {
      const newDuration = minutes * 60;
      setBreakDuration(newDuration);
      if (!isActive && !isStudying) {
        setTimeRemaining(newDuration);
      }
    },
    [isActive, isStudying]
  );

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
        updateBreakDuration,
        setTimeRemaining,
        setIsStudying,
      }}
    >
      {children}
    </PomodoroContext.Provider>
  );
};

export const usePomodoro = () => useContext(PomodoroContext);
