import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
// Self-hosted fonts for Hindi (Devanagari), Punjabi (Gurmukhi) and Urdu
// (Nastaliq). Only the script subsets are loaded, and a browser downloads a
// font file only when text in that script appears on screen.
import '@fontsource/noto-sans-devanagari/devanagari-400.css';
import '@fontsource/noto-sans-devanagari/devanagari-700.css';
import '@fontsource/noto-sans-gurmukhi/gurmukhi-400.css';
import '@fontsource/noto-sans-gurmukhi/gurmukhi-700.css';
import '@fontsource/noto-nastaliq-urdu/arabic-400.css';
import '@fontsource/noto-nastaliq-urdu/arabic-700.css';
import './styles.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
