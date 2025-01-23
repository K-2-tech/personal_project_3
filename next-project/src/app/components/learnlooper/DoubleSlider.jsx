"use client";
import React, { useEffect, useRef, useState } from "react";

const DoubleSlider = ({ min, max, onChange, startTime, endTime }) => {
  const [isDragging, setIsDragging] = useState(null);
  const sliderRef = useRef(null);

  const getPercentage = (value) => {
    return ((value - min) / (max - min)) * 100;
  };

  const getValueFromPosition = (position) => {
    const sliderRect = sliderRef.current.getBoundingClientRect();
    const percentage = (position - sliderRect.left) / sliderRect.width;
    return Math.round(percentage * (max - min) + min);
  };

  const handleMouseDown = (e, thumb) => {
    setIsDragging(thumb);
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging) return;

      const value = getValueFromPosition(e.clientX);
      const clampedValue = Math.max(min, Math.min(max, value));

      if (isDragging === "start") {
        onChange({ startTime: Math.min(clampedValue, endTime - 1), endTime });
      } else {
        onChange({ startTime, endTime: Math.max(clampedValue, startTime + 1) });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(null);
    };

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, min, max, onChange, startTime, endTime]);

  return (
    <div className={styles.sliderContainer}>
      <div className={styles.doubleSlider} ref={sliderRef}>
        <div className={styles.sliderTrack} />
        <div
          className={styles.sliderRange}
          style={{
            left: `${getPercentage(startTime)}%`,
            width: `${getPercentage(endTime) - getPercentage(startTime)}%`,
          }}
        />
        <div
          className={styles.sliderThumb}
          style={{ left: `${getPercentage(startTime)}%` }}
          onMouseDown={(e) => handleMouseDown(e, "start")}
        />
        <div
          className={styles.sliderThumb}
          style={{ left: `${getPercentage(endTime)}%` }}
          onMouseDown={(e) => handleMouseDown(e, "end")}
        />
      </div>
      <div className={styles.sliderValues}>
        <span>Start: {startTime}s</span>
        <span>End: {endTime}s</span>
      </div>
    </div>
  );
};

export default DoubleSlider;
