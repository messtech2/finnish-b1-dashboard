export default function StrengthTracker({ strength }) {
  const strengthLabels = {
    1: 'Heikko',
    2: 'Välttävä',
    3: 'Tyydyttävä',
    4: 'Hyvä',
    5: 'Erinomainen'
  };

  const strengthColors = {
    1: '#dc3545',
    2: '#ffc107',
    3: '#17a2b8',
    4: '#28a745',
    5: '#003580'
  };

  return (
    <div className="strength-tracker">
      <div className="strength-bars">
        {[1, 2, 3, 4, 5].map(level => (
          <div 
            key={level}
            className={`strength-bar ${level <= strength ? 'filled' : ''}`}
            style={{ 
              backgroundColor: level <= strength ? strengthColors[strength] : '#e0e0e0'
            }}
          />
        ))}
      </div>
      <span className="strength-label">{strengthLabels[strength] || ''}</span>
    </div>
  );
}