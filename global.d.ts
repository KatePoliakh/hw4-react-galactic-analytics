// Расширение типов Jest
import '@testing-library/jest-dom';

// Для CSS модулей
declare module '*.module.css' {
  const classes: { [key: string]: string };
  export default classes;
}

// Для react-router-dom
declare module 'react-router-dom';