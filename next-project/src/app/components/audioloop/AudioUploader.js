import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import styles from './AudioUploader.module.css';

const AudioUploader = ({ 
  onFileUpload, 
  maxFiles = 10 
}) => {
  const onDrop = useCallback((acceptedFiles) => {
    const audioFiles = acceptedFiles.filter(file => 
      file.type.startsWith('audio/')
    );

    const limitedFiles = audioFiles.slice(0, maxFiles);

    if (limitedFiles.length > 0) {
      onFileUpload(limitedFiles);
    }
  }, [onFileUpload, maxFiles]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'audio/*': ['.mp3', '.wav', '.ogg', '.m4a']
    },
    multiple: true
  });

  return (
    <div 
      {...getRootProps()} 
      className={`
        ${styles.dropzone} 
        ${isDragActive ? styles.dragActive : styles.default}
      `}
    >
      <input {...getInputProps()} />
      <div className={styles.content}>
        <div className={styles.icon}>
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21.66 10.67a1.5 1.5 0 01-1.5 1.33h-11A1.5 1.5 0 018 10.5V9a3 3 0 013-3h6a3 3 0 013 3zM16.5 11.5v2a2.5 2.5 0 01-2.5 2.5H8a2.5 2.5 0 01-2.5-2.5v-2" />
            <path d="M4.5 15.5v-2" />
          </svg>
        </div>
        <p className={styles.mainText}>
          {isDragActive 
            ? 'Drop audio files here' 
            : 'Drag & drop audio files or click to select'}
        </p>
        <p className={styles.subText}>
          Max {maxFiles} files. MP3, WAV, OGG supported
        </p>
      </div>
    </div>
  );
};

export default AudioUploader;