import React from "react";
import Header from "../../components/common/Header";
import Footer from "../../components/common/Footer";
import YouTubeABLoop from "../../components/abloop/YoutubeLoop";
import DisplayLock from '../../components/displaylock/DisplayLock';

const YAB = () => {
  return (
    <>
        <Header />
        <DisplayLock/>
        <YouTubeABLoop />
        <Footer />
    </>
  );
};

export default YAB;
