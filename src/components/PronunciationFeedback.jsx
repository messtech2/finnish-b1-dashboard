export default function PronunciationFeedback({ result, onRetry }) {
  if (!result) return null;

  const getScoreColor = (score) => {
    if (score >= 90) return '#28a745';
    if (score >= 70) return '#17a2b8';
    if (score >= 50) return '#ffc107';
    return '#dc3545';
  };

  const getScoreIcon = (score) => {
    if (score >= 90) return '🏆';
    if (score >= 70) return '👍';
    if (score >= 50) return '💪';
    return '🎯';
  };

  return (
    <div className="pronunciation-feedback" style={{ borderColor: getScoreColor(result.score) }}>
      <div className="feedback-header">
        <span className="feedback-icon">{getScoreIcon(result.score)}</span>
        <span className="feedback-score" style={{ color: getScoreColor(result.score) }}>
          {result.score}% Match
        </span>
      </div>

      <div className="feedback-content">
        <div className="feedback-row">
          <span className="label">🎯 Target:</span>
          <span className="value">{result.target}</span>
        </div>
        
        <div className="feedback-row">
          <span className="label">🎤 You said:</span>
          <span className="value">{result.spoken || '(Could not hear)'}</span>
        </div>

        <div className="feedback-message">
          {result.feedback}
        </div>
      </div>

      {!result.error && (
        <button onClick={onRetry} className="retry-btn">
          🔄 Try Again
        </button>
      )}
    </div>
  );
}
