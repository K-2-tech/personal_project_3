import React, { useState, useEffect, useRef } from 'react';
import styles from './AudioPlayer.module.css';

const AudioPlayer = ({ 
  files, 
  isRandomPlay = false, 
  isRepeatMode = false 
}) => {
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  // Shuffle function for randomizing playlist
  const shuffleArray = (array) => {
    const shuffledArray = [...array];
    for (let i = shuffledArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
    }
    return shuffledArray;
  };

  // Prepare files for playback (potentially shuffled)
  const playbackFiles = isRandomPlay 
    ? shuffleArray(files) 
    : [...files];

  // Handle audio end
  const handleAudioEnded = () => {
    // If there are more files to play
    if (currentFileIndex < playbackFiles.length - 1) {
      setCurrentFileIndex(prev => prev + 1);
    } else {
      // If repeat mode is on, reset to first file
      if (isRepeatMode) {
        setCurrentFileIndex(0);
      } else {
        // Stop playing if no repeat
        setIsPlaying(false);
      }
    }
  };

  // Play/pause toggle
  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  // Skip to next track
  const nextTrack = () => {
    const nextIndex = currentFileIndex < playbackFiles.length - 1 
      ? currentFileIndex + 1 
      : 0;
    setCurrentFileIndex(nextIndex);
  };

  // Skip to previous track
  const prevTrack = () => {
    const prevIndex = currentFileIndex > 0 
      ? currentFileIndex - 1 
      : playbackFiles.length - 1;
    setCurrentFileIndex(prevIndex);
  };

  // Effect to play audio when file changes or play state changes
  useEffect(() => {
    if (playbackFiles.length === 0) return;

    const audioElement = audioRef.current;
    
    // Create object URL for the current file
    const fileUrl = URL.createObjectURL(playbackFiles[currentFileIndex]);
    audioElement.src = fileUrl;

    // Play if in playing state
    if (isPlaying) {
      audioElement.play().catch(error => {
        console.error('Error playing audio:', error);
        setIsPlaying(false);
      });
    }

    // Cleanup function
    return () => {
      audioElement.pause();
      URL.revokeObjectURL(fileUrl);
    };
  }, [currentFileIndex, playbackFiles, isPlaying]);

  // If no files, return null
  if (files.length === 0) return null;

  return (
    <div className={styles.audioPlayerContainer}>
      <audio 
        ref={audioRef} 
        onEnded={handleAudioEnded}
      />
      
      <div className={styles.playerControls}>
        <button 
          onClick={prevTrack} 
          className={styles.controlButton}
          disabled={files.length <= 1}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 19V5l-7 7 7 7"/><path d="M17 19V5l-7 7 7 7"/>
          </svg>
        </button>

        <button 
          onClick={togglePlay} 
          className={styles.playPauseButton}
        >
          {isPlaying ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="5 3 19 12 5 21 5 3"/>
            </svg>
          )}
        </button>

        <button 
          onClick={nextTrack} 
          className={styles.controlButton}
          disabled={files.length <= 1}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M13 19V5l7 7-7 7"/><path d="M7 19V5l7 7-7 7"/>
          </svg>
        </button>
      </div>

      <div className={styles.trackInfo}>
        <p className={styles.currentTrack}>
          Now Playing: {playbackFiles[currentFileIndex].name}
        </p>
      </div>
    </div>
  );
};

export default AudioPlayer;