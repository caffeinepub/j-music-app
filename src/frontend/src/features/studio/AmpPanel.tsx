import { RotateCcw } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import type { GuitarAmpSettings } from '../../audio/audioTypes';

interface AmpPanelProps {
  settings: GuitarAmpSettings;
  onSettingsChange: (settings: GuitarAmpSettings) => void;
}

const defaultSettings: GuitarAmpSettings = {
  drive: 0.5,
  bass: 0.5,
  mid: 0.5,
  treble: 0.5,
  presence: 0.5,
  master: 0.7,
};

export default function AmpPanel({ settings, onSettingsChange }: AmpPanelProps) {
  const handleReset = () => {
    onSettingsChange(defaultSettings);
  };

  const knobs = [
    { label: 'Drive', key: 'drive' as keyof GuitarAmpSettings, color: 'from-red-600 to-orange-600' },
    { label: 'Bass', key: 'bass' as keyof GuitarAmpSettings, color: 'from-blue-600 to-cyan-600' },
    { label: 'Mid', key: 'mid' as keyof GuitarAmpSettings, color: 'from-green-600 to-emerald-600' },
    { label: 'Treble', key: 'treble' as keyof GuitarAmpSettings, color: 'from-yellow-600 to-amber-600' },
    { label: 'Presence', key: 'presence' as keyof GuitarAmpSettings, color: 'from-purple-600 to-pink-600' },
    { label: 'Master', key: 'master' as keyof GuitarAmpSettings, color: 'from-amber-600 to-orange-600' },
  ];

  return (
    <Card 
      className="bg-black/60 border-white/20 backdrop-blur-sm bg-cover bg-center"
      style={{ backgroundImage: 'url(/assets/generated/knob-set.dim_512x512.png)' }}
    >
      <div className="bg-gradient-to-b from-black/80 to-black/60 backdrop-blur-sm">
        <CardHeader className="border-b border-white/10">
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2 font-bold text-xl">
              <div className="w-8 h-8 rounded bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-sm">
                🎸
              </div>
              Guitar Amp Controls
            </CardTitle>
            <Button
              onClick={handleReset}
              variant="outline"
              size="sm"
              className="bg-white/10 border-white/20 hover:bg-white/20 text-white"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {knobs.map(({ label, key, color }) => (
              <div key={key} className="space-y-3">
                <div className="flex flex-col items-center">
                  <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${color} shadow-lg flex items-center justify-center relative`}>
                    <div className="absolute inset-2 rounded-full bg-black/40 flex items-center justify-center">
                      <div 
                        className="w-1 h-8 bg-white rounded-full"
                        style={{
                          transform: `rotate(${(settings[key] - 0.5) * 270}deg)`,
                          transformOrigin: 'center bottom',
                        }}
                      />
                    </div>
                    <div className="absolute bottom-1 text-xs font-bold text-white/80">
                      {Math.round(settings[key] * 10)}
                    </div>
                  </div>
                  <Label className="text-white font-semibold mt-2 text-center uppercase text-xs tracking-wider">
                    {label}
                  </Label>
                </div>
                <Slider
                  value={[settings[key]]}
                  onValueChange={([value]) => onSettingsChange({ ...settings, [key]: value })}
                  min={0}
                  max={1}
                  step={0.01}
                  className="w-full"
                />
              </div>
            ))}
          </div>
        </CardContent>
      </div>
    </Card>
  );
}
