import { useState, useEffect } from 'react';
import { Camera, Video, VideoOff, Download, X, RotateCw, Mic, MicOff } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useCamera } from '../../camera/useCamera';
import { useVideoRecording } from './useVideoRecording';

interface VideoRecorderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function VideoRecorderDialog({ open, onOpenChange }: VideoRecorderDialogProps) {
  const [quality, setQuality] = useState<'high' | 'medium' | 'low'>('high');
  const [audioEnabled, setAudioEnabled] = useState(true);
  
  const qualitySettings = {
    high: { width: 1920, height: 1080 },
    medium: { width: 1280, height: 720 },
    low: { width: 640, height: 480 },
  };

  const camera = useCamera({
    facingMode: 'environment',
    ...qualitySettings[quality],
  });

  const recording = useVideoRecording();

  useEffect(() => {
    if (open && !camera.isActive) {
      camera.startCamera();
    }
    return () => {
      if (camera.isActive) {
        camera.stopCamera();
      }
    };
  }, [open]);

  const handleStartRecording = () => {
    if (camera.videoRef.current) {
      recording.startRecording(camera.videoRef.current, audioEnabled);
    }
  };

  const handleClose = () => {
    recording.clearRecording();
    camera.stopCamera();
    onOpenChange(false);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera className="w-5 h-5" />
            Video Recorder
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Camera Error */}
          {camera.error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
              <p className="text-sm text-destructive font-medium">Camera Error</p>
              <p className="text-sm text-muted-foreground mt-1">{camera.error.message}</p>
              <Button
                onClick={camera.retry}
                variant="outline"
                size="sm"
                className="mt-2"
                disabled={camera.isLoading}
              >
                <RotateCw className="w-4 h-4 mr-2" />
                Retry
              </Button>
            </div>
          )}

          {/* Recording Error */}
          {recording.error && (
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
              <p className="text-sm text-amber-600 dark:text-amber-400">{recording.error}</p>
            </div>
          )}

          {/* Camera Preview or Playback */}
          <div className="relative bg-black rounded-lg overflow-hidden" style={{ minHeight: '400px', aspectRatio: '16/9' }}>
            {!recording.recordedUrl ? (
              <>
                <video
                  ref={camera.videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                  style={{ minHeight: '400px' }}
                />
                <canvas ref={camera.canvasRef} className="hidden" />
                
                {recording.isRecording && (
                  <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded-full flex items-center gap-2 animate-pulse">
                    <div className="w-3 h-3 bg-white rounded-full" />
                    <span className="text-sm font-medium">REC {formatDuration(recording.duration)}</span>
                  </div>
                )}
              </>
            ) : (
              <video
                src={recording.recordedUrl}
                controls
                className="w-full h-full object-cover"
                style={{ minHeight: '400px' }}
              />
            )}
          </div>

          {/* Controls */}
          {!recording.recordedUrl && !recording.isRecording && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Quality</Label>
                <Select value={quality} onValueChange={(v) => setQuality(v as any)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">High (1080p)</SelectItem>
                    <SelectItem value="medium">Medium (720p)</SelectItem>
                    <SelectItem value="low">Low (480p)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Camera</Label>
                <Button
                  onClick={() => camera.switchCamera()}
                  variant="outline"
                  className="w-full"
                  disabled={camera.isLoading || !camera.isActive}
                >
                  <RotateCw className="w-4 h-4 mr-2" />
                  Switch Camera
                </Button>
              </div>

              <div className="space-y-2">
                <Label>Audio</Label>
                <div className="flex items-center gap-2 h-10 px-3 border rounded-md">
                  <Switch
                    checked={audioEnabled}
                    onCheckedChange={setAudioEnabled}
                    id="audio-toggle"
                  />
                  <Label htmlFor="audio-toggle" className="cursor-pointer flex items-center gap-2">
                    {audioEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                    {audioEnabled ? 'On' : 'Off'}
                  </Label>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 justify-end">
            {!recording.recordedUrl ? (
              <>
                {!recording.isRecording ? (
                  <Button
                    onClick={handleStartRecording}
                    disabled={!camera.isActive || camera.isLoading}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    <Video className="w-4 h-4 mr-2" />
                    Start Recording
                  </Button>
                ) : (
                  <Button
                    onClick={recording.stopRecording}
                    variant="destructive"
                  >
                    <VideoOff className="w-4 h-4 mr-2" />
                    Stop Recording
                  </Button>
                )}
              </>
            ) : (
              <>
                <Button
                  onClick={recording.clearRecording}
                  variant="outline"
                >
                  <X className="w-4 h-4 mr-2" />
                  Discard
                </Button>
                <Button
                  onClick={() => recording.downloadRecording(`video-${Date.now()}.webm`)}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </>
            )}
            <Button onClick={handleClose} variant="ghost">
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
