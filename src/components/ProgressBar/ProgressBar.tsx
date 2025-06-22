import React from 'react';
import styles from './ProgressBar.module.css';

interface ProgressBarProps {
  progress?: number;
  indeterminate?: boolean;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  progress = 0,
  indeterminate = false
}) => {
  return (
    <div className={styles.progressContainer}>
      <div
        className={`${styles.progressBar} ${indeterminate ? styles.indeterminate : ''}`}
        style={{ width: indeterminate ? '100%' : `${Math.min(100, Math.max(0, progress))}%` }}
      >
        {!indeterminate && progress > 5 && (
          <div className={styles.progressText}>{Math.round(progress)}%</div>
        )}
      </div>
    </div>
  );
};

export default ProgressBar;