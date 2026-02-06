import { Volume2, VolumeX } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import type { ChannelState } from '../../audio/audioTypes';

interface MixerPanelProps {
  channels: ChannelState[];
  masterVolume: number;
  onChannelChange: (index: number, updates: Partial<ChannelState>) => void;
  onMasterVolumeChange: (volume: number) => void;
}

export default function MixerPanel({ 
  channels, 
  masterVolume, 
  onChannelChange, 
  onMasterVolumeChange 
}: MixerPanelProps) {
  return (
    <Card className="bg-black/60 border-white/20 backdrop-blur-sm">
      <CardHeader className="border-b border-white/10">
        <div className="flex items-center gap-3">
          <img 
            src="/assets/generated/knob-set.dim_512x512.png" 
            alt="Mixer" 
            className="w-8 h-8 opacity-70"
          />
          <CardTitle className="text-white">Mixer</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* Channel Strips */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {channels.map((channel, index) => (
            <div key={index} className="space-y-3">
              <Label className="text-white text-xs font-semibold">{channel.name}</Label>
              
              <div className="h-32 flex items-end">
                <Slider
                  value={[channel.volume * 100]}
                  onValueChange={([value]) => onChannelChange(index, { volume: value / 100 })}
                  min={0}
                  max={100}
                  step={1}
                  orientation="vertical"
                  className="h-full cursor-pointer"
                />
              </div>
              
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant={channel.muted ? 'destructive' : 'outline'}
                  onClick={() => onChannelChange(index, { muted: !channel.muted })}
                  className="flex-1 h-8 text-xs"
                >
                  M
                </Button>
                <Button
                  size="sm"
                  variant={channel.solo ? 'default' : 'outline'}
                  onClick={() => onChannelChange(index, { solo: !channel.solo })}
                  className={`flex-1 h-8 text-xs ${channel.solo ? 'bg-amber-600 hover:bg-amber-700' : ''}`}
                >
                  S
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Master Volume */}
        <div className="pt-4 border-t border-white/10">
          <div className="flex items-center gap-4">
            <Volume2 className="w-5 h-5 text-amber-500" />
            <div className="flex-1 space-y-2">
              <Label className="text-white text-sm">Master Volume</Label>
              <Slider
                value={[masterVolume * 100]}
                onValueChange={([value]) => onMasterVolumeChange(value / 100)}
                min={0}
                max={100}
                step={1}
                className="cursor-pointer"
              />
            </div>
            <span className="text-white text-sm font-mono w-12 text-right">
              {Math.round(masterVolume * 100)}%
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
