import React, { useEffect } from 'react';
import { useYouTube } from '../contexts/YouTubeContext';

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
  } = useYouTube();

  useEffect(() => {
    // YouTube IFrame API setup
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

      window.onYouTubeIframeAPIReady = () => {
        if (videoId) {
          initializePlayer(videoId);
        }
      };
    } else if (videoId) {
      initializePlayer(videoId);
    }

    return () => {
      cleanupPlayer();
    };
  }, [videoId, initializePlayer, cleanupPlayer]);

  const extractVideoId = (url) => {
    const match = url.match(
      /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
    );
    return match ? match[1] : null;
  };

  const handleUrlChange = (e) => {
    const url = e.target.value;
    setVideoUrl(url);
    const id = extractVideoId(url);
    if (id) setVideoId(id);
  };

  return (
    <div className="youtube-player-container">
      <div className="url-input">
        <input
          type="text"
          value={videoUrl}
          onChange={handleUrlChange}
          placeholder="Enter YouTube URL"
        />
      </div>
      <div id="youtube-player" />
      <div className="loop-controls">
        <input
          type="number"
          value={startTime}
          onChange={(e) => setStartTime(parseInt(e.target.value))}
          placeholder="Start time (seconds)"
          min="0"
        />
        <input
          type="number"
          value={endTime}
          onChange={(e) => setEndTime(parseInt(e.target.value))}
          placeholder="End time (seconds)"
          min="0"
        />
      </div>
    </div>
  );
};

export default YouTubePlayer;