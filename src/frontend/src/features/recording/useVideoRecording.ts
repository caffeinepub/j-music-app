import { useState, useRef, useCallback } from 'react';

export interface VideoRecordingState {
  isRecording: boolean;
  recordedBlob: Blob | null;
  recordedUrl: string | null;
  duration: number;
  error: string | null;
}

export interface UseVideoRecordingReturn extends VideoRecordingState {
  startRecording: (videoElement: HTMLVideoElement, includeAudio: boolean) => void;
  stopRecording: () => void;
  clearRecording: () => void;
  downloadRecording: (filename?: string) => void;
}

export function useVideoRecording(): UseVideoRecordingReturn {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startTimeRef = useRef<number>(0);
  const durationIntervalRef = useRef<number | null>(null);

  const startRecording = useCallback((videoElement: HTMLVideoElement, includeAudio: boolean) => {
    try {
      setError(null);
      const stream = videoElement.srcObject as MediaStream;
      
      if (!stream) {
        setError('No video stream available');
        return;
      }

      // Clone video tracks
      const videoTracks = stream.getVideoTracks();
      const tracks: MediaStreamTrack[] = [...videoTracks];

      // Add audio if requested
      if (includeAudio) {
        navigator.mediaDevices.getUserMedia({ audio: true })
          .then(audioStream => {
            const audioTracks = audioStream.getAudioTracks();
            tracks.push(...audioTracks);
            startRecordingWithTracks(tracks);
          })
          .catch(err => {
            console.warn('Could not get audio:', err);
            setError('Microphone unavailable, recording video only');
            startRecordingWithTracks(tracks);
          });
      } else {
        startRecordingWithTracks(tracks);
      }
    } catch (err) {
      setError('Failed to start recording');
      console.error('Recording error:', err);
    }
  }, []);

  const startRecordingWithTracks = (tracks: MediaStreamTrack[]) => {
    const recordStream = new MediaStream(tracks);
    
    let mimeType = 'video/webm';
    if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9')) {
      mimeType = 'video/webm;codecs=vp9';
    } else if (MediaRecorder.isTypeSupported('video/webm;codecs=vp8')) {
      mimeType = 'video/webm;codecs=vp8';
    }

    const mediaRecorder = new MediaRecorder(recordStream, { mimeType });
    mediaRecorderRef.current = mediaRecorder;
    chunksRef.current = [];

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunksRef.current.push(event.data);
      }
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: mimeType });
      const url = URL.createObjectURL(blob);
      setRecordedBlob(blob);
      setRecordedUrl(url);
      
      // Stop all tracks
      recordStream.getTracks().forEach(track => track.stop());
      
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
        durationIntervalRef.current = null;
      }
    };

    mediaRecorder.start();
    setIsRecording(true);
    startTimeRef.current = Date.now();
    
    // Update duration every second
    durationIntervalRef.current = window.setInterval(() => {
      setDuration(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);
  };

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }, [isRecording]);

  const clearRecording = useCallback(() => {
    if (recordedUrl) {
      URL.revokeObjectURL(recordedUrl);
    }
    setRecordedBlob(null);
    setRecordedUrl(null);
    setDuration(0);
    setError(null);
  }, [recordedUrl]);

  const downloadRecording = useCallback((filename = 'recording.webm') => {
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
    recordedBlob,
    recordedUrl,
    duration,
    error,
    startRecording,
    stopRecording,
    clearRecording,
    downloadRecording,
  };
}
