import { useState, useEffect } from 'react';

export default function ExamCountdown() {
  const [daysLeft, setDaysLeft] = useState(0);

  useEffect(() => {
    const calculateDays = () => {
      const examDate = new Date('2026-05-15T09:00:00'); // YKI exam date
      const today = new Date();
      const diff = examDate - today;
      const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
      setDaysLeft(Math.max(0, days));
    };

    calculateDays();
    const interval = setInterval(calculateDays, 1000 * 60 * 60); // Update hourly
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{
      background: 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)',
      color: 'white',
      padding: '16px 20px',
      textAlign: 'center',
      boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
    }}>
      <div style={{ 
        fontSize: '1.8rem', 
        fontWeight: '900', 
        letterSpacing: '2px',
        textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
      }}>
        ⏳ {daysLeft} PÄIVÄÄ KOKEESEEN
      </div>
      <div style={{ fontSize: '0.9rem', opacity: 0.9, marginTop: '4px' }}>
        📅 YKI B1 - 15. Toukokuuta 2026
      </div>
    </div>
  );
}
