import { useEffect } from "react";
import { Mic, MicOff, Volume2, VolumeX, RotateCcw, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useVoiceAssistant, type VoiceStatus } from "@/hooks/use-voice-assistant";

interface VoiceAssistantProps {
  onParsedInput: (input: Record<string, unknown>) => void;
  onMedicineParsed?: (name: string) => void;
}

export function VoiceAssistant({ onParsedInput, onMedicineParsed }: VoiceAssistantProps) {
  const {
    status,
    statusText,
    transcript,
    parsedInput,
    errorMessage,
    isSupported,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
    retry,
  } = useVoiceAssistant();

  // Forward parsed input to parent
  useEffect(() => {
    if (parsedInput && Object.keys(parsedInput).length > 0) {
      const { medicineName, ...formFields } = parsedInput;
      if (Object.keys(formFields).length > 0) {
        onParsedInput(formFields);
      }
      if (medicineName && onMedicineParsed) {
        onMedicineParsed(medicineName);
      }
    }
  }, [parsedInput, onParsedInput, onMedicineParsed]);

  if (!isSupported) {
    return (
      <Card className="border-destructive/30 bg-destructive/5">
        <CardContent className="flex items-center gap-3 py-3 px-4">
          <AlertCircle className="h-5 w-5 text-destructive shrink-0" />
          <p className="text-sm text-destructive">
            Voice input is not supported in this browser. Try Chrome or Edge.
          </p>
        </CardContent>
      </Card>
    );
  }

  const isListening = status === "listening";
  const isSpeaking = status === "speaking";
  const isError = status === "error";
  const isProcessing = status === "processing";

  return (
    <Card className="shadow-card border-border/50 overflow-hidden">
      <CardContent className="py-4 px-4">
        <div className="flex items-center gap-4">
          {/* Mic Button */}
          <div className="relative">
            {isListening && (
              <>
                <span className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
                <span className="absolute -inset-1 rounded-full bg-primary/10 animate-pulse" />
              </>
            )}
            <Button
              type="button"
              size="icon"
              variant={isListening ? "default" : isError ? "destructive" : "outline"}
              className={cn(
                "relative h-12 w-12 rounded-full transition-all duration-300",
                isListening && "shadow-glow scale-110",
                !isListening && !isError && "hover:bg-primary hover:text-primary-foreground"
              )}
              onClick={isListening ? stopListening : startListening}
              disabled={isProcessing}
            >
              {isListening ? (
                <Mic className="h-5 w-5 animate-pulse" />
              ) : (
                <MicOff className="h-5 w-5" />
              )}
            </Button>
          </div>

          {/* Status and transcript */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className={cn(
                "text-sm font-medium",
                isListening && "text-primary",
                isError && "text-destructive",
                isProcessing && "text-muted-foreground",
                isSpeaking && "text-accent"
              )}>
                {statusText}
              </span>
              {isListening && (
                <span className="flex gap-0.5">
                  {[0, 1, 2].map(i => (
                    <span
                      key={i}
                      className="inline-block h-3 w-1 rounded-full bg-primary"
                      style={{
                        animation: `pulse 1s ease-in-out ${i * 0.15}s infinite`,
                      }}
                    />
                  ))}
                </span>
              )}
            </div>
            {transcript && (
              <p className="text-xs text-muted-foreground mt-1 truncate">
                "{transcript}"
              </p>
            )}
            {parsedInput && Object.keys(parsedInput).length > 0 && status === "idle" && (
              <p className="text-xs text-success mt-1">
                ✓ Parsed {Object.keys(parsedInput).length} field(s) from voice
              </p>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            {isSpeaking && (
              <Button type="button" size="icon" variant="ghost" onClick={stopSpeaking} className="h-9 w-9">
                <VolumeX className="h-4 w-4" />
              </Button>
            )}
            {isError && (
              <Button type="button" size="sm" variant="outline" onClick={retry} className="gap-1.5">
                <RotateCcw className="h-3.5 w-3.5" />
                Retry
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Export a hook-based helper for speaking results
export { useVoiceAssistant };
