import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Music2 } from 'lucide-react';

export default function YouTubePlayer() {
  const [searchQuery, setSearchQuery] = useState('');
  const [videoId, setVideoId] = useState('');

  const extractVideoId = (url: string): string | null => {
    // Handle various YouTube URL formats
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /^([a-zA-Z0-9_-]{11})$/
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  };

  const handleSearch = () => {
    if (!searchQuery.trim()) return;

    const extractedId = extractVideoId(searchQuery.trim());
    if (extractedId) {
      setVideoId(extractedId);
    } else {
      // If not a URL, treat as search query and open YouTube search
      const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(searchQuery)}`;
      window.open(searchUrl, '_blank');
    }
  };

  return (
    <Card className="bg-black/60 border-white/20 backdrop-blur-sm">
      <CardHeader className="border-b border-white/10">
        <div className="flex items-center gap-3">
          <Music2 className="w-6 h-6 text-amber-500" />
          <CardTitle className="text-white">YouTube Music Player</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Paste YouTube URL or video ID, or search for a song..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="flex-1 bg-white/5 border-white/20 text-white placeholder:text-gray-400"
          />
          <Button
            onClick={handleSearch}
            className="bg-amber-600 hover:bg-amber-700"
          >
            <Search className="w-4 h-4 mr-2" />
            Search
          </Button>
        </div>

        {videoId ? (
          <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
            <iframe
              className="absolute top-0 left-0 w-full h-full rounded-lg"
              src={`https://www.youtube.com/embed/${videoId}?autoplay=0`}
              title="YouTube video player"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : (
          <div className="w-full aspect-video bg-white/5 rounded-lg flex items-center justify-center border border-white/10">
            <div className="text-center text-gray-400">
              <Music2 className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Enter a YouTube URL or search for a song</p>
              <p className="text-xs mt-1">You can paste a full URL, video ID, or search term</p>
            </div>
          </div>
        )}

        <div className="text-xs text-gray-400 space-y-1">
          <p>• Paste a YouTube URL (e.g., https://youtube.com/watch?v=...)</p>
          <p>• Enter a video ID (e.g., dQw4w9WgXcQ)</p>
          <p>• Search for any song to open YouTube search in a new tab</p>
        </div>
      </CardContent>
    </Card>
  );
}
