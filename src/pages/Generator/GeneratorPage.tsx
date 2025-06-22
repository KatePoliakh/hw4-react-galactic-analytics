import React, { useState } from 'react';
import styles from './GeneratorPage.module.css';
import { generateCSV } from '../../utils/api';
import { useHistoryStore } from '../../store/history';

export const GeneratorPage: React.FC = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const { addItem } = useHistoryStore();

  const handleGenerate = async () => {
    try {
      setIsGenerating(true);
      setError(null);
      setProgress(0);

      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 300);

      const blob = await generateCSV({ size: 0.1 });
      clearInterval(progressInterval);
      setProgress(100);

      const url = window.URL.createObjectURL(blob);
      const filename = `generated_data_${Date.now()}.csv`;

      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      addItem({
        filename: filename,
        date: new Date().toLocaleDateString('ru-RU'),
        success: true,
        highlights: [
          {
            title: 'Тестовые данные',
            description: 'Сгенерированный CSV файл',
          },
        ],
      });


      setNotification({ type: 'success', message: 'Done!' });
    } catch (err) {
      const message =  'упс, не то...';
      setError(message);
      console.error('Generation error:', err);

      setNotification({ type: 'error', message: 'Ошибка' });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.description}>
        <p>Сгенерируйте готовый csv-файл нажатием одной кнопки</p>
      </div>

      {!isGenerating && !notification && (
        <button
          className={styles.generateButton}
          onClick={handleGenerate}
          disabled={isGenerating}
        >
          Начать генерацию
        </button>
      )}

      {isGenerating && (
        <div className={styles.parsingIndicator}>
          <div className={styles.loading}>
            <div className={styles.loadingCircle}></div>
          </div>
        </div>
      )}
      {isGenerating && <span className={styles.description}>идёт процесс генерации</span>}

      {notification && (
        <>
        <div className={styles.notificationContainer}>
          <div className={`${styles.notification} ${styles[notification.type]}`}>
            <span className={styles.notificationText}>{notification.message}</span>
          </div>
          <button className={styles.closeButton} onClick={() => {setNotification(null); setError(null)}}>
            <img src='src/assets/cancel.png' className={styles.cancelLogo}/>
          </button>
        </div>
        {!isGenerating &&<span className={styles.message}>файл сгенерирован!</span>}
        </>
      )}
      {error && <div className={styles.errorMessage}>{error}</div>}
    </div>
  );
};