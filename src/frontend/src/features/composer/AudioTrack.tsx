import { useState, useRef } from 'react';
import { Upload, Play, Trash2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { CompositionState } from '../../audio/audioTypes';

interface AudioTrackProps {
  composition: CompositionState;
  onCompositionChange: (composition: CompositionState) => void;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const SUPPORTED_FORMATS = ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp4'];

export default function AudioTrack({ composition, onCompositionChange }: AudioTrackProps) {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [startStep, setStartStep] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);
    setIsLoading(true);

    try {
      // Validate file type
      if (!SUPPORTED_FORMATS.includes(file.type)) {
        throw new Error(`Unsupported format. Please use MP3, WAV, OGG, or MP4 audio files.`);
      }

      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        throw new Error(`File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB.`);
      }

      // Read file as data URL
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        setPreviewUrl(dataUrl);
        
        // Create audio element to get duration
        const audio = new Audio(dataUrl);
        audio.onloadedmetadata = () => {
          const durationInSteps = Math.ceil((audio.duration * composition.tempo) / 60 / 0.25);
          
          onCompositionChange({
            ...composition,
            importedAudio: {
              name: file.name,
              data: dataUrl,
              startStep,
              duration: durationInSteps,
            },
          });
          
          setIsLoading(false);
        };
      };
      
      reader.onerror = () => {
        throw new Error('Failed to read file.');
      };
      
      reader.readAsDataURL(file);
    } catch (err: any) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  const handleRemove = () => {
    onCompositionChange({
      ...composition,
      importedAudio: null,
    });
    setPreviewUrl(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handlePreview = () => {
    if (audioRef.current) {
      if (audioRef.current.paused) {
        audioRef.current.play();
      } else {
        audioRef.current.pause();
      }
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-white text-lg font-semibold">Audio Import</Label>
        <p className="text-sm text-gray-400 mt-1">
          Import audio files to use in your composition. Supported formats: MP3, WAV, OGG, MP4
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!composition.importedAudio ? (
        <div className="border-2 border-dashed border-white/20 rounded-lg p-8 text-center">
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="text-white mb-2">Import an audio file</p>
          <p className="text-sm text-gray-400 mb-4">
            Maximum file size: {MAX_FILE_SIZE / 1024 / 1024}MB
          </p>
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            className="bg-amber-600 hover:bg-amber-700"
          >
            {isLoading ? 'Loading...' : 'Choose File'}
          </Button>
        </div>
      ) : (
        <div className="border border-white/20 rounded-lg p-6 bg-black/40 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-semibold">{composition.importedAudio.name}</p>
              <p className="text-sm text-gray-400">
                Duration: ~{composition.importedAudio.duration} steps
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handlePreview}
                variant="outline"
                size="sm"
                className="bg-white/10 border-white/20 hover:bg-white/20 text-white"
              >
                <Play className="w-4 h-4 mr-2" />
                Preview
              </Button>
              <Button
                onClick={handleRemove}
                variant="destructive"
                size="sm"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Remove
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-white text-sm">Start Position (Step)</Label>
            <Input
              type="number"
              min={0}
              max={(composition.timelineLength || 16) - 1}
              value={startStep}
              onChange={(e) => {
                const value = parseInt(e.target.value) || 0;
                setStartStep(value);
                onCompositionChange({
                  ...composition,
                  importedAudio: {
                    ...composition.importedAudio!,
                    startStep: value,
                  },
                });
              }}
              className="bg-white/5 border-white/20 text-white"
            />
            <p className="text-xs text-gray-400">
              The audio will start playing at this step in the timeline
            </p>
          </div>

          <audio ref={audioRef} src={composition.importedAudio.data} className="hidden" />
        </div>
      )}
    </div>
  );
}
