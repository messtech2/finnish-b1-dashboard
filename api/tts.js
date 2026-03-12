import { Buffer } from "buffer";

export default async function handler(req, res) {

  const { text } = req.body;
  const apiKey = globalThis.process?.env?.ELEVENLABS_API_KEY;

  if (!apiKey) {
    res.status(500).json({ error: "ELEVENLABS_API_KEY is not configured." });
    return;
  }

  const response = await fetch(
    "https://api.elevenlabs.io/v1/text-to-speech/c4ZwDxrFaobUF5e1KlEM",
    {
      method: "POST",
      headers: {
        "xi-api-key": apiKey,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_flash_v2_5",
        voice_settings: {
          stability: 0.45,
          similarity_boost: 0.75
        }
      })
    }
  );

  const audioBuffer = await response.arrayBuffer();

  res.setHeader("Content-Type", "audio/mpeg");
  res.send(Buffer.from(audioBuffer));

}