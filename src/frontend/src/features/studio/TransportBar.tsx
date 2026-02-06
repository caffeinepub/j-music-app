import { Play, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';

interface TransportBarProps {
  isPlaying: boolean;
  onPlayPause: () => void;
  tempo: number;
  onTempoChange: (tempo: number) => void;
}

export default function TransportBar({ isPlaying, onPlayPause, tempo, onTempoChange }: TransportBarProps) {
  return (
    <Card className="p-4 bg-black/60 border-white/20 backdrop-blur-sm">
      <div className="flex items-center gap-6">
        <Button
          onClick={onPlayPause}
          size="lg"
          className="bg-amber-600 hover:bg-amber-700 text-white"
        >
          {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
        </Button>
        
        <div className="flex-1 max-w-xs space-y-2">
          <Label className="text-white text-sm">Tempo: {tempo} BPM</Label>
          <Slider
            value={[tempo]}
            onValueChange={([value]) => onTempoChange(value)}
            min={60}
            max={180}
            step={1}
            className="cursor-pointer"
          />
        </div>
      </div>
    </Card>
  );
}
