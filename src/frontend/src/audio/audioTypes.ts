export interface ChannelState {
  name: string;
  volume: number;
  muted: boolean;
  solo: boolean;
}

export interface GuitarAmpSettings {
  drive: number;
  bass: number;
  mid: number;
  treble: number;
  presence: number;
  master: number;
}

export interface PianoRollNote {
  id: string;
  startStep: number;
  duration: number;
  pitch: number;
  track: number;
}

export interface ImportedAudio {
  name: string;
  data: string;
  startStep: number;
  duration: number;
}

export interface CompositionState {
  tempo: number;
  masterVolume: number;
  channels: ChannelState[];
  drumPattern: boolean[][];
  bassNotes: (number | null)[];
  synthNotes: (number | null)[];
  pianoNotes: (number | null)[];
  guitarNotes: (number | null)[];
  stringsNotes: (number | null)[];
  guitarAmp: GuitarAmpSettings;
  pianoRollNotes: PianoRollNote[];
  timelineLength: number;
  importedAudio: ImportedAudio | null;
}
