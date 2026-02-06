import { useState, useRef, useEffect } from 'react';
import { Plus, Trash2, ZoomIn, ZoomOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Label } from '@/components/ui/label';
import type { CompositionState, PianoRollNote } from '../../audio/audioTypes';

interface PianoRollProps {
  composition: CompositionState;
  onCompositionChange: (composition: CompositionState) => void;
  currentStep: number;
  isPlaying: boolean;
}

const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const OCTAVES = [2, 3, 4, 5, 6];
const TRACKS = ['Kick', 'Snare', 'HiHat', 'Bass', 'Synth', 'Piano', 'Guitar', 'Strings'];

export default function PianoRoll({ composition, onCompositionChange, currentStep, isPlaying }: PianoRollProps) {
  const [zoom, setZoom] = useState(1);
  const [selectedNote, setSelectedNote] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ step: number; pitch: number } | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const timelineLength = composition.timelineLength || 16;
  const cellWidth = 40 * zoom;
  const cellHeight = 24;

  const allPitches = OCTAVES.flatMap(octave =>
    NOTES.map((note, idx) => ({
      name: `${note}${octave}`,
      midi: 12 * (octave + 1) + idx,
    }))
  ).reverse();

  const handleAddNote = (step: number, pitch: number) => {
    const newNote: PianoRollNote = {
      id: `${Date.now()}-${Math.random()}`,
      startStep: step,
      duration: 1,
      pitch,
      track: 5, // Default to Piano
    };
    
    onCompositionChange({
      ...composition,
      pianoRollNotes: [...(composition.pianoRollNotes || []), newNote],
    });
  };

  const handleDeleteNote = (noteId: string) => {
    onCompositionChange({
      ...composition,
      pianoRollNotes: (composition.pianoRollNotes || []).filter(n => n.id !== noteId),
    });
    setSelectedNote(null);
  };

  const handleMouseDown = (step: number, pitch: number) => {
    const existingNote = (composition.pianoRollNotes || []).find(
      n => n.startStep === step && n.pitch === pitch
    );
    
    if (existingNote) {
      setSelectedNote(existingNote.id);
    } else {
      setIsDragging(true);
      setDragStart({ step, pitch });
    }
  };

  const handleMouseUp = () => {
    if (isDragging && dragStart) {
      handleAddNote(dragStart.step, dragStart.pitch);
    }
    setIsDragging(false);
    setDragStart(null);
  };

  const handleZoomIn = () => setZoom(Math.min(zoom + 0.25, 2));
  const handleZoomOut = () => setZoom(Math.max(zoom - 0.25, 0.5));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-white text-lg font-semibold">Piano Roll Editor</Label>
        <div className="flex gap-2">
          <Button
            onClick={handleZoomOut}
            variant="outline"
            size="sm"
            className="bg-white/10 border-white/20 hover:bg-white/20 text-white"
          >
            <ZoomOut className="w-4 h-4" />
          </Button>
          <Button
            onClick={handleZoomIn}
            variant="outline"
            size="sm"
            className="bg-white/10 border-white/20 hover:bg-white/20 text-white"
          >
            <ZoomIn className="w-4 h-4" />
          </Button>
          {selectedNote && (
            <Button
              onClick={() => handleDeleteNote(selectedNote)}
              variant="destructive"
              size="sm"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Note
            </Button>
          )}
        </div>
      </div>

      <div className="border border-white/20 rounded-lg bg-black/40 overflow-hidden">
        <ScrollArea className="h-[500px]">
          <div className="flex">
            {/* Piano Keys */}
            <div className="sticky left-0 z-10 bg-black/80 border-r border-white/20">
              {allPitches.map(({ name, midi }) => (
                <div
                  key={midi}
                  className={`px-3 py-1 text-xs font-mono border-b border-white/10 ${
                    name.includes('#') ? 'bg-gray-800 text-gray-400' : 'bg-gray-900 text-white'
                  }`}
                  style={{ height: cellHeight }}
                >
                  {name}
                </div>
              ))}
            </div>

            {/* Grid */}
            <div
              ref={gridRef}
              className="relative"
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              {/* Timeline */}
              <div className="sticky top-0 z-10 bg-black/80 border-b border-white/20 flex">
                {Array.from({ length: timelineLength }).map((_, step) => (
                  <div
                    key={step}
                    className={`border-r border-white/10 text-center text-xs text-gray-400 py-1 ${
                      step === currentStep && isPlaying ? 'bg-amber-600/30' : ''
                    }`}
                    style={{ width: cellWidth }}
                  >
                    {step + 1}
                  </div>
                ))}
              </div>

              {/* Grid Cells */}
              {allPitches.map(({ midi }) => (
                <div key={midi} className="flex">
                  {Array.from({ length: timelineLength }).map((_, step) => (
                    <div
                      key={step}
                      className={`border-r border-b border-white/10 cursor-pointer hover:bg-white/10 transition-colors ${
                        step === currentStep && isPlaying ? 'bg-amber-600/20' : ''
                      } ${step % 4 === 0 ? 'border-r-white/30' : ''}`}
                      style={{ width: cellWidth, height: cellHeight }}
                      onMouseDown={() => handleMouseDown(step, midi)}
                    />
                  ))}
                </div>
              ))}

              {/* Notes */}
              {(composition.pianoRollNotes || []).map(note => {
                const pitchIndex = allPitches.findIndex(p => p.midi === note.pitch);
                if (pitchIndex === -1) return null;

                return (
                  <div
                    key={note.id}
                    className={`absolute rounded bg-gradient-to-r from-amber-500 to-orange-500 border-2 cursor-pointer ${
                      selectedNote === note.id ? 'border-white' : 'border-amber-600'
                    }`}
                    style={{
                      left: note.startStep * cellWidth,
                      top: pitchIndex * cellHeight + 24,
                      width: note.duration * cellWidth - 2,
                      height: cellHeight - 2,
                    }}
                    onClick={() => setSelectedNote(note.id)}
                  />
                );
              })}
            </div>
          </div>
        </ScrollArea>
      </div>

      <div className="text-sm text-gray-400">
        <p>Click on the grid to add notes. Click on a note to select it, then use the Delete button to remove it.</p>
        <p>Timeline length: {timelineLength} steps</p>
      </div>
    </div>
  );
}
