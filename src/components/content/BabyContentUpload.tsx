import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, Image, Video, Award, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Props {
  babyId: string;
  onSuccess?: () => void;
}

export const BabyContentUpload = ({ babyId, onSuccess }: Props) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [contentType, setContentType] = useState<string>("photo");
  const [privacyLevel, setPrivacyLevel] = useState<string>("private");
  const [uploading, setUploading] = useState(false);

  const handleUpload = async () => {
    if (!user || !file) return;
    setUploading(true);

    try {
      const ext = file.name.split(".").pop();
      const path = `${user.id}/public/${Date.now()}.${ext}`;

      const { error: uploadErr } = await supabase.storage
        .from("baby-content")
        .upload(path, file, { upsert: false });

      if (uploadErr) throw uploadErr;

      const { data: urlData } = supabase.storage.from("baby-content").getPublicUrl(path);

      const { error: insertErr } = await supabase.from("baby_content").insert({
        baby_id: babyId,
        parent_id: user.id,
        content_type: contentType,
        title,
        description,
        file_url: urlData.publicUrl,
        privacy_level: privacyLevel,
      });

      if (insertErr) throw insertErr;

      toast({ title: "Uploaded!", description: "Your content has been saved." });
      setFile(null);
      setTitle("");
      setDescription("");
      onSuccess?.();
    } catch (err: any) {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const icons = { photo: <Image size={16} />, video: <Video size={16} />, milestone: <Award size={16} /> };

  return (
    <Card className="glass-card border-0">
      <CardHeader>
        <CardTitle className="font-display flex items-center gap-2">
          <Upload size={20} /> Upload Content
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Type</Label>
            <Select value={contentType} onValueChange={setContentType}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="photo">📷 Photo</SelectItem>
                <SelectItem value="video">🎬 Video</SelectItem>
                <SelectItem value="milestone">🏆 Milestone</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Privacy</Label>
            <Select value={privacyLevel} onValueChange={setPrivacyLevel}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="private">🔒 Private</SelectItem>
                <SelectItem value="friends">👥 Friends</SelectItem>
                <SelectItem value="public">🌍 Public</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Title</Label>
          <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="First steps!" />
        </div>

        <div className="space-y-2">
          <Label>Description</Label>
          <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe the moment..." rows={2} />
        </div>

        <div className="space-y-2">
          <Label>File</Label>
          <Input type="file" accept="image/*,video/*" onChange={e => setFile(e.target.files?.[0] || null)} />
        </div>

        <Button onClick={handleUpload} disabled={uploading || !file} className="w-full rounded-full">
          {uploading ? <><Loader2 size={16} className="animate-spin mr-2" /> Uploading...</> : "Upload"}
        </Button>
      </CardContent>
    </Card>
  );
};
