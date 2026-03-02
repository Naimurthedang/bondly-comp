import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, MessageCircle, Share2, Play, TrendingUp, Compass, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

interface VideoItem {
  id: string;
  title: string;
  description: string;
  file_url: string;
  thumbnail_url: string;
  ai_tags: string[];
  duration_seconds: number;
  created_at: string;
  parent_id: string;
  score?: number;
  likes: number;
  views: number;
  comments: number;
}

const DECAY_LAMBDA = 0.05;

const calculateScore = (video: VideoItem): number => {
  const engagement = (video.likes * 3) + (video.comments * 2) + (video.views * 0.1);
  const recencyHours = (Date.now() - new Date(video.created_at).getTime()) / 3600000;
  const recencyScore = Math.exp(-DECAY_LAMBDA * recencyHours);
  return (engagement * 0.35) + (recencyScore * 100 * 0.35) + (video.views * 0.15) + ((video.ai_tags?.length || 0) * 5 * 0.15);
};

const VideoCard = ({ video }: { video: VideoItem }) => (
  <Card className="overflow-hidden group cursor-pointer hover:shadow-xl transition-all duration-300 border-0 glass-card">
    <div className="relative aspect-video bg-muted">
      {video.thumbnail_url ? (
        <img src={video.thumbnail_url} alt={video.title || "Video"} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20">
          <Play size={48} className="text-primary/50" />
        </div>
      )}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
        <Play size={48} className="text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" />
      </div>
      {video.duration_seconds && (
        <span className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded">
          {Math.floor(video.duration_seconds / 60)}:{String(video.duration_seconds % 60).padStart(2, "0")}
        </span>
      )}
    </div>
    <CardContent className="p-4">
      <h3 className="font-display font-bold text-sm text-foreground line-clamp-2 mb-2">{video.title || "Untitled"}</h3>
      {video.ai_tags?.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {video.ai_tags.slice(0, 3).map((tag: string) => (
            <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
          ))}
        </div>
      )}
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1"><Heart size={12} /> {video.likes}</span>
        <span className="flex items-center gap-1"><MessageCircle size={12} /> {video.comments}</span>
        <span className="flex items-center gap-1"><Share2 size={12} /> {video.views} views</span>
      </div>
    </CardContent>
  </Card>
);

const VideoFeed = () => {
  const { user } = useAuth();
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("foryou");

  useEffect(() => {
    const fetchVideos = async () => {
      setLoading(true);
      const { data: content } = await supabase
        .from("baby_content")
        .select("*")
        .eq("content_type", "video")
        .eq("privacy_level", "public")
        .order("created_at", { ascending: false })
        .limit(50);

      if (!content?.length) { setVideos([]); setLoading(false); return; }

      const contentIds = content.map(c => c.id);
      const { data: interactions } = await supabase
        .from("video_interactions")
        .select("content_id, interaction_type")
        .in("content_id", contentIds);

      const statsMap: Record<string, { likes: number; views: number; comments: number }> = {};
      interactions?.forEach(i => {
        if (!statsMap[i.content_id]) statsMap[i.content_id] = { likes: 0, views: 0, comments: 0 };
        if (i.interaction_type === "like") statsMap[i.content_id].likes++;
        if (i.interaction_type === "view") statsMap[i.content_id].views++;
        if (i.interaction_type === "comment") statsMap[i.content_id].comments++;
      });

      const enriched: VideoItem[] = content.map(c => ({
        ...c,
        ai_tags: (c.ai_tags as string[]) || [],
        likes: statsMap[c.id]?.likes || 0,
        views: statsMap[c.id]?.views || 0,
        comments: statsMap[c.id]?.comments || 0,
      }));

      enriched.forEach(v => { v.score = calculateScore(v); });
      setVideos(enriched);
      setLoading(false);
    };
    fetchVideos();
  }, []);

  const sortedByScore = [...videos].sort((a, b) => (b.score || 0) - (a.score || 0));
  const trending = [...videos].sort((a, b) => (b.likes + b.comments) - (a.likes + a.comments));
  const latest = [...videos].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const getVideos = () => {
    if (tab === "trending") return trending;
    if (tab === "explore") return latest;
    return sortedByScore;
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">Baby Moments</h1>
            <p className="text-muted-foreground mt-1">Discover heartwarming family content</p>
          </div>
          {user && (
            <Button asChild><Link to="/dashboard">Upload Content</Link></Button>
          )}
        </div>

        <Tabs value={tab} onValueChange={setTab} className="mb-8">
          <TabsList>
            <TabsTrigger value="foryou" className="gap-1.5"><Sparkles size={14} /> For You</TabsTrigger>
            <TabsTrigger value="trending" className="gap-1.5"><TrendingUp size={14} /> Trending</TabsTrigger>
            <TabsTrigger value="explore" className="gap-1.5"><Compass size={14} /> Explore</TabsTrigger>
          </TabsList>
        </Tabs>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : videos.length === 0 ? (
          <div className="text-center py-20">
            <Play size={48} className="mx-auto text-muted-foreground/30 mb-4" />
            <h3 className="font-display text-xl font-bold text-foreground mb-2">No videos yet</h3>
            <p className="text-muted-foreground mb-4">Be the first to share a family moment!</p>
            {user && <Button asChild><Link to="/dashboard">Upload</Link></Button>}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {getVideos().map(v => <VideoCard key={v.id} video={v} />)}
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoFeed;
