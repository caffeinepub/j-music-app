import type { CompositionState } from './audioTypes';

export function serializeComposition(composition: CompositionState): Uint8Array {
  const json = JSON.stringify(composition);
  const encoder = new TextEncoder();
  return encoder.encode(json);
}

export function deserializeComposition(data: Uint8Array): CompositionState {
  const decoder = new TextDecoder();
  const json = decoder.decode(data);
  const parsed = JSON.parse(json);
  
  // Provide defaults for new fields to maintain backward compatibility
  return {
    ...parsed,
    guitarAmp: parsed.guitarAmp || {
      drive: 0.5,
      bass: 0.5,
      mid: 0.5,
      treble: 0.5,
      presence: 0.5,
      master: 0.7,
    },
    pianoRollNotes: parsed.pianoRollNotes || [],
    timelineLength: parsed.timelineLength || 16,
    importedAudio: parsed.importedAudio || null,
  };
}
