export const MAX_AUDIO_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const SUPPORTED_AUDIO_FORMATS = ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp4', 'audio/webm'];

export function validateAudioFile(file: File): { valid: boolean; error?: string } {
  if (!SUPPORTED_AUDIO_FORMATS.includes(file.type)) {
    return {
      valid: false,
      error: 'Unsupported audio format. Please use MP3, WAV, OGG, MP4, or WebM files.',
    };
  }

  if (file.size > MAX_AUDIO_FILE_SIZE) {
    return {
      valid: false,
      error: `File size exceeds ${MAX_AUDIO_FILE_SIZE / 1024 / 1024}MB limit.`,
    };
  }

  return { valid: true };
}

export async function readAudioFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result;
      if (typeof result === 'string') {
        resolve(result);
      } else {
        reject(new Error('Failed to read file as data URL'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

export async function getAudioDuration(dataUrl: string): Promise<number> {
  return new Promise((resolve, reject) => {
    const audio = new Audio(dataUrl);
    audio.onloadedmetadata = () => resolve(audio.duration);
    audio.onerror = () => reject(new Error('Failed to load audio metadata'));
  });
}
