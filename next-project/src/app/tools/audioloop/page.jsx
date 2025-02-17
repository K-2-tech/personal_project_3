"use client";

import React, { useState } from 'react';
import Header from "../../components/common/Header";
import Footer from "../../components/common/Footer";
import AudioUploader from '../../components/audioloop/AudioUploader';
import AudioPlayerList from '../../components/audioloop/AudioPlayerList';
import LoopControls from '../../components/audioloop/LoopControls';
import AudioPlayer from '../../components/audioloop/AudioPlayer'
import styles from './AudioLoopPage.module.css';
export default function AudioLoopPage() {
  const [audioFiles, setAudioFiles] = useState([]);
  const [isRandomPlay, setIsRandomPlay] = useState(false);
  const [isRepeatMode, setIsRepeatMode] = useState(false);

  const handleFileUpload = (files) => {
    setAudioFiles(prevFiles => {
      const newFiles = [...prevFiles, ...files].slice(0, 10);
      return newFiles;
    });
  };

  const handleRemoveFile = (index) => {
    setAudioFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
  };

  const handleReorderFiles = (dragIndex, hoverIndex) => {
    const newFiles = [...audioFiles];
    const [removed] = newFiles.splice(dragIndex, 1);
    newFiles.splice(hoverIndex, 0, removed);
    setAudioFiles(newFiles);
  };

  return (
    <><Header /><div className={styles.container}>
    <div className={styles.card}>
      <h1 className={styles.title}>
        📁 LearnLooper: Multiple Audio Files Loop Tool
      </h1>

      <AudioUploader 
        onFileUpload={handleFileUpload} 
        maxFiles={10}
      />

      <AudioPlayerList 
        files={audioFiles}
        onRemoveFile={handleRemoveFile}
        onReorderFiles={handleReorderFiles}
      />

      <LoopControls 
        isRandomPlay={isRandomPlay}
        isRepeatMode={isRepeatMode}
        onRandomPlayToggle={() => setIsRandomPlay(!isRandomPlay)}
        onRepeatModeToggle={() => setIsRepeatMode(!isRepeatMode)}
      />

      <AudioPlayer 
        files={audioFiles}
        isRandomPlay={isRandomPlay}
        isRepeatMode={isRepeatMode}
      />
    </div>
  </div><Footer /></>
    
  );
}
