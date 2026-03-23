import { useTTS } from '../hooks/useTTS';

export default function AudioStopButton() {
  const { stop, isSpeaking } = useTTS();

  if (!isSpeaking) return null;

  return (
    <button 
      className="global-audio-stop" 
      onClick={stop}
      title="Pysäytä kaikki äänet"
      aria-label="Stop audio"
    >
      ⏹️ Pysäytä ääni
    </button>
  );
}
