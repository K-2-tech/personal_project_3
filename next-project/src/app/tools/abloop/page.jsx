import React from "react";
import Header from "../../components/common/Header";
import Footer from "../../components/common/Footer";
import YouTubeABLoop from "../../components/abloop/YoutubeLoop";
import DisplayLockControl from '../../components/displaylockcontrol/DisplayLockControl';

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
