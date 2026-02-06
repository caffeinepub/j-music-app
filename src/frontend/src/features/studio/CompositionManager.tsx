import { useState } from 'react';
import { Save, Trash2, Music } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  useListCompositions, 
  useSaveComposition, 
  useLoadComposition, 
  useDeleteComposition 
} from '../../hooks/useCompositions';
import type { CompositionState } from '../../audio/audioTypes';

interface CompositionManagerProps {
  composition: CompositionState;
  onLoadComposition: (composition: CompositionState) => void;
}

export default function CompositionManager({ composition, onLoadComposition }: CompositionManagerProps) {
  const [compositionName, setCompositionName] = useState('');
  
  const { data: compositions = [], isLoading } = useListCompositions();
  const saveComposition = useSaveComposition();
  const loadComposition = useLoadComposition();
  const deleteComposition = useDeleteComposition();

  const handleSave = async () => {
    if (compositionName.trim()) {
      await saveComposition.mutateAsync({
        name: compositionName.trim(),
        composition,
      });
      setCompositionName('');
    }
  };

  const handleLoad = async (id: bigint) => {
    const loaded = await loadComposition.mutateAsync(id);
    onLoadComposition(loaded);
  };

  const handleDelete = async (id: bigint) => {
    if (confirm('Are you sure you want to delete this composition?')) {
      await deleteComposition.mutateAsync(id);
    }
  };

  return (
    <Card className="bg-black/60 border-white/20 backdrop-blur-sm">
      <CardHeader className="border-b border-white/10">
        <CardTitle className="text-white flex items-center gap-2">
          <Music className="w-5 h-5" />
          My Compositions
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        {/* Save New */}
        <div className="space-y-2">
          <Label className="text-white text-sm">Save Current Composition</Label>
          <div className="flex gap-2">
            <Input
              placeholder="Composition name..."
              value={compositionName}
              onChange={(e) => setCompositionName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              className="bg-white/5 border-white/20 text-white placeholder:text-gray-500"
            />
            <Button
              onClick={handleSave}
              disabled={!compositionName.trim() || saveComposition.isPending}
              className="bg-amber-600 hover:bg-amber-700"
            >
              <Save className="w-4 h-4 mr-2" />
              {saveComposition.isPending ? 'Saving...' : 'Save'}
            </Button>
          </div>
          <p className="text-xs text-gray-400">
            Saves all studio settings, amp controls, piano roll notes, and imported audio
          </p>
        </div>

        {/* Saved Compositions */}
        <div className="space-y-2">
          <Label className="text-white text-sm">Saved Compositions</Label>
          {isLoading ? (
            <div className="text-gray-400 text-sm py-4 text-center">Loading...</div>
          ) : compositions.length === 0 ? (
            <div className="text-gray-400 text-sm py-4 text-center">
              No saved compositions yet
            </div>
          ) : (
            <ScrollArea className="h-48 rounded-md border border-white/10 bg-white/5 p-2">
              <div className="space-y-2">
                {compositions.map(([name, id]) => (
                  <div
                    key={id.toString()}
                    className="flex items-center justify-between p-2 rounded bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    <span className="text-white text-sm">{name}</span>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleLoad(id)}
                        disabled={loadComposition.isPending}
                        className="h-8"
                      >
                        Load
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(id)}
                        disabled={deleteComposition.isPending}
                        className="h-8"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
