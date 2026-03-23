export default function AchievementBadge({ progress, wordId, onCompleteStep }) {
  const steps = [
    { id: 'read', label: '📖 Lue', icon: '📖', color: '#3498db' },
    { id: 'practice', label: '🗣️ Harjoittele', icon: '🗣️', color: '#9b59b6' },
    { id: 'game', label: '🎮 Pelaa', icon: '🎮', color: '#e67e22' }
  ];

  return (
    <div className="achievement-badge">
      <div className="achievement-progress">
        <div className="progress-ring">
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
          {progress.mastered && <span className="mastered-icon">🏆</span>}
        </div>
      </div>

      <div className="achievement-steps">
        {steps.map(step => (
          <button
            key={step.id}
            className={`achievement-step ${progress[step.id] ? 'completed' : ''}`}
            onClick={() => !progress[step.id] && onCompleteStep && onCompleteStep(step.id)}
            style={{ borderColor: step.color }}
            title={step.label}
          >
            <span className="step-icon">{step.icon}</span>
            {progress[step.id] && <span className="step-check">✓</span>}
          </button>
        ))}
      </div>

      {progress.mastered && (
        <div className="mastered-badge">
          <span>✅ Hallittu!</span>
        </div>
      )}
    </div>
  );
}
