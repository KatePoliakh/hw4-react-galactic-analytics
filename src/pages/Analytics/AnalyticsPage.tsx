/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useRef, useEffect } from 'react';
import styles from './AnalyticsPage.module.css';
import { useAnalyticsStore } from '../../store/analytics';
import { useHistoryStore } from '../../store/history';
import { analyzeCSV } from '../../utils/api';
import Highlights from '../../components/Highlights/Highlights';
import { HIGHLIGHT_TITLES } from '../../constants/highlights';
import { FileLoader } from '../../components/FileUploader/FileUploader';


const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('ru-RU').format(num);
};

const dayOfYearToDate = (dayOfYear: number): string => {
  if (isNaN(dayOfYear)) return 'Некорректная дата';

  const date = new Date(2023, 0);
  date.setDate(dayOfYear);

  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long'
  });
};

export const AnalyticsPage: React.FC = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [visibleHighlights, setVisibleHighlights] = useState<any[]>([]);
  const highlightTimerRef = useRef<NodeJS.Timeout | null>(null);

  const {
    file,
    setFile,
    isLoading,
    setHighlights,
    startLoading,
    setError: setAnalyticsError,
    reset,
    setIsProcessed,
    isProcessed,
  } = useAnalyticsStore();

  const { addItem } = useHistoryStore();

  useEffect(() => {
    return () => {
      if (highlightTimerRef.current) {
        clearTimeout(highlightTimerRef.current);
      }
    };
  }, []);

  const handleFileUpload = (uploadedFile: File) => {
    if (uploadedFile.type !== 'text/csv' && !uploadedFile.name.endsWith('.csv')) {
      setError('Пожалуйста, загрузите CSV файл');
      return;
    }

    setFile(uploadedFile);
    setError(null);
    setVisibleHighlights([]);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleClear = () => {
    reset();
    setError(null);
    setIsProcessed(false);
    setVisibleHighlights([]);
    if (highlightTimerRef.current) {
      clearTimeout(highlightTimerRef.current);
      highlightTimerRef.current = null;
    }

  };

  const handleSubmit = async () => {
    if (!file) return;

    try {
      startLoading();
      setIsProcessing(true);
      setError(null);
      setAnalyticsError(null);
      setVisibleHighlights([]);

      if (highlightTimerRef.current) {
        clearTimeout(highlightTimerRef.current);
        highlightTimerRef.current = null;
      }

      const placeholderHighlights = Object.keys(HIGHLIGHT_TITLES).map(key => ({
        title: '...',
        description: HIGHLIGHT_TITLES[key]
      }));

      setHighlights(placeholderHighlights);
      setVisibleHighlights(placeholderHighlights);

      const result = await analyzeCSV(file);
      setIsProcessed(true);

      const formattedResult = {
        ...result,
        total_spend_galactic: formatNumber(result.total_spend_galactic),
        rows_affected: formatNumber(result.rows_affected),
        less_spent_at: dayOfYearToDate(result.less_spent_at),
        big_spent_at: dayOfYearToDate(result.big_spent_at),
        big_spent_value: formatNumber(result.big_spent_value),
        average_spend_galactic: formatNumber(result.average_spend_galactic),
      };

      const validHighlightKeys = Object.keys(HIGHLIGHT_TITLES);
      const newHighlights: any[] = [];

      validHighlightKeys.forEach(key => {
        if (formattedResult[key] !== undefined && formattedResult[key] !== null) {
          newHighlights.push({
            title: formattedResult[key]?.toString() || '',
            description: HIGHLIGHT_TITLES[key]
          });
        }
      });

      setHighlights(newHighlights);

      setVisibleHighlights([]);

      newHighlights.forEach((item, index) => {
        highlightTimerRef.current = setTimeout(() => {
          setVisibleHighlights(prev => [...prev, item]);
        }, index * 300);
      });

      addItem({
        filename: file.name,
        date: new Date().toLocaleDateString('ru-RU'),
        success: true,
        highlights: newHighlights,
      });
    } catch (err) {
      let errorMessage = 'Неизвестная ошибка';

      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'string') {
        errorMessage = err;
      }

      setError(errorMessage);
      setAnalyticsError(errorMessage);

      addItem({
        filename: file.name,
        date: new Date().toLocaleDateString('ru-RU'),
        success: false,
        highlights: [],
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className={styles.container}>
      <p className={styles.description}>
        Загрузите <strong>csv</strong> файл и получите <strong>полную информацию</strong> о нём за сверхнизкое время
      </p>

      <FileLoader
        file={file}
        error={error}
        isProcessing={isProcessing}
        isDragging={isDragging}
        onDragStart={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onFileSelect={handleFileUpload}
        onClear={handleClear}
        isProcessed={isProcessed}
      />

      {!isProcessing && visibleHighlights.length === 0 && (
        <button
          className={`${styles.submitButton} ${file && !error ? styles.active : ''}`}
          onClick={handleSubmit}
          disabled={isLoading || !file || !!error}
        >
          Отправить
        </button>
      )}

      <div className={styles.highlightsSection}>
        {visibleHighlights.length === 0 && !error && (
          <h3 className={styles.highlightsPlaceholder}>
            {'Здесь\n появятся хайлайты'}
          </h3>
        )}
        {visibleHighlights.length > 0 && <Highlights items={visibleHighlights} />}
      </div>
    </div>
  );
};