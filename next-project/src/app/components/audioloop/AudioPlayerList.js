import React from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import styles from './AudioPlayerList.module.css';

const AudioPlayerList = ({ 
  files, 
  onRemoveFile, 
  onReorderFiles 
}) => {
  const handleDragEnd = (result) => {
    if (!result.destination) return;

    onReorderFiles(
      result.source.index, 
      result.destination.index
    );
  };

  return (
    <div className={styles.container}>
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="audio-files">
          {(provided) => (
            <ul 
              {...provided.droppableProps} 
              ref={provided.innerRef} 
              className={styles.list}
            >
              {files.map((file, index) => (
                <Draggable 
                  key={`${file.name}-${index}`} 
                  draggableId={`${file.name}-${index}`} 
                  index={index}
                >
                  {(provided) => (
                    <li
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className={styles.listItem}
                    >
                      <div 
                        {...provided.dragHandleProps} 
                        className={styles.dragHandle}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="8" y1="6" x2="16" y2="6"></line>
                          <line x1="8" y1="12" x2="16" y2="12"></line>
                          <line x1="8" y1="18" x2="16" y2="18"></line>
                        </svg>
                      </div>
                      <div className={styles.fileName}>
                        {file.name}
                      </div>
                      <button 
                        onClick={() => onRemoveFile(index)}
                        className={styles.removeButton}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="18" y1="6" x2="6" y2="18"></line>
                          <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                      </button>
                    </li>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </ul>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};

export default AudioPlayerList;