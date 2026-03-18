import { Dna, Shield, Sparkles } from "lucide-react";

export function Header() {
  return (
    <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-glow">
              <Dna className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-accent animate-pulse-glow" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">
              Ethical<span className="text-primary">Twins</span>
            </h1>
            <p className="text-xs text-muted-foreground">AI-Powered Synthetic Patients</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
            <Shield className="h-4 w-4 text-success" />
            <span>GDPR Compliant</span>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
            <Sparkles className="h-4 w-4 text-accent" />
            <span>AI-Powered</span>
          </div>
        </div>
      </div>
    </header>
  );
}
