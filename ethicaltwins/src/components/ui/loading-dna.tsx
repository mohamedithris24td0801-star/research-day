import { cn } from "@/lib/utils";

interface LoadingDNAProps {
  className?: string;
  message?: string;
}

export function LoadingDNA({ className, message = "Generating synthetic twins..." }: LoadingDNAProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-6 py-12", className)}>
      {/* DNA Helix Animation */}
      <div className="relative h-24 w-16">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute left-1/2 h-3 w-3 rounded-full bg-primary"
            style={{
              top: `${i * 16}%`,
              animation: `dnaWave 1.5s ease-in-out ${i * 0.15}s infinite`,
              transform: "translateX(-50%)",
            }}
          />
        ))}
        {[...Array(6)].map((_, i) => (
          <div
            key={`r-${i}`}
            className="absolute left-1/2 h-3 w-3 rounded-full bg-accent"
            style={{
              top: `${i * 16}%`,
              animation: `dnaWaveReverse 1.5s ease-in-out ${i * 0.15}s infinite`,
              transform: "translateX(-50%)",
            }}
          />
        ))}
        {/* Connecting lines */}
        {[...Array(6)].map((_, i) => (
          <div
            key={`line-${i}`}
            className="absolute left-1/2 h-0.5 w-8 bg-border"
            style={{
              top: `${i * 16 + 5}%`,
              transform: "translateX(-50%)",
              animation: `dnaLine 1.5s ease-in-out ${i * 0.15}s infinite`,
            }}
          />
        ))}
      </div>
      
      <div className="text-center">
        <p className="text-lg font-medium text-foreground animate-pulse">{message}</p>
        <p className="text-sm text-muted-foreground mt-1">
          AI is creating biologically accurate patient profiles
        </p>
      </div>

      <style>{`
        @keyframes dnaWave {
          0%, 100% { transform: translateX(-20px); }
          50% { transform: translateX(20px); }
        }
        @keyframes dnaWaveReverse {
          0%, 100% { transform: translateX(20px); }
          50% { transform: translateX(-20px); }
        }
        @keyframes dnaLine {
          0%, 100% { opacity: 0.3; width: 8px; }
          50% { opacity: 1; width: 40px; }
        }
      `}</style>
    </div>
  );
}
