import React from 'react';
import styles from './HistoryItem.module.css';

interface HistoryItemProps {
  filename: string;
  date: string;
  success: boolean;
  onView: () => void;
  onDelete: () => void;
}

const HistoryItem: React.FC<HistoryItemProps> = ({
  filename,
  date,
  success,
  onView,
  onDelete,
}) => {
  return (
    <div className={styles.item}>
      <div className={styles.itemContent} onClick={onView}>



        <div className={styles.filename}>
          <img src="src/assets/file.png" alt="File Icon" className={styles.fileIcon} />
          {filename}
        </div>

        <div className={styles.date}>{date}</div>

        <div className={styles.status}>
          <div className={styles.statusText}>
            <span
              className={`${styles.text} ${success ? styles.successText : styles.failureText}`}
            >
              Обработан успешно{' '}
              <img
                src="src/assets/happy.png"
                alt="Success Icon"
                className={`${styles.icon} ${success ? styles.successIcon : styles.failureIcon}`}
              />
            </span>

            <span
              className={`${styles.text} ${success ? styles.failureText : styles.successText}`}
            >
              Не удалось обработать{' '}
              <img
                src="src/assets/sad.png"
                alt="Failure Icon"
                className={`${styles.icon} ${success ? styles.failureIcon : styles.successIcon}`}
              />
            </span>
          </div>
        </div>
      </div>
      <div className={styles.actions}>

        <button className={styles.deleteButton} onClick={onDelete}>
          <img src="src/assets/Trash.png" alt="Delete Icon" />
        </button>
      </div>
    </div>
  );
};

export default HistoryItem;