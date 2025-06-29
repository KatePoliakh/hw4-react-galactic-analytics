import React, { useState, useEffect } from 'react';
import styles from './HistoryPage.module.css';
import { useHistoryStore } from '../../store/history';
import Modal from '../../components/Modal/Modal';
import {Highlights} from '../../components/Highlights/Highlights';
import HistoryItem from '../../components/HistoryItem/HistoryItem';
import { useNavigate } from 'react-router-dom';

export const HistoryPage: React.FC = () => {
  const { items, removeItem, clearAll } = useHistoryStore();
  const navigate = useNavigate();

  const [selectedItem, setSelectedItem] = useState<{
    filename: string;
    highlights: {
      title: string;
      description: string;
    }[];
  } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const handleViewItem = (item: {
    filename: string;
    highlights: {
      title: string;
      description: string;
    }[];
  }) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <p>Загрузка истории...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>

      {items.length === 0 ? (
        <p className={styles.emptyMessage}>История загрузок пуста</p>
      ) : (
        <div className={styles.historyList}>
          {items.map((item) => (
            <HistoryItem
              key={item.id}
              filename={item.filename}
              date={item.date}
              success={item.success}
              onView={() => handleViewItem(item)}
              onDelete={() => removeItem(item.id)}
            />
          ))}
        </div>
      )}
      <div className={styles.note}>
        <button
          className={styles.moreButton}
          onClick={() => navigate('/generate')}
        >
          Сгенерировать больше
        </button>
     
      {items.length > 0 && (
        <button
          className={styles.clearButton}
          onClick={clearAll}
        >
          Очистить всё
        </button>
      )}
       </div>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={selectedItem?.filename}
      >
        {selectedItem && (
          <div className={styles.highlightsContainer}>
            <Highlights items={selectedItem.highlights} isModalStyle/>
          </div>
        )}
      </Modal>
    </div>
  );
};