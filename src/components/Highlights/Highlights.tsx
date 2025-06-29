import React from 'react';
import styles from './Highlights.module.css';

export interface HighlightItem {
  title: string;
  description: string;
}

interface HighlightsProps {
  items: HighlightItem[];
  isModalStyle?: boolean;
}

export const Highlights: React.FC<HighlightsProps> = ({ items, isModalStyle = false }) => {
  const gridClass = isModalStyle ? styles.modalHighlightsGrid : styles.defaultHighlightsGrid;
  const cardClass = isModalStyle ? styles.modalHighlightCard : styles.defaultHighlightCard;
  const valueClass = isModalStyle ? styles.modalHighlightValue : styles.defaultHighlightValue;
  const descriptionClass = isModalStyle
    ? styles.modalHighlightDescription
    : styles.defaultHighlightDescription;

  return (
    <div className={gridClass}>
    {items.map((item, index) => (
      <div key={index} className={cardClass}>
        <div className={valueClass}>{item.title}</div>
        <div className={descriptionClass}>{item.description}</div>
      </div>
    ))}
  </div>
  );
};
