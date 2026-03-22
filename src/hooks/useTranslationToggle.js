import { useState, useEffect } from 'react';

export function useTranslationToggle() {
  const [showEnglish, setShowEnglish] = useState(() => {
    const stored = localStorage.getItem('finnish-show-english');
    return stored ? JSON.parse(stored) : false;
  });

  useEffect(() => {
    localStorage.setItem('finnish-show-english', JSON.stringify(showEnglish));
  }, [showEnglish]);

  const toggle = () => setShowEnglish(prev => !prev);
  return { showEnglish, toggle };
}
