import usePronunciation from '../hooks/usePronunciation';

export default  function PronunciationTest() {
  const { startListening, listening, result, resetResult } = usePronunciation();

  return (
    <div className="card" style={{ maxWidth: '500px', margin: '20px auto' }}>
      <h3>🎤 Pronunciation Test</h3>
      <p>Click below and say "ystävä"</p>
      
      <button 
        onClick={() => startListening("ystävä")}
        disabled={listening}
        className="game-btn"
        style={{ marginBottom: '20px' }}
      >
        {listening ? '🎤 Listening...' : '🎙️ Start Speaking'}
      </button>

      {result && (
        <div style={{ 
          padding: '15px', 
          background: result.score >= 70 ? '#d4edda' : '#f8d7da',
          borderRadius: '8px',
          marginTop: '15px'
        }}>
          <p><strong>You said:</strong> {result.spoken}</p>
          <p><strong>Score:</strong> {result.score}%</p>
          <p><strong>Feedback:</strong> {result.feedback}</p>
          <button onClick={resetResult} style={{ marginTop: '10px' }}>
            Clear
          </button>
        </div>
      )}
    </div>
  );
}
