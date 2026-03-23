export default function TranslationToggle({ showEnglish, onToggle }) {
  return (
    <div className="translation-toggle-container">
      <button
        className="translation-toggle"
        onClick={onToggle}
        title={showEnglish ? 'Piilota englanti (🙈)' : 'Näytä englanti (👁️)'}
        aria-label={showEnglish ? 'Hide English translations' : 'Show English translations'}
      >
        <span className="toggle-icon">{showEnglish ? '🙈' : '👁️'}</span>
        <span className="toggle-text">{showEnglish ? 'Piilota EN' : 'Näytä EN'}</span>
      </button>
    </div>
  );
}
