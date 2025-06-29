import { Link, useLocation } from 'react-router-dom';
import styles from './Header.module.css';
import React from 'react';

export const Header = () => {
  const location = useLocation();

  return (
    <header className={styles.header}>
      <div className={styles.content}>
        <img className={styles.logo} src='src/assets/LogoSS.png' alt='' />
        <h1 className={styles.title}>МЕЖГАЛАКТИЧЕСКАЯ АНАЛИТИКА</h1>
      </div>
      <nav className={styles.nav}>
        <Link
          to="/"
          className={`${styles.link} ${location.pathname === '/' ? styles.active : ''}`}
        >
          <img className={styles.linkIcon} src='src/assets/upload.png' alt=""/>
          CSV Аналитик
        </Link>
        <Link
          to="/generate"
          className={`${styles.link} ${location.pathname === '/generate' ? styles.active : ''}`}
        >
          <img className={styles.linkIcon} src='src/assets/generate.png' alt=""/>
          CSV Генератор
        </Link>
        <Link
          to="/history"
          className={`${styles.link} ${location.pathname === '/history' ? styles.active : ''}`}
        >
          <img className={styles.linkIcon} src='src/assets/history.png' alt="" />
          История
        </Link>
      </nav>
    </header>
  );
};