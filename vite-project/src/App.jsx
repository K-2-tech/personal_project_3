import React from 'react';
import { PomodoroProvider } from './contexts/PomodoroContext';
import { YouTubeProvider } from './contexts/YouTubeContext';
import MainContainer from './components/MainContainer';
import "./App.css"
const App = () => {
  return (
    <PomodoroProvider>
      <YouTubeProvider>
        <MainContainer />
      </YouTubeProvider>
    </PomodoroProvider>
  );
};

export default App;