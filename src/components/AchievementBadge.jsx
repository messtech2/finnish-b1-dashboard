export default function AchievementBadge({ progress, wordId, onCompleteStep }) {
  const steps = [
    { 
      id: 'read', 
      label: '📖 Lue: Kuuntele sana', 
      icon: '📖', 
      color: '#3498db',
      description: 'Kuuntele ääntäys'
    },
    { 
      id: 'practice', 
      label: '🗣️ Harjoittele: Puhu sana', 
      icon: '🗣️', 
      color: '#9b59b6',
      description: 'Harjoittele ääntämistä'
    },
    { 
      id: 'game', 
      label: '🎮 Pelaa: Testaa tietosi', 
      icon: '🎮', 
      color: '#e67e22',
      description: 'Pelaa visailua'
    }
  ];

  return (
    <div className="achievement-badge">
      <div className="achievement-progress">
        <div className="progress-ring" title={`${progress.percent}% valmis`}>
          <svg viewBox="0 0 36 36" className="progress-ring-svg">
            <path
              className="progress-ring-circle-bg"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="#e0e0e0"
              strokeWidth="3"
            />
            <path
              className="progress-ring-circle"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke={progress.mastered ? '#28a745' : '#003580'}
              strokeWidth="3"
              strokeDasharray={`${progress.percent}, 100`}
              strokeLinecap="round"
            />
          </svg>
          {progress.mastered && <span className="mastered-icon" title="Hallittu!">🏆</span>}
        </div>
      </div>

      <div className="achievement-steps">
        {steps.map(step => (
          <button
            key={step.id}
            className={`achievement-step ${progress[step.id] ? 'completed' : ''}`}
            onClick={() => !progress[step.id] && onCompleteStep && onCompleteStep(step.id)}
            style={{ borderColor: step.color }}
            title={`${step.label}\n${step.description}`}
          >
            <span className="step-icon">{step.icon}</span>
            {progress[step.id] && <span className="step-check" title="Suoritettu">✓</span>}
          </button>
        ))}
      </div>

      {progress.mastered && (
        <div className="mastered-badge" title="Tämä sana on hallittu!">
          <span>✅ Hallittu!</span>
        </div>
      )}
    </div>
  );
}
