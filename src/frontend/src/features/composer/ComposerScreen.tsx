import { useState } from 'react';
import { X, Play, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PianoRoll from './PianoRoll';
import AudioTrack from './AudioTrack';
import type { CompositionState } from '../../audio/audioTypes';

interface ComposerScreenProps {
  composition: CompositionState;
  onCompositionChange: (composition: CompositionState) => void;
  onClose: () => void;
  audioEngine: {
    isPlaying: boolean;
    currentStep: number;
    togglePlayback: () => void;
  };
}

export default function ComposerScreen({
  composition,
  onCompositionChange,
  onClose,
  audioEngine,
}: ComposerScreenProps) {
  const [activeTab, setActiveTab] = useState('piano-roll');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/60 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <img 
                src="/assets/generated/app-logo.dim_512x512.png" 
                alt="J Music App Logo" 
                className="w-10 h-10 rounded-lg object-cover"
              />
              <div>
                <h1 className="text-xl font-bold text-white">Music Composer</h1>
                <p className="text-xs text-gray-400">Advanced Timeline Editor</p>
              </div>
            </div>
            <Button
              onClick={audioEngine.togglePlayback}
              variant="outline"
              size="sm"
              className="bg-white/10 border-white/20 hover:bg-white/20 text-white"
            >
              {audioEngine.isPlaying ? (
                <>
                  <Pause className="w-4 h-4 mr-2" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Play
                </>
              )}
            </Button>
          </div>
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/10"
          >
            <X className="w-5 h-5 mr-2" />
            Close Composer
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <Card className="bg-black/60 border-white/20 backdrop-blur-sm">
          <CardHeader className="border-b border-white/10">
            <CardTitle className="text-white">Composition Tools</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="piano-roll">Piano Roll</TabsTrigger>
                <TabsTrigger value="audio-import">Audio Import</TabsTrigger>
              </TabsList>
              
              <TabsContent value="piano-roll" className="space-y-4">
                <PianoRoll
                  composition={composition}
                  onCompositionChange={onCompositionChange}
                  currentStep={audioEngine.currentStep}
                  isPlaying={audioEngine.isPlaying}
                />
              </TabsContent>
              
              <TabsContent value="audio-import" className="space-y-4">
                <AudioTrack
                  composition={composition}
                  onCompositionChange={onCompositionChange}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
