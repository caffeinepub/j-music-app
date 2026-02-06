import { useState, useEffect, useRef, useCallback } from 'react';
import type { CompositionState } from './audioTypes';

export function useAudioEngine(composition: CompositionState) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const gainNodesRef = useRef<GainNode[]>([]);
  const masterGainRef = useRef<GainNode | null>(null);
  const intervalRef = useRef<number | null>(null);
  const guitarAmpNodesRef = useRef<{
    preGain: GainNode;
    bassEQ: BiquadFilterNode;
    midEQ: BiquadFilterNode;
    trebleEQ: BiquadFilterNode;
    presence: BiquadFilterNode;
    postGain: GainNode;
  } | null>(null);
  const importedAudioBufferRef = useRef<AudioBuffer | null>(null);

  // Initialize audio context on first user interaction
  const initAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
      masterGainRef.current = audioContextRef.current.createGain();
      masterGainRef.current.connect(audioContextRef.current.destination);

      // Create gain nodes for each channel
      gainNodesRef.current = composition.channels.map((_, index) => {
        const gain = audioContextRef.current!.createGain();
        
        // Guitar channel (index 6) gets amp processing
        if (index === 6) {
          const preGain = audioContextRef.current!.createGain();
          const bassEQ = audioContextRef.current!.createBiquadFilter();
          const midEQ = audioContextRef.current!.createBiquadFilter();
          const trebleEQ = audioContextRef.current!.createBiquadFilter();
          const presence = audioContextRef.current!.createBiquadFilter();
          const postGain = audioContextRef.current!.createGain();

          bassEQ.type = 'lowshelf';
          bassEQ.frequency.value = 200;
          midEQ.type = 'peaking';
          midEQ.frequency.value = 1000;
          midEQ.Q.value = 1;
          trebleEQ.type = 'highshelf';
          trebleEQ.frequency.value = 3000;
          presence.type = 'peaking';
          presence.frequency.value = 4000;
          presence.Q.value = 2;

          preGain.connect(bassEQ);
          bassEQ.connect(midEQ);
          midEQ.connect(trebleEQ);
          trebleEQ.connect(presence);
          presence.connect(postGain);
          postGain.connect(gain);

          guitarAmpNodesRef.current = { preGain, bassEQ, midEQ, trebleEQ, presence, postGain };
        }
        
        gain.connect(masterGainRef.current!);
        return gain;
      });
    }
  }, [composition.channels]);

  // Update gain values and amp settings when composition changes
  useEffect(() => {
    if (masterGainRef.current) {
      masterGainRef.current.gain.value = composition.masterVolume;
    }

    gainNodesRef.current.forEach((gain, index) => {
      const channel = composition.channels[index];
      if (channel) {
        const anySolo = composition.channels.some(ch => ch.solo);
        
        if (anySolo) {
          gain.gain.value = channel.solo && !channel.muted ? channel.volume : 0;
        } else {
          gain.gain.value = channel.muted ? 0 : channel.volume;
        }
      }
    });

    // Update guitar amp settings
    if (guitarAmpNodesRef.current && composition.guitarAmp) {
      const amp = composition.guitarAmp;
      guitarAmpNodesRef.current.preGain.gain.value = 0.5 + amp.drive * 2;
      guitarAmpNodesRef.current.bassEQ.gain.value = (amp.bass - 0.5) * 24;
      guitarAmpNodesRef.current.midEQ.gain.value = (amp.mid - 0.5) * 24;
      guitarAmpNodesRef.current.trebleEQ.gain.value = (amp.treble - 0.5) * 24;
      guitarAmpNodesRef.current.presence.gain.value = (amp.presence - 0.5) * 12;
      guitarAmpNodesRef.current.postGain.gain.value = amp.master;
    }
  }, [composition]);

  // Load imported audio
  useEffect(() => {
    if (composition.importedAudio && audioContextRef.current) {
      const loadAudio = async () => {
        try {
          const response = await fetch(composition.importedAudio!.data);
          const arrayBuffer = await response.arrayBuffer();
          const audioBuffer = await audioContextRef.current!.decodeAudioData(arrayBuffer);
          importedAudioBufferRef.current = audioBuffer;
        } catch (error) {
          console.error('Failed to load imported audio:', error);
        }
      };
      loadAudio();
    }
  }, [composition.importedAudio]);

  // Play drum sound
  const playDrum = useCallback((drumIndex: number) => {
    if (!audioContextRef.current || !gainNodesRef.current[drumIndex]) return;

    const ctx = audioContextRef.current;
    const now = ctx.currentTime;

    if (drumIndex === 0) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.exponentialRampToValueAtTime(0.01, now + 0.5);
      
      gain.gain.setValueAtTime(1, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
      
      osc.connect(gain);
      gain.connect(gainNodesRef.current[drumIndex]);
      
      osc.start(now);
      osc.stop(now + 0.5);
    } else if (drumIndex === 1) {
      const bufferSize = ctx.sampleRate * 0.2;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      
      const noise = ctx.createBufferSource();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();
      
      noise.buffer = buffer;
      filter.type = 'highpass';
      filter.frequency.value = 1000;
      
      gain.gain.setValueAtTime(0.5, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
      
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(gainNodesRef.current[drumIndex]);
      
      noise.start(now);
      noise.stop(now + 0.2);
    } else if (drumIndex === 2) {
      const bufferSize = ctx.sampleRate * 0.05;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      
      const noise = ctx.createBufferSource();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();
      
      noise.buffer = buffer;
      filter.type = 'highpass';
      filter.frequency.value = 5000;
      
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
      
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(gainNodesRef.current[drumIndex]);
      
      noise.start(now);
      noise.stop(now + 0.05);
    }
  }, []);

  const playBass = useCallback((midiNote: number) => {
    if (!audioContextRef.current || !gainNodesRef.current[3]) return;

    const ctx = audioContextRef.current;
    const now = ctx.currentTime;
    const frequency = 440 * Math.pow(2, (midiNote - 69) / 12);

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'triangle';
    osc.frequency.value = frequency;
    
    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
    
    osc.connect(gain);
    gain.connect(gainNodesRef.current[3]);
    
    osc.start(now);
    osc.stop(now + 0.4);
  }, []);

  const playSynth = useCallback((midiNote: number) => {
    if (!audioContextRef.current || !gainNodesRef.current[4]) return;

    const ctx = audioContextRef.current;
    const now = ctx.currentTime;
    const frequency = 440 * Math.pow(2, (midiNote - 69) / 12);

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sawtooth';
    osc.frequency.value = frequency;
    
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
    
    osc.connect(gain);
    gain.connect(gainNodesRef.current[4]);
    
    osc.start(now);
    osc.stop(now + 0.3);
  }, []);

  const playPiano = useCallback((midiNote: number) => {
    if (!audioContextRef.current || !gainNodesRef.current[5]) return;

    const ctx = audioContextRef.current;
    const now = ctx.currentTime;
    const frequency = 440 * Math.pow(2, (midiNote - 69) / 12);

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.value = frequency;
    
    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
    
    osc.connect(gain);
    gain.connect(gainNodesRef.current[5]);
    
    osc.start(now);
    osc.stop(now + 0.5);
  }, []);

  const playGuitar = useCallback((midiNote: number) => {
    if (!audioContextRef.current || !guitarAmpNodesRef.current) return;

    const ctx = audioContextRef.current;
    const now = ctx.currentTime;
    const frequency = 440 * Math.pow(2, (midiNote - 69) / 12);

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'square';
    osc.frequency.value = frequency;
    
    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
    
    osc.connect(gain);
    gain.connect(guitarAmpNodesRef.current.preGain);
    
    osc.start(now);
    osc.stop(now + 0.4);
  }, []);

  const playStrings = useCallback((midiNote: number) => {
    if (!audioContextRef.current || !gainNodesRef.current[7]) return;

    const ctx = audioContextRef.current;
    const now = ctx.currentTime;
    const frequency = 440 * Math.pow(2, (midiNote - 69) / 12);

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sawtooth';
    osc.frequency.value = frequency;
    
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.linearRampToValueAtTime(0.3, now + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.8);
    
    osc.connect(gain);
    gain.connect(gainNodesRef.current[7]);
    
    osc.start(now);
    osc.stop(now + 0.8);
  }, []);

  const playPianoRollNote = useCallback((note: { pitch: number; track: number }) => {
    const trackMap = [playDrum, playDrum, playDrum, playBass, playSynth, playPiano, playGuitar, playStrings];
    const playFunc = trackMap[note.track];
    if (playFunc && note.track >= 3) {
      playFunc(note.pitch);
    } else if (note.track < 3) {
      playDrum(note.track);
    }
  }, [playDrum, playBass, playSynth, playPiano, playGuitar, playStrings]);

  const playStep = useCallback((step: number) => {
    const drumStep = composition.drumPattern[step];
    if (drumStep) {
      drumStep.forEach((active, drumIndex) => {
        if (active) {
          playDrum(drumIndex);
        }
      });
    }

    const bassNote = composition.bassNotes[step];
    if (bassNote !== null) {
      playBass(bassNote);
    }

    const synthNote = composition.synthNotes[step];
    if (synthNote !== null) {
      playSynth(synthNote);
    }

    const pianoNote = composition.pianoNotes[step];
    if (pianoNote !== null) {
      playPiano(pianoNote);
    }

    const guitarNote = composition.guitarNotes[step];
    if (guitarNote !== null) {
      playGuitar(guitarNote);
    }

    const stringsNote = composition.stringsNotes[step];
    if (stringsNote !== null) {
      playStrings(stringsNote);
    }

    // Play piano roll notes
    if (composition.pianoRollNotes) {
      composition.pianoRollNotes.forEach(note => {
        if (note.startStep === step) {
          playPianoRollNote(note);
        }
      });
    }

    // Play imported audio
    if (composition.importedAudio && importedAudioBufferRef.current && composition.importedAudio.startStep === step) {
      const ctx = audioContextRef.current;
      if (ctx && masterGainRef.current) {
        const source = ctx.createBufferSource();
        source.buffer = importedAudioBufferRef.current;
        source.connect(masterGainRef.current);
        source.start(ctx.currentTime);
      }
    }
  }, [composition, playDrum, playBass, playSynth, playPiano, playGuitar, playStrings, playPianoRollNote]);

  const togglePlayback = useCallback(() => {
    initAudioContext();
    
    if (isPlaying) {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setIsPlaying(false);
    } else {
      const stepDuration = (60 / composition.tempo) * 250;
      const maxSteps = composition.timelineLength || 16;
      
      setIsPlaying(true);
      intervalRef.current = window.setInterval(() => {
        setCurrentStep((prev) => {
          const next = (prev + 1) % maxSteps;
          playStep(next);
          return next;
        });
      }, stepDuration);
    }
  }, [isPlaying, composition.tempo, composition.timelineLength, initAudioContext, playStep]);

  useEffect(() => {
    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    isPlaying,
    currentStep,
    togglePlayback,
  };
}
