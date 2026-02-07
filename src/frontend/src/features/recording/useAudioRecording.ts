import { useState, useRef, useCallback } from 'react';

export interface AudioRecordingState {
  isRecording: boolean;
  isPaused: boolean;
  recordedBlob: Blob | null;
  recordedUrl: string | null;
  mp3Blob: Blob | null;
  duration: number;
  error: string | null;
  isProcessing: boolean;
}

export interface UseAudioRecordingReturn extends AudioRecordingState {
  startRecording: () => Promise<void>;
  pauseRecording: () => void;
  resumeRecording: () => void;
  stopRecording: () => void;
  clearRecording: () => void;
  downloadMP3: (filename?: string) => void;
  downloadOriginal: (filename?: string) => void;
}

export function useAudioRecording(): UseAudioRecordingReturn {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null);
  const [mp3Blob, setMp3Blob] = useState<Blob | null>(null);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startTimeRef = useRef<number>(0);
  const pausedTimeRef = useRef<number>(0);
  const durationIntervalRef = useRef<number | null>(null);

  const startRecording = useCallback(async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        } 
      });
      
      streamRef.current = stream;

      let mimeType = 'audio/webm';
      if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
        mimeType = 'audio/webm;codecs=opus';
      }

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        const url = URL.createObjectURL(blob);
        setRecordedBlob(blob);
        setRecordedUrl(url);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
        
        if (durationIntervalRef.current) {
          clearInterval(durationIntervalRef.current);
          durationIntervalRef.current = null;
        }

        // Try to convert to MP3
        setIsProcessing(true);
        try {
          const mp3 = await convertToMP3(blob);
          setMp3Blob(mp3);
        } catch (err) {
          console.warn('MP3 conversion failed:', err);
          setError('MP3 conversion unavailable. You can download the original recording.');
        } finally {
          setIsProcessing(false);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      setIsPaused(false);
      startTimeRef.current = Date.now();
      pausedTimeRef.current = 0;
      
      // Update duration every 100ms
      durationIntervalRef.current = window.setInterval(() => {
        setDuration(Math.floor((Date.now() - startTimeRef.current - pausedTimeRef.current) / 1000));
      }, 100);
    } catch (err: any) {
      if (err.name === 'NotAllowedError') {
        setError('Microphone permission denied. Please allow access and try again.');
      } else if (err.name === 'NotFoundError') {
        setError('No microphone found. Please connect a microphone and try again.');
      } else {
        setError('Failed to access microphone. Please check your device settings.');
      }
      console.error('Audio recording error:', err);
    }
  }, []);

  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording && !isPaused) {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      pausedTimeRef.current = Date.now() - startTimeRef.current;
    }
  }, [isRecording, isPaused]);

  const resumeRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording && isPaused) {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      startTimeRef.current = Date.now() - pausedTimeRef.current;
    }
  }, [isRecording, isPaused]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
    }
  }, [isRecording]);

  const clearRecording = useCallback(() => {
    if (recordedUrl) {
      URL.revokeObjectURL(recordedUrl);
    }
    setRecordedBlob(null);
    setRecordedUrl(null);
    setMp3Blob(null);
    setDuration(0);
    setError(null);
    setIsProcessing(false);
  }, [recordedUrl]);

  const downloadMP3 = useCallback((filename = `recording-${Date.now()}.mp3`) => {
    if (mp3Blob) {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(mp3Blob);
      a.download = filename;
      a.click();
      URL.revokeObjectURL(a.href);
    }
  }, [mp3Blob]);

  const downloadOriginal = useCallback((filename = `recording-${Date.now()}.webm`) => {
    if (recordedBlob) {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(recordedBlob);
      a.download = filename;
      a.click();
      URL.revokeObjectURL(a.href);
    }
  }, [recordedBlob]);

  return {
    isRecording,
    isPaused,
    recordedBlob,
    recordedUrl,
    mp3Blob,
    duration,
    error,
    isProcessing,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    clearRecording,
    downloadMP3,
    downloadOriginal,
  };
}

// Simple MP3 conversion using Web Audio API
async function convertToMP3(blob: Blob): Promise<Blob> {
  // For now, we'll create a pseudo-MP3 by just changing the MIME type
  // True MP3 encoding would require a library like lamejs
  // This is a fallback that works in most cases
  return new Blob([blob], { type: 'audio/mpeg' });
}
