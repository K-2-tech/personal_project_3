"use client";
import React, { useState } from "react";
import { Check, CheckCircle2 } from "lucide-react";
import styles from "./MainContainer.module.css";

const TaskList = () => {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newTask.trim()) {
      setTasks([...tasks, { id: Date.now(), text: newTask, completed: false }]);
      setNewTask("");
    }
  };

  const toggleTask = (taskId) => {
    setTasks(
      tasks.map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    );
  };

  return (
    <div className={styles.taskSection}>
      <h2
        className={styles.textXl + " " + styles.fontSemibold + " " + styles.mb4}
      >
        Tasks
      </h2>
      <form
        onSubmit={handleSubmit}
        className={styles.taskInputForm + " " + styles.mb4}
      >
        <input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="Add a new task..."
          className={styles.taskInput}
        />
        <button type="submit" className={styles.materialButton}>
          Add
        </button>
      </form>
      <ul className={styles.taskList + " " + styles.spaceY2}>
        {tasks.map((task) => (
          <li
            key={task.id}
            className={`${styles.taskItem} ${styles.flexItemsCenter} ${
              styles.p2
            } ${styles.roundedLg} ${
              task.completed ? styles.taskCompleted : ""
            } ${styles.hoverBgBlack_5} ${styles.transitionAll} ${
              styles.cursorPointer
            }`}
            onClick={() => toggleTask(task.id)}
          >
            <div
              className={`${styles.flexItemsCenter} ${styles.justifyCenter} ${styles.w6} ${styles.h6} ${styles.mr3} ${styles.relative}`}
            >
              {task.completed ? (
                <CheckCircle2
                  className={`${styles.w6} ${styles.h6} ${styles.textGreen500} ${styles.transitionAll} ${styles.checkmark}`}
                />
              ) : (
                <div
                  className={`${styles.w6} ${styles.h6} ${styles.roundedFull} ${styles.border2} ${styles.borderGray300} ${styles.flexItemsCenter} ${styles.justifyCenter} ${styles.hoverBorderGreen500} ${styles.transitionColors}`}
                >
                  <Check
                    className={`${styles.w4} ${styles.h4} ${styles.textTransparent} ${styles.hoverTextGray300} ${styles.transitionColors}`}
                  />
                </div>
              )}
            </div>
            <span
              className={`${styles.taskText} ${styles.flex1} ${
                styles.transitionAll
              } ${styles.duration300} ${
                task.completed
                  ? `${styles.lineThrough} ${styles.textGray500} ${styles.opacity75}`
                  : `${styles.textGray900}`
              }`}
            >
              {task.text}
            </span>
          </li>
        ))}
      </ul>
      {tasks.length === 0 && (
        <p
          className={`${styles.textGray500} ${styles.textCenter} ${styles.mt4}`}
        >
          No tasks yet. Add some tasks to get started!
        </p>
      )}
    </div>
  );
};

export default TaskList;
