import React from "react";
import { PomodoroProvider } from "../../contexts/learnlooper/PomodoroContext";
import { YouTubeProvider } from "../../contexts/learnlooper/YouTubeContext";
import MainContainer from "../../components/learnlooper/MainContainer";
import Header from "../../components/common/Header";
import Footer from "../../components/common/Footer";

const LL = () => {
  return (
    <>
      <Header />
      <PomodoroProvider>
        <YouTubeProvider>
          <MainContainer />
        </YouTubeProvider>
      </PomodoroProvider>
      <Footer />
    </>
  );
};

export default LL;
