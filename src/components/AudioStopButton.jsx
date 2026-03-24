import { useEffect } from 'react';
import { useTTS } from '../hooks/useTTS';

// ✅ Global audio stop button - shows when audio is playing
export default function AudioStopButton() {
  const { stop, isPlaying } = useTTS();

  // ✅ Stop audio when navigating away
  useEffect(() => {
    return () => {
      if (isPlaying) {
        stop();
      }
    };
  }, [isPlaying, stop]);

  if (!isPlaying) return null;

  return (
    <button 
      className="global-audio-stop" 
      onClick={stop}
      title="Pysäytä kaikki äänet"
      type="button"
    >
      ⏹️ Pysäytä ääni
    </button>
  );
}
