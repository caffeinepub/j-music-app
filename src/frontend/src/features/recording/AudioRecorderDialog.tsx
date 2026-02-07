import { Mic, Square, Pause, Play, Download, X, RotateCw } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useAudioRecording } from './useAudioRecording';

interface AudioRecorderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AudioRecorderDialog({ open, onOpenChange }: AudioRecorderDialogProps) {
  const recording = useAudioRecording();

  const handleClose = () => {
    recording.clearRecording();
    onOpenChange(false);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mic className="w-5 h-5" />
            Audio Recorder
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Error Display */}
          {recording.error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
              <p className="text-sm text-destructive font-medium">Error</p>
              <p className="text-sm text-muted-foreground mt-1">{recording.error}</p>
              {!recording.isRecording && !recording.recordedBlob && (
                <Button
                  onClick={recording.startRecording}
                  variant="outline"
                  size="sm"
                  className="mt-2"
                >
                  <RotateCw className="w-4 h-4 mr-2" />
                  Retry
                </Button>
              )}
            </div>
          )}

          {/* Recording Visualization */}
          <div className="bg-muted rounded-lg p-8 text-center">
            {recording.isRecording ? (
              <div className="space-y-4">
                <div className="flex justify-center">
                  <div className={`w-20 h-20 rounded-full bg-red-600 flex items-center justify-center ${recording.isPaused ? '' : 'animate-pulse'}`}>
                    <Mic className="w-10 h-10 text-white" />
                  </div>
                </div>
                <div className="text-3xl font-bold tabular-nums">
                  {formatDuration(recording.duration)}
                </div>
                <div className="text-sm text-muted-foreground">
                  {recording.isPaused ? 'Paused' : 'Recording...'}
                </div>
              </div>
            ) : recording.recordedBlob ? (
              <div className="space-y-4">
                <div className="flex justify-center">
                  <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center">
                    <Mic className="w-10 h-10 text-primary-foreground" />
                  </div>
                </div>
                <div className="text-2xl font-bold">
                  Recording Complete
                </div>
                <div className="text-sm text-muted-foreground">
                  Duration: {formatDuration(recording.duration)}
                </div>
                {recording.recordedUrl && (
                  <audio src={recording.recordedUrl} controls className="w-full mt-4" />
                )}
                {recording.isProcessing && (
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Converting to MP3...</p>
                    <Progress value={undefined} className="w-full" />
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-center">
                  <div className="w-20 h-20 rounded-full bg-muted-foreground/20 flex items-center justify-center">
                    <Mic className="w-10 h-10 text-muted-foreground" />
                  </div>
                </div>
                <div className="text-lg font-medium">Ready to Record</div>
                <div className="text-sm text-muted-foreground">
                  Click Start to begin recording audio
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 justify-end">
            {!recording.recordedBlob ? (
              <>
                {!recording.isRecording ? (
                  <Button
                    onClick={recording.startRecording}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    <Mic className="w-4 h-4 mr-2" />
                    Start Recording
                  </Button>
                ) : (
                  <>
                    {!recording.isPaused ? (
                      <Button
                        onClick={recording.pauseRecording}
                        variant="outline"
                      >
                        <Pause className="w-4 h-4 mr-2" />
                        Pause
                      </Button>
                    ) : (
                      <Button
                        onClick={recording.resumeRecording}
                        variant="outline"
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Resume
                      </Button>
                    )}
                    <Button
                      onClick={recording.stopRecording}
                      variant="destructive"
                    >
                      <Square className="w-4 h-4 mr-2" />
                      Stop
                    </Button>
                  </>
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
                {recording.mp3Blob ? (
                  <Button
                    onClick={() => recording.downloadMP3()}
                    disabled={recording.isProcessing}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download MP3
                  </Button>
                ) : (
                  <Button
                    onClick={() => recording.downloadOriginal()}
                    disabled={recording.isProcessing}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                )}
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
