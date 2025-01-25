"use client";
import React, { useState, useRef, useEffect } from "react";
import { Play, Pause, Repeat } from "lucide-react";
import styles from "./YoutubeLoop.module.css";

const YouTubeABLoop = () => {
  const getInitialMemo = () => {
    const storedMemo = localStorage.getItem("memo");
    if (storedMemo) {
      try {
        const parsedMemo = JSON.parse(storedMemo);
        return Array.isArray(parsedMemo) ? parsedMemo : [];
      } catch (e) {
        console.error("Failed to parse stored memo:", e);
        return [];
      }
    }
    return [];
  };
  const [videoUrl, setVideoUrl] = useState(
    "https://www.youtube.com/watch?v=lN8xbrzvggA&ab_channel=JazzTutorial%7CwithJulianBradley"
  );
  const [memo, setMemo] = useState([]);
  const [videoId, setVideoId] = useState("");
  const [videoMetadata, setVideoMetadata] = useState(null);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(100);
  const [currentTime, setCurrentTime] = useState(0);
  const [isLooping, setIsLooping] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const playerRef = useRef(null);
  const timerRef = useRef(null);
  const elementRef = useRef(null);
  const [width, setWidth] = useState(0);
  /*urlが変更されたらID抽出 */
  useEffect(() => {
    extractVideoId();
  }, [videoUrl]);
  /*IDが変更されたらプレイヤー作成 */
  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      tag.async = true;
      const firstScriptTag = document.getElementsByTagName("script")[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

      window.onYouTubeIframeAPIReady = () => {
        if (videoId) createPlayer(videoId);
      };
    } else if (videoId) {
      createPlayer(videoId);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [videoId]);
  /*startTime,endTimeが変更されたら*/
  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      const current = playerRef.current.getCurrentTime();
      setCurrentTime(current);
      if (isLooping && currentTime >= endTime) {
        playerRef.current.seekTo(startTime);
      }
    }, 100);
  }, [startTime, endTime, isLooping, currentTime]);
  useEffect(() => {
    // DOMが完全にロードされた後に要素の幅を取得
    if (elementRef.current) {
      setWidth(elementRef.current.offsetWidth);
    }
  }, []);
  // ページ読み込み時にローカルストレージからメモを取得
  useEffect(() => {
    const storedMemo = localStorage.getItem("abloop-memo");
    if (storedMemo) {
      try {
        const parsedMemo = JSON.parse(storedMemo);
        setMemo(Array.isArray(parsedMemo) ? parsedMemo : []);
      } catch (e) {
        console.error("Failed to parse stored memo:", e);

        setMemo([]);
      }
    }
  }, []);

  // メモが変更されたらローカルストレージに保存
  useEffect(() => {
    if (memo.length > 0) {
      // メモが空でない場合のみ保存
      localStorage.setItem("abloop-memo", JSON.stringify(memo));
      console.log("Saving to localStorage:", memo);
    }
  }, [memo]);
  /*以下関数 */
  const createPlayer = (id) => {
    if (playerRef.current) {
      playerRef.current.destroy();
    }

    playerRef.current = new window.YT.Player("youtube-player", {
      videoId: id,
      playerVars: {
        autoplay: 0,
        controls: 1,
      },
      events: {
        onReady: onPlayerReady,
        onStateChange: onPlayerStateChange,
      },
    });
  };

  const onPlayerReady = (event) => {
    const duration = event.target.getDuration();
    setVideoMetadata({
      duration: duration,
      title: event.target.getVideoData().title,
    });

    // 初期のデフォルト設定
    setEndTime(duration);
  };

  const onPlayerStateChange = (event) => {
    switch (event.data) {
      case window.YT.PlayerState.PLAYING:
        setIsPlaying(true);

        break;
      case window.YT.PlayerState.PAUSED:
        setIsPlaying(false);

        break;
      case window.YT.PlayerState.ENDED:
        setIsPlaying(false);

        if (isLooping) {
          playerRef.current.seekTo(startTime);
          playerRef.current.playVideo();
        }
        break;
    }
  };

  const extractVideoId = () => {
    const url = videoUrl;
    const match = url.match(
      /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
    );

    if (match) {
      const extractedId = match[1];
      setVideoId(extractedId);
      setErrorMessage("");
    } else {
      setErrorMessage("Please enter a valid YouTube video URL");
    }
  };

  const togglePlayPause = () => {
    if (!playerRef.current) return;

    if (isPlaying) {
      playerRef.current.pauseVideo();
    } else {
      playerRef.current.playVideo();
    }
  };

  const toggleLooping = () => {
    setIsLooping(!isLooping);
    if (playerRef.current) {
      playerRef.current.seekTo(startTime);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleStartTimeChange = (e) => {
    const newStartTime = parseFloat(e.target.value);
    if (
      newStartTime >= 0 &&
      newStartTime < (videoMetadata?.duration || Infinity)
    ) {
      setStartTime(newStartTime);

      // エンドタイムが開始時間より前の場合は調整
      if (newStartTime >= endTime) {
        setEndTime(videoMetadata.duration);
      }
    }
  };

  const handleEndTimeChange = (e) => {
    const newEndTime = parseFloat(e.target.value);

    if (
      newEndTime > startTime &&
      newEndTime <= (videoMetadata?.duration || Infinity)
    ) {
      setEndTime(newEndTime);
      console.log("endtime updated" + newEndTime);
    }
  };

  const setCurrentTimeAsStart = () => {
    setStartTime(currentTime);
  };

  const setCurrentTimeAsEnd = () => {
    setEndTime(currentTime);
  };
  const clearURL = () => {
    setVideoUrl("");
  };
  const handleSaveUrls = (event) => {
    const [url, title] = event.target.value.split(",");
    if (url && title) {
      const newMemo = [...memo, [url, title]];
      setMemo(newMemo);
      console.log("Updated memo:", newMemo);
    }
  };
  const copyToClipboard = (url) => {
    console.log(url);
    navigator.clipboard.writeText(url);
    alert("Copied URL !");
  };
  return (
    <div className={styles.abLoopContainer}>
      <div className={styles.videoArea}>
        <div className={styles.urlInputContainer}>
          <div>Please paste YouTube URL or ID</div>
          <p className={styles.errorMessage}>{errorMessage}</p>
          <div className={styles.urlInputBox}>
            <input
              type="text"
              placeholder="Please paste YouTube URL or ID"
              value={videoUrl}
              autoComplete="videoUrl"
              onChange={(e) => setVideoUrl(e.target.value)}
            />
            <button onClick={clearURL}>Clear</button>
            {videoMetadata && (
              <button
                onClick={handleSaveUrls}
                value={`${videoUrl},${videoMetadata.title}`}
              >
                Save URL
              </button>
            )}
          </div>
          {memo
            .slice(-10)
            .reverse()
            .map((item, index) => (
              <div key={memo.length - 10 + index} className={styles.memoItem}>
                <button
                  onClick={() => copyToClipboard(item[0])}
                  className={styles.memoButton}
                >
                  {item[1]}
                </button>
              </div>
            ))}
        </div>

        <div className={styles.playerContainer}>
          <div id="youtube-player" className={styles.youtubePlayer}></div>

          {videoMetadata && (
            <div className={styles.videoInfo}>
              <span>{videoMetadata.title}</span>
            </div>
          )}
        </div>

        <div className={styles.abLoopControls}>
          <div className={styles.slidebarMultithumb} ref={elementRef}>
            <input
              className={styles.thumb1Input}
              type="range"
              value={startTime}
              onChange={handleStartTimeChange}
              step="0.1"
              min="0"
              max={videoMetadata?.duration || 0}
            />

            <input
              className={styles.thumb2Input}
              type="range"
              value={endTime}
              onChange={handleEndTimeChange}
              step="0.1"
              max={videoMetadata?.duration || 0}
            />

            <div
              className={styles.thumb3}
              style={{
                transform: `translate(${
                  (width * currentTime) / (videoMetadata?.duration || 0)
                }px,0)`,
              }}
            ></div>
            <div className={styles.thumbTitleWrapper}>
              <p className={styles.thumb1Title}>{formatTime(startTime)}</p>
              <p className={styles.thumb2Title}>{formatTime(endTime)}</p>
            </div>
          </div>
          <div className={styles.controlIcons}>
            <button
              onClick={togglePlayPause}
              disabled={!videoId}
              aria-label="play or pause"
            >
              {isPlaying ? <Pause color="black" /> : <Play color="#FC9D9D" />}
            </button>

            <button
              onClick={toggleLooping}
              className={isLooping ? styles.loopingActive : ""}
              disabled={!videoId}
              aria-label="loop or not"
            >
              <Repeat />
            </button>
          </div>
          <div className={styles.controlButtons}>
            <button onClick={setCurrentTimeAsStart}>
              Set the <p className={styles.setStartTimeButton}>starting time</p>{" "}
              to the current time.
            </button>
            <button onClick={setCurrentTimeAsEnd}>
              Set the <p className={styles.setEndTimeButton}>ending time</p> to
              the current time.
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default YouTubeABLoop;
