import React, { useRef, type DragEvent, type ChangeEvent } from 'react';
import styles from './FileUploader.module.css';

interface FileLoaderProps {
  file: File | null;
  error: string | null;
  isProcessing: boolean;
  isProcessed: boolean;
  isDragging: boolean;
  onDragStart: (e: DragEvent) => void;
  onDragEnter: (e: DragEvent) => void;
  onDragLeave: (e: DragEvent) => void;
  onDrop: (e: DragEvent) => void;
  onFileSelect: (file: File) => void;
  onClear: () => void;
}

export const FileLoader: React.FC<FileLoaderProps> = ({
  file,
  error,
  isProcessing,
  isDragging,
  isProcessed,
  onDragStart,
  onDragEnter,
  onDragLeave,
  onDrop,
  onFileSelect,
  onClear,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClickUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onFileSelect(files[0]);
    }
  };

  return (
    <div
      className={`${styles.fileUploaderContainer} ${file ? styles.uploading : ''
        } ${error ? styles.error : ''} ${isDragging ? styles.dragging : ''}`}
      onDragOver={onDragStart}
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      {!file && !isProcessing && (
        <div className={styles.uploadArea}>
          <button
            className={styles.uploadButton}
            onClick={handleClickUpload}
          >
            Загрузить файл
          </button>
          <p className={styles.description}>или перетащите сюда</p>
          <input
            type="file"
            ref={fileInputRef}
            accept=".csv"
            onChange={handleFileInputChange}
            className={styles.fileInput}
            style={{ display: 'none' }}
          />
        </div>
      )}

      {file && !isProcessing && (
        <div className={styles.uploadedFileContainer}>
          <div className={styles.fileInfo}>
            <span className={`${styles.selectedFile} ${!isProcessing && styles.fileProcessed} ${error ? styles.selectedFileError : ''}`}>
              {file.name}
            </span>
            <button
              className={styles.removeFileButton}
              onClick={onClear}
            >
              <img className={styles.cancelLogo} src='src/assets/cancel.png' />
            </button>
          </div>
          {error ? (
            <span className={styles.errorMessage}>упс, не то...</span>
          ) : isProcessed ? (
            <span className={styles.description}>готово!</span>
          ) : (
            <span className={styles.description}>Файл загружен!</span>
          )}
        </div>
      )}

      {isProcessing && (
        <div className={styles.parsingIndicator}>
          <div className={styles.loading}>
            <div className={styles.loadingCircle}></div>
          </div>
          <p className={styles.description}>идёт парсинг файла</p>
        </div>
      )}
    </div>
  );
};