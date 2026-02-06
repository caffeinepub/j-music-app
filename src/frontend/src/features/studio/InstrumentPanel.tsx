import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';

interface InstrumentPanelProps {
  drumPattern: boolean[][];
  bassNotes: (number | null)[];
  synthNotes: (number | null)[];
  pianoNotes: (number | null)[];
  guitarNotes: (number | null)[];
  stringsNotes: (number | null)[];
  currentStep: number;
  onDrumPatternChange: (pattern: boolean[][]) => void;
  onBassNotesChange: (notes: (number | null)[]) => void;
  onSynthNotesChange: (notes: (number | null)[]) => void;
  onPianoNotesChange: (notes: (number | null)[]) => void;
  onGuitarNotesChange: (notes: (number | null)[]) => void;
  onStringsNotesChange: (notes: (number | null)[]) => void;
}

const DRUM_NAMES = ['Kick', 'Snare', 'HiHat'];
const BASS_NOTES = [36, 38, 40, 41, 43, 45, 47, 48]; // Low notes for bass
const SYNTH_NOTES = [60, 62, 64, 65, 67, 69, 71, 72]; // C major scale
const PIANO_NOTES = [60, 62, 64, 65, 67, 69, 71, 72]; // C major scale
const GUITAR_NOTES = [64, 66, 67, 69, 71, 72, 74, 76]; // E major scale
const STRINGS_NOTES = [60, 62, 64, 65, 67, 69, 71, 72]; // C major scale

const NOTE_NAMES = ['C', 'D', 'E', 'F', 'G', 'A', 'B', 'C'];
const BASS_NOTE_NAMES = ['C', 'D', 'E', 'F', 'G', 'A', 'B', 'C'];
const GUITAR_NOTE_NAMES = ['E', 'F#', 'G', 'A', 'B', 'C', 'D', 'E'];

export default function InstrumentPanel({
  drumPattern,
  bassNotes,
  synthNotes,
  pianoNotes,
  guitarNotes,
  stringsNotes,
  currentStep,
  onDrumPatternChange,
  onBassNotesChange,
  onSynthNotesChange,
  onPianoNotesChange,
  onGuitarNotesChange,
  onStringsNotesChange,
}: InstrumentPanelProps) {
  const toggleDrumStep = (step: number, drum: number) => {
    const newPattern = drumPattern.map((s, i) => 
      i === step ? s.map((d, j) => j === drum ? !d : d) : s
    );
    onDrumPatternChange(newPattern);
  };

  const toggleNoteStep = (
    step: number, 
    note: number, 
    currentNotes: (number | null)[], 
    onChange: (notes: (number | null)[]) => void
  ) => {
    const newNotes = [...currentNotes];
    newNotes[step] = newNotes[step] === note ? null : note;
    onChange(newNotes);
  };

  const renderNoteGrid = (
    notes: number[],
    noteNames: string[],
    currentNotes: (number | null)[],
    onChange: (notes: (number | null)[]) => void,
    color: string = 'amber'
  ) => (
    <div className="space-y-2">
      <div className="grid grid-cols-8 gap-2 mb-4">
        {noteNames.map((name, i) => (
          <div key={i} className="text-center text-white text-xs">
            {name}
          </div>
        ))}
      </div>
      {notes.map((note) => (
        <div key={note} className="grid grid-cols-16 gap-1">
          {Array.from({ length: 16 }).map((_, step) => (
            <Button
              key={step}
              size="sm"
              variant={currentNotes[step] === note ? 'default' : 'outline'}
              onClick={() => toggleNoteStep(step, note, currentNotes, onChange)}
              className={`h-8 p-0 ${
                currentNotes[step] === note 
                  ? `bg-${color}-600 hover:bg-${color}-700` 
                  : 'bg-white/5 hover:bg-white/10'
              } ${
                currentStep === step ? `ring-2 ring-${color}-400` : ''
              }`}
            />
          ))}
        </div>
      ))}
    </div>
  );

  return (
    <Card className="bg-black/60 border-white/20 backdrop-blur-sm">
      <CardHeader className="border-b border-white/10">
        <div className="flex items-center gap-3">
          <img 
            src="/assets/generated/drum-pads.dim_512x512.png" 
            alt="Instruments" 
            className="w-8 h-8 opacity-70"
          />
          <CardTitle className="text-white">All Instruments</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <Tabs defaultValue="drums" className="w-full">
          <ScrollArea className="w-full">
            <TabsList className="grid w-full grid-cols-6 bg-white/5 mb-4">
              <TabsTrigger value="drums">Drums</TabsTrigger>
              <TabsTrigger value="bass">Bass</TabsTrigger>
              <TabsTrigger value="synth">Synth</TabsTrigger>
              <TabsTrigger value="piano">Piano</TabsTrigger>
              <TabsTrigger value="guitar">Guitar</TabsTrigger>
              <TabsTrigger value="strings">Strings</TabsTrigger>
            </TabsList>
          </ScrollArea>

          <TabsContent value="drums" className="space-y-4 mt-4">
            {DRUM_NAMES.map((name, drumIndex) => (
              <div key={drumIndex} className="space-y-2">
                <div className="text-white text-xs font-semibold">{name}</div>
                <div className="grid grid-cols-16 gap-1">
                  {Array.from({ length: 16 }).map((_, step) => (
                    <Button
                      key={step}
                      size="sm"
                      variant={drumPattern[step]?.[drumIndex] ? 'default' : 'outline'}
                      onClick={() => toggleDrumStep(step, drumIndex)}
                      className={`h-10 p-0 ${
                        drumPattern[step]?.[drumIndex] 
                          ? 'bg-amber-600 hover:bg-amber-700' 
                          : 'bg-white/5 hover:bg-white/10'
                      } ${
                        currentStep === step ? 'ring-2 ring-amber-400' : ''
                      }`}
                    />
                  ))}
                </div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="bass" className="space-y-4 mt-4">
            <div className="text-white text-xs font-semibold mb-2">Bass Line (Low Notes)</div>
            {renderNoteGrid(BASS_NOTES, BASS_NOTE_NAMES, bassNotes, onBassNotesChange, 'blue')}
          </TabsContent>

          <TabsContent value="synth" className="space-y-4 mt-4">
            <div className="text-white text-xs font-semibold mb-2">Synth Melody (C Major)</div>
            {renderNoteGrid(SYNTH_NOTES, NOTE_NAMES, synthNotes, onSynthNotesChange, 'amber')}
          </TabsContent>

          <TabsContent value="piano" className="space-y-4 mt-4">
            <div className="text-white text-xs font-semibold mb-2">Piano (C Major)</div>
            {renderNoteGrid(PIANO_NOTES, NOTE_NAMES, pianoNotes, onPianoNotesChange, 'purple')}
          </TabsContent>

          <TabsContent value="guitar" className="space-y-4 mt-4">
            <div className="text-white text-xs font-semibold mb-2">Guitar (E Major)</div>
            {renderNoteGrid(GUITAR_NOTES, GUITAR_NOTE_NAMES, guitarNotes, onGuitarNotesChange, 'green')}
          </TabsContent>

          <TabsContent value="strings" className="space-y-4 mt-4">
            <div className="text-white text-xs font-semibold mb-2">Strings (C Major)</div>
            {renderNoteGrid(STRINGS_NOTES, NOTE_NAMES, stringsNotes, onStringsNotesChange, 'pink')}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
