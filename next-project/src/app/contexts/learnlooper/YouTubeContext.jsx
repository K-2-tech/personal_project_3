"use client";
import React, {
  createContext,
  useState,
  useContext,
  useRef,
  useCallback,
} from "react";

const YouTubeContext = createContext();

export const YouTubeProvider = ({ children }) => {
  const [videoUrl, setVideoUrl] = useState("");
  const [videoId, setVideoId] = useState("");
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(60);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [savedVideos, setSavedVideos] = useState([]);
  const [videoMetadata, setVideoMetadata] = useState({
    title: "",
    channelTitle: "",
    duration: 0,
  });
  const playerRef = useRef(null);

  const playVideo = useCallback(() => {
    if (playerRef.current && isPlayerReady) {
      try {
        playerRef.current.playVideo();
        setIsPlaying(true);
      } catch (error) {
        console.error("Error playing video:", error);
      }
    }
  }, [isPlayerReady]);

  const pauseVideo = useCallback(() => {
    if (playerRef.current && isPlayerReady) {
      try {
        playerRef.current.pauseVideo();
        setIsPlaying(false);
      } catch (error) {
        console.error("Error pausing video:", error);
      }
    }
  }, [isPlayerReady]);

  const fetchVideoMetadata = useCallback(async (videoId) => {
    if (!videoId) return;

    try {
      const videoData = playerRef.current.getVideoData();

      const duration = playerRef.current.getDuration();
      const metadata = {
        title: videoData.title,
        channelTitle: videoData.author,
        duration: duration,
      };
      setVideoMetadata(metadata);

      return metadata;
    } catch (error) {
      console.error("Error fetching video metadata:", error);
      return null;
    }
  }, []);

  const initializePlayer = useCallback(
    (videoId) => {
      if (!videoId) return;
      if (playerRef.current) {
        playerRef.current.destroy();
      }
      try {
        playerRef.current = new window.YT.Player("youtube-player", {
          videoId: videoId,
          playerVars: {
            start: startTime,
            end: endTime,
            controls: 1,
          },
          events: {
            onReady: () => {
              setIsPlayerReady(true);
              fetchVideoMetadata(videoId);
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
        console.error("Error initializing YouTube player:", error);
        setIsPlayerReady(false);
      }
    },
    [startTime, endTime, isPlaying, videoId, fetchVideoMetadata]
  );

  const cleanupPlayer = useCallback(() => {
    if (playerRef.current) {
      try {
        playerRef.current.destroy();
        playerRef.current = null;
        setIsPlayerReady(false);
        setVideoMetadata({
          title: "",
          channelTitle: "",
          duration: 0,
        });
      } catch (error) {
        console.error("Error cleaning up player:", error);
      }
    }
  }, []);

  const clearURL = () => {
    setVideoUrl("");
    setVideoId("");
    setVideoMetadata({
      title: "",
      channelTitle: "",
      duration: 0,
    });
  };

  const saveURLs = () => {
    if (videoUrl && videoMetadata.title) {
      // 現在のURLと同じものを除外した配列を作成
      const filteredVideos = savedVideos.filter(
        (video) => video.url !== videoUrl
      );

      // 新しいビデオを配列の先頭に追加
      const updatedVideos = [
        {
          url: videoUrl,
          title: videoMetadata.title,
        },
        ...filteredVideos,
      ];

      // ローカルストレージに保存
      localStorage.setItem("savedVideos", JSON.stringify(updatedVideos));
      setSavedVideos(updatedVideos);
    }
  };

  const loadSavedVideo = (url) => {
    setVideoUrl(url);
    const id = extractVideoId(url);
    if (id) {
      setVideoId(id);
      setStartTime(0);
      setEndTime(60);
      initializePlayer(id);
    }
  };

  const extractVideoId = (url) => {
    const match = url.match(
      /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
    );
    return match ? match[1] : null;
  };

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
        setIsPlayerReady,
        playerRef,
        playVideo,
        pauseVideo,
        initializePlayer,
        cleanupPlayer,
        clearURL,
        saveURLs,
        savedVideos,
        setSavedVideos,
        loadSavedVideo,
        videoMetadata,
        extractVideoId,
      }}
    >
      {children}
    </YouTubeContext.Provider>
  );
};

export const useYouTube = () => useContext(YouTubeContext);
