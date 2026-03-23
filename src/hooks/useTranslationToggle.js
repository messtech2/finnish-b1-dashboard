import { useState, useEffect } from 'react';

export function useTranslationToggle() {
  const [showEnglish, setShowEnglish] = useState(() => {
    try {
      const stored = localStorage.getItem('finnish-show-english');
      return stored ? JSON.parse(stored) : false;
    } catch (e) {
      console.warn('Failed to load translation preference:', e);
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('finnish-show-english', JSON.stringify(showEnglish));
    } catch (e) {
      console.warn('Failed to save translation preference:', e);
    }
  }, [showEnglish]);

  const toggle = () => {
    console.log('Toggling showEnglish from', showEnglish, 'to', !showEnglish);
    setShowEnglish(prev => !prev);
  };

  console.log('useTranslationToggle - showEnglish:', showEnglish, 'toggle:', typeof toggle);
  
  return { showEnglish, toggle };
}
