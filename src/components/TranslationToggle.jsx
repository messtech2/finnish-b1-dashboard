export default function TranslationToggle({ showEnglish, onToggle }) {
  return (
    <button
      className="translation-toggle"
      onClick={onToggle}
      title={showEnglish ? 'Piilota englanti' : 'Näytä englanti'}
      aria-label={showEnglish ? 'Hide English translations' : 'Show English translations'}
    >
      {showEnglish ? '🙈 Piilota EN' : '👁️ Näytä EN'}
    </button>
  );
}
