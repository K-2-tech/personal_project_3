// contexts/YouTubeContext.jsx
import React, { createContext, useState, useContext, useRef, useCallback } from 'react';

const YouTubeContext = createContext();

export const YouTubeProvider = ({ children }) => {
  const [videoUrl, setVideoUrl] = useState('');
  const [videoId, setVideoId] = useState('');
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const playerRef = useRef(null);

  const playVideo = useCallback(() => {
    if (playerRef.current && isPlayerReady) {
      try {
        playerRef.current.playVideo();
        setIsPlaying(true);
      } catch (error) {
        console.error('Error playing video:', error);
      }
    }
  }, [isPlayerReady]);

  const pauseVideo = useCallback(() => {
    if (playerRef.current && isPlayerReady) {
      try {
        playerRef.current.pauseVideo();
        setIsPlaying(false);
      } catch (error) {
        console.error('Error pausing video:', error);
      }
    }
  }, [isPlayerReady]);

  const initializePlayer = useCallback((videoId) => {
    if (!videoId) return;

    if (playerRef.current) {
      playerRef.current.destroy();
    }

    try {
      playerRef.current = new window.YT.Player('youtube-player', {
        videoId: videoId,
        playerVars: {
          start: startTime,
          end: endTime,
          controls: 1,
        },
        events: {
          onReady: () => {
            setIsPlayerReady(true);
          },
          onStateChange: (event) => {
            if (event.data === window.YT.PlayerState.ENDED) {
              if (isPlaying) {
                playerRef.current.seekTo(startTime);
                playerRef.current.playVideo();
              }
            }
          },
        },
      });
    } catch (error) {
      console.error('Error initializing YouTube player:', error);
      setIsPlayerReady(false);
    }
  }, [startTime, endTime, isPlaying]);

  const cleanupPlayer = useCallback(() => {
    if (playerRef.current) {
      try {
        playerRef.current.destroy();
        playerRef.current = null;
        setIsPlayerReady(false);
      } catch (error) {
        console.error('Error cleaning up player:', error);
      }
    }
  }, []);

  return (
    <YouTubeContext.Provider
      value={{
        videoUrl,
        setVideoUrl,
        videoId,
        setVideoId,
        startTime,
        setStartTime,
        endTime,
        setEndTime,
        isPlaying,
        setIsPlaying,
        isPlayerReady,
        playerRef,
        playVideo,
        pauseVideo,
        initializePlayer,
        cleanupPlayer,
      }}
    >
      {children}
    </YouTubeContext.Provider>
  );
};

export const useYouTube = () => useContext(YouTubeContext);