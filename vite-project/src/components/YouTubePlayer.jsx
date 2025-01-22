import React, { useEffect, useRef, useState } from "react";
import "./YouTubePlayer.css";
import { useYouTube } from "../contexts/YouTubeContext";

const YouTubePlayer = () => {
  const {
    videoUrl,
    setVideoUrl,
    videoId,
    setVideoId,
    startTime,
    setStartTime,
    endTime,
    setEndTime,
    initializePlayer,
    cleanupPlayer,
    playerRef,
    clearURL,
    saveURLs,
    isPlaying,
    playVideo,
    pauseVideo,
    setSavedVideos,
    savedVideos,
    loadSavedVideo,
    extractVideoId,
  } = useYouTube();

  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(60);
  const elementRef = useRef(null);
  const [isPlayerReady, setIsPlayerReady] = useState(false);

  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      tag.async = true;
      const firstScriptTag = document.getElementsByTagName("script")[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      window.onYouTubeIframeAPIReady = () => {
        if (videoId) {
          initializePlayer(videoId);
          setIsPlayerReady(true);
        }
      };
    } else if (videoId) {
      initializePlayer(videoId);
      setIsPlayerReady(true);
    }
    return () => cleanupPlayer();
  }, [videoId, initializePlayer, cleanupPlayer]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (playerRef.current && isPlayerReady) {
        const currentTime = playerRef.current.getCurrentTime();
        setCurrentTime(currentTime);

        if (!duration || duration === 60) {
          const newDuration = playerRef.current.getDuration();
          setDuration(newDuration);
          setEndTime(newDuration);
        }

        if (currentTime >= endTime) {
          playerRef.current.seekTo(startTime);
        }
      }
    }, 100);
    return () => clearInterval(interval);
  }, [playerRef, isPlayerReady, startTime, endTime, duration]);
  // コンポーネントがマウントされたときに、ローカルストレージからデータを取得する
  useEffect(() => {
    const storedVideos = JSON.parse(localStorage.getItem("savedVideos")) || [];
    setSavedVideos(storedVideos);
  }, []);

  const handleUrlChange = (e) => {
    const url = e.target.value;
    setVideoUrl(url);
    const id = extractVideoId(url);
    if (id) {
      setVideoId(id);
      setStartTime(0);
      setEndTime(duration);
      initializePlayer(id);
    }
  };

  const handleSliderChange = (type, value) => {
    const time = (value / 100) * duration;
    if (type === "start") {
      setStartTime(time);
      if (playerRef.current && isPlayerReady) {
        playerRef.current.seekTo(time);
      }
    } else {
      setEndTime(Math.min(time, duration));
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div ref={elementRef} className="player-wrapper">
      <div className="url-input">
        <input
          type="text"
          value={videoUrl}
          onChange={handleUrlChange}
          placeholder="YouTube URL"
        />

        <button onClick={clearURL}>Clear</button>
        <button onClick={saveURLs}>Save URL</button>
      </div>
      <div className="saved-videos">
        {savedVideos.map((video, index) => (
          <div
            key={index}
            className="saved-video-title"
            onClick={() => loadSavedVideo(video.url)}
          >
            {video.title}
          </div>
        ))}
      </div>
      <div id="youtube-player" className="youtube-frame"></div>
      <div className="slider-controls">
        <div className="double-slider-container">
          <input
            type="range"
            min="0"
            max="100"
            value={(startTime / (duration || 1)) * 100}
            onChange={(e) =>
              handleSliderChange("start", parseFloat(e.target.value))
            }
            className="slider start-slider"
          />
          <input
            type="range"
            min="0"
            max="100"
            value={(endTime / (duration || 1)) * 100}
            onChange={(e) =>
              handleSliderChange("end", parseFloat(e.target.value))
            }
            className="slider end-slider"
          />
        </div>
        <div className="time-display">
          <span>Start: {formatTime(startTime)}</span>
          <span>Current: {formatTime(currentTime)}</span>
          <span>End: {formatTime(endTime)}</span>
        </div>
      </div>
    </div>
  );
};

export default YouTubePlayer;
