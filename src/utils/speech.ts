import { ElevenLabs, ElevenLabsClient } from "elevenlabs";
import { ELEVENLABS_API_KEY } from "../config.js";

const elevenlabs = new ElevenLabsClient({
  apiKey: ELEVENLABS_API_KEY,
});

export async function create(voiceId: string, script: string) {
  const stream = await elevenlabs.textToSpeech.convert(voiceId, {
    optimize_streaming_latency: ElevenLabs.OptimizeStreamingLatency.Zero,
    output_format: ElevenLabs.OutputFormat.Mp32205032,
    text: script,
    voice_settings: {
      stability: 0.1,
      similarity_boost: 0.3,
      style: 0.2,
    },
  });

  const buffers = [];
  for await (const data of stream) {
    buffers.push(data);
  }
  return Buffer.concat(buffers);
}
