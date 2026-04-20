import { useState, useRef, useEffect } from "react";
import { Radio, X, Minimize2, Maximize2, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";

const RADIO_STREAM_ID = "jfKfPfyJRdk"; // lofi hip hop radio - beats to relax/study to

export default function FloatingRadio() {
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(true);
  const [muted, setMuted] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Persist mute state
  useEffect(() => {
    if (iframeRef.current?.contentWindow) {
      try {
        iframeRef.current.contentWindow.postMessage(
          JSON.stringify({
            event: "command",
            func: muted ? "mute" : "unMute",
          }),
          "*"
        );
      } catch {}
    }
  }, [muted]);

  if (!open) {
    return (
      <Button
        onClick={() => setOpen(true)}
        className="fixed bottom-4 right-4 z-50 h-12 w-12 rounded-full shadow-elevated gradient-primary p-0"
        size="icon"
        title="Abrir Rádio"
      >
        <Radio className="h-5 w-5 text-primary-foreground" />
      </Button>
    );
  }

  return (
    <div
      className={`fixed z-50 bg-card border rounded-xl shadow-elevated transition-all ${
        minimized
          ? "bottom-4 right-4 w-64 h-14"
          : "bottom-4 right-4 w-80 h-56"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b bg-primary/5 rounded-t-xl">
        <div className="flex items-center gap-2">
          <Radio className="h-4 w-4 text-primary animate-pulse" />
          <span className="text-xs font-semibold text-foreground">Rádio Trampo</span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => setMuted(!muted)}
          >
            {muted ? (
              <VolumeX className="h-3 w-3" />
            ) : (
              <Volume2 className="h-3 w-3" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => setMinimized(!minimized)}
          >
            {minimized ? (
              <Maximize2 className="h-3 w-3" />
            ) : (
              <Minimize2 className="h-3 w-3" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => setOpen(false)}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* YouTube iframe - always mounted to persist audio */}
      <div className={minimized ? "hidden" : "block"}>
        <iframe
          ref={iframeRef}
          src={`https://www.youtube.com/embed/${RADIO_STREAM_ID}?autoplay=1&enablejsapi=1&mute=${muted ? 1 : 0}`}
          className="w-full h-40 rounded-b-xl"
          allow="autoplay; encrypted-media"
          allowFullScreen
          title="Rádio Trampo"
        />
      </div>

      {minimized && (
        <div className="px-3 py-1 flex items-center gap-2">
          <div className="flex gap-0.5">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="w-0.5 bg-primary rounded-full animate-pulse"
                style={{
                  height: `${8 + Math.random() * 8}px`,
                  animationDelay: `${i * 0.15}s`,
                }}
              />
            ))}
          </div>
          <span className="text-xs text-muted-foreground">Tocando agora...</span>
        </div>
      )}
    </div>
  );
}
