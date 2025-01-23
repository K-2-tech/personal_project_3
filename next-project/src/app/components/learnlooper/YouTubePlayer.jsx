"use client";
import React, { useEffect, useRef, useState } from "react";
import styles from "./YouTubePlayer.module.css";
import { useYouTube } from "../../contexts/learnlooper/YouTubeContext";

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

  // コンポーネントがマウントされたときに、ローカルストレージからデータを取得する
  useEffect(() => {
    const storedVideos = JSON.parse(localStorage.getItem("savedVideos")) || [];
    setSavedVideos(storedVideos);
  }, []);

  // YouTubeプレイヤーの初期化と後処理
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

  // プレイヤーの状態を監視する
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

  // URLの変更処理
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

  // スライダーの変更処理
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

  // 時間の書式化
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div ref={elementRef} className={styles.playerWrapper}>
      <div className={styles.urlInput}>
        <input
          type="text"
          value={videoUrl}
          onChange={handleUrlChange}
          placeholder="YouTube URL"
        />

        <button onClick={clearURL}>Clear</button>
        <button onClick={saveURLs}>Save URL</button>
      </div>
      <div className={styles.savedVideos}>
        {savedVideos.map((video, index) => (
          <div
            key={index}
            className={styles.savedVideoTitle}
            onClick={() => loadSavedVideo(video.url)}
          >
            {video.title}
          </div>
        ))}
      </div>
      <div id="youtube-player" className={styles.youtubeFrame}></div>
      <div className={styles.sliderControls}>
        <div className={styles.doubleSliderContainer}>
          <input
            type="range"
            min="0"
            max="100"
            value={(startTime / (duration || 1)) * 100}
            onChange={(e) =>
              handleSliderChange("start", parseFloat(e.target.value))
            }
            className={styles.slider + " " + styles.startSlider}
          />
          <input
            type="range"
            min="0"
            max="100"
            value={(endTime / (duration || 1)) * 100}
            onChange={(e) =>
              handleSliderChange("end", parseFloat(e.target.value))
            }
            className={styles.slider + " " + styles.endSlider}
          />
        </div>
        <div className={styles.timeDisplay}>
          <span>Start: {formatTime(startTime)}</span>
          <span>Current: {formatTime(currentTime)}</span>
          <span>End: {formatTime(endTime)}</span>
        </div>
      </div>
    </div>
  );
};

export default YouTubePlayer;
