import React from "react";
import { PomodoroProvider } from "../contexts/PomodoroContext";
import { YouTubeProvider } from "../contexts/YouTubeContext";
import MainContainer from "../components/MainContainer";
import Header from "../components/Header";
import Footer from "../components/Footer";

const Home = () => {
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

export default Home;
