import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder as typeof global.TextDecoder;

// Mock для react-router-dom
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: jest.fn(),
}));

