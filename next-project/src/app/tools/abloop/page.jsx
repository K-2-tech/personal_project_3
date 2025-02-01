import React from "react";
import Header from "../../components/common/Header";
import Footer from "../../components/common/Footer";
import YouTubeABLoop from "../../components/abloop/YoutubeLoop";
import DisplayLockControl from '../../components/displaylock/DisplayLock';

const YAB = () => {
  return (
    <>
        <Header />
        <DisplayLockControl/>
        <YouTubeABLoop />
        <Footer />
    </>
  );
};

export default YAB;
