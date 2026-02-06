import { useState, useEffect } from 'react';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile, useSaveCallerUserProfile } from './hooks/useQueries';
import LoginButton from './features/auth/LoginButton';
import TransportBar from './features/studio/TransportBar';
import MixerPanel from './features/studio/MixerPanel';
import InstrumentPanel from './features/studio/InstrumentPanel';
import CompositionManager from './features/studio/CompositionManager';
import YouTubePlayer from './features/studio/YouTubePlayer';
import AmpPanel from './features/studio/AmpPanel';
import ComposerScreen from './features/composer/ComposerScreen';
import { useAudioEngine } from './audio/useAudioEngine';
import type { CompositionState } from './audio/audioTypes';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Music2 } from 'lucide-react';

export default function App() {
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;
  
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
  const saveProfile = useSaveCallerUserProfile();
  
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const [profileName, setProfileName] = useState('');
  const [showComposer, setShowComposer] = useState(false);
  const [showDiscardDialog, setShowDiscardDialog] = useState(false);
  const [composerSnapshot, setComposerSnapshot] = useState<CompositionState | null>(null);

  // Audio engine and composition state
  const [composition, setComposition] = useState<CompositionState>({
    tempo: 120,
    masterVolume: 0.7,
    channels: [
      { name: 'Kick', volume: 0.8, muted: false, solo: false },
      { name: 'Snare', volume: 0.7, muted: false, solo: false },
      { name: 'HiHat', volume: 0.6, muted: false, solo: false },
      { name: 'Bass', volume: 0.6, muted: false, solo: false },
      { name: 'Synth', volume: 0.5, muted: false, solo: false },
      { name: 'Piano', volume: 0.5, muted: false, solo: false },
      { name: 'Guitar', volume: 0.5, muted: false, solo: false },
      { name: 'Strings', volume: 0.4, muted: false, solo: false },
    ],
    drumPattern: Array(16).fill([false, false, false]),
    bassNotes: Array(16).fill(null),
    synthNotes: Array(16).fill(null),
    pianoNotes: Array(16).fill(null),
    guitarNotes: Array(16).fill(null),
    stringsNotes: Array(16).fill(null),
    guitarAmp: {
      drive: 0.5,
      bass: 0.5,
      mid: 0.5,
      treble: 0.5,
      presence: 0.5,
      master: 0.7,
    },
    pianoRollNotes: [],
    timelineLength: 16,
    importedAudio: null,
  });

  const audioEngine = useAudioEngine(composition);

  // Check if profile setup is needed
  useEffect(() => {
    if (isAuthenticated && !profileLoading && isFetched && userProfile === null) {
      setShowProfileSetup(true);
    }
  }, [isAuthenticated, profileLoading, isFetched, userProfile]);

  const handleSaveProfile = async () => {
    if (profileName.trim()) {
      await saveProfile.mutateAsync({ name: profileName.trim() });
      setShowProfileSetup(false);
    }
  };

  const handleOpenComposer = () => {
    setComposerSnapshot(JSON.parse(JSON.stringify(composition)));
    setShowComposer(true);
  };

  const handleCloseComposer = () => {
    const hasChanges = JSON.stringify(composition) !== JSON.stringify(composerSnapshot);
    if (hasChanges) {
      setShowDiscardDialog(true);
    } else {
      setShowComposer(false);
      setComposerSnapshot(null);
    }
  };

  const handleDiscardChanges = () => {
    if (composerSnapshot) {
      setComposition(composerSnapshot);
    }
    setShowDiscardDialog(false);
    setShowComposer(false);
    setComposerSnapshot(null);
  };

  const handleKeepChanges = () => {
    setShowDiscardDialog(false);
    setShowComposer(false);
    setComposerSnapshot(null);
  };

  if (showComposer) {
    return (
      <>
        <ComposerScreen
          composition={composition}
          onCompositionChange={setComposition}
          onClose={handleCloseComposer}
          audioEngine={audioEngine}
        />
        <AlertDialog open={showDiscardDialog} onOpenChange={setShowDiscardDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
              <AlertDialogDescription>
                You have unsaved changes in the composer. Do you want to keep or discard them?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={handleDiscardChanges}>Discard Changes</AlertDialogCancel>
              <AlertDialogAction onClick={handleKeepChanges}>Keep Changes</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    );
  }

  return (
    <div 
      className="min-h-screen bg-cover bg-center bg-no-repeat relative"
      style={{ backgroundImage: 'url(/assets/generated/studio-bg.dim_1920x1080.png)' }}
    >
      {/* Dark overlay for better contrast */}
      <div className="absolute inset-0 bg-black/70" />
      
      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className="border-b border-white/10 bg-black/40 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center font-bold text-xl">
                J
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">J Music App</h1>
                <p className="text-xs text-gray-400">Studio Composer with YouTube</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {isAuthenticated && userProfile && (
                <span className="text-sm text-gray-300">Welcome, {userProfile.name}</span>
              )}
              <LoginButton />
            </div>
          </div>
        </header>

        {/* Main Studio */}
        <main className="flex-1 container mx-auto px-4 py-6 space-y-6">
          {/* YouTube Player */}
          <YouTubePlayer />

          {/* Transport Bar with Composer Button */}
          <div className="flex gap-4 items-center">
            <div className="flex-1">
              <TransportBar
                isPlaying={audioEngine.isPlaying}
                onPlayPause={audioEngine.togglePlayback}
                tempo={composition.tempo}
                onTempoChange={(tempo) => setComposition({ ...composition, tempo })}
              />
            </div>
            <Button
              onClick={handleOpenComposer}
              className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-semibold px-6"
            >
              <Music2 className="w-5 h-5 mr-2" />
              Open Composer
            </Button>
          </div>

          {/* Studio Layout */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Mixer Panel */}
            <MixerPanel
              channels={composition.channels}
              masterVolume={composition.masterVolume}
              onChannelChange={(index, updates) => {
                const newChannels = [...composition.channels];
                newChannels[index] = { ...newChannels[index], ...updates };
                setComposition({ ...composition, channels: newChannels });
              }}
              onMasterVolumeChange={(volume) => 
                setComposition({ ...composition, masterVolume: volume })
              }
            />

            {/* Instrument Panel */}
            <InstrumentPanel
              drumPattern={composition.drumPattern}
              bassNotes={composition.bassNotes}
              synthNotes={composition.synthNotes}
              pianoNotes={composition.pianoNotes}
              guitarNotes={composition.guitarNotes}
              stringsNotes={composition.stringsNotes}
              currentStep={audioEngine.currentStep}
              onDrumPatternChange={(pattern) => 
                setComposition({ ...composition, drumPattern: pattern })
              }
              onBassNotesChange={(notes) => 
                setComposition({ ...composition, bassNotes: notes })
              }
              onSynthNotesChange={(notes) => 
                setComposition({ ...composition, synthNotes: notes })
              }
              onPianoNotesChange={(notes) => 
                setComposition({ ...composition, pianoNotes: notes })
              }
              onGuitarNotesChange={(notes) => 
                setComposition({ ...composition, guitarNotes: notes })
              }
              onStringsNotesChange={(notes) => 
                setComposition({ ...composition, stringsNotes: notes })
              }
            />
          </div>

          {/* Amp Panel */}
          <AmpPanel
            settings={composition.guitarAmp}
            onSettingsChange={(guitarAmp) => setComposition({ ...composition, guitarAmp })}
          />

          {/* Composition Manager */}
          {isAuthenticated && userProfile && (
            <CompositionManager
              composition={composition}
              onLoadComposition={setComposition}
            />
          )}
        </main>

        {/* Footer */}
        <footer className="border-t border-white/10 bg-black/40 backdrop-blur-sm py-4">
          <div className="container mx-auto px-4 text-center text-sm text-gray-400">
            © 2026. Built with ❤️ using{' '}
            <a 
              href="https://caffeine.ai" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-amber-500 hover:text-amber-400 transition-colors"
            >
              caffeine.ai
            </a>
          </div>
        </footer>
      </div>

      {/* Profile Setup Dialog */}
      <Dialog open={showProfileSetup} onOpenChange={setShowProfileSetup}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Welcome to J Music App</DialogTitle>
            <DialogDescription>
              Please enter your name to get started with composing music.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Your Name</Label>
              <Input
                id="name"
                placeholder="Enter your name"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSaveProfile()}
              />
            </div>
            <Button 
              onClick={handleSaveProfile} 
              disabled={!profileName.trim() || saveProfile.isPending}
              className="w-full"
            >
              {saveProfile.isPending ? 'Saving...' : 'Continue'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
