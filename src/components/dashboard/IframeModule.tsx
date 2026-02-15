import { useState } from "react";
import { Loader2, ExternalLink, Maximize2, Minimize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface IframeModuleProps {
  src: string;
  title: string;
  className?: string;
}

const IframeModule = ({ src, title, className }: IframeModuleProps) => {
  const [loading, setLoading] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);

  return (
    <div className={cn(
      "relative rounded-2xl overflow-hidden border border-border bg-card transition-all duration-300",
      fullscreen ? "fixed inset-4 z-50 shadow-2xl" : "w-full",
      className
    )}>
      {fullscreen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm -z-10" onClick={() => setFullscreen(false)} />
      )}

      <div className="flex items-center justify-between px-4 py-2 bg-muted/50 border-b border-border">
        <span className="text-sm font-medium text-foreground">{title}</span>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setFullscreen(!fullscreen)}>
            {fullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" asChild>
            <a href={src} target="_blank" rel="noopener noreferrer"><ExternalLink size={14} /></a>
          </Button>
        </div>
      </div>

      {loading && (
        <div className="absolute inset-0 top-10 flex items-center justify-center bg-card">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      )}

      <iframe
        src={src}
        title={title}
        className={cn("w-full border-0", fullscreen ? "h-[calc(100%-40px)]" : "h-[600px]")}
        onLoad={() => setLoading(false)}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope"
      />
    </div>
  );
};

export default IframeModule;
