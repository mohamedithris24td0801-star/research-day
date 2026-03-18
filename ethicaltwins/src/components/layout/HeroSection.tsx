import { Dna, Users, FlaskConical, Lock, Zap, Globe } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden gradient-hero py-16 sm:py-20">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -left-20 bottom-0 h-64 w-64 rounded-full bg-accent/5 blur-3xl" />
      </div>
      
      <div className="container relative">
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-6">
            <Dna className="h-4 w-4" />
            <span>Next-Gen Clinical Research Platform</span>
          </div>
          
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl mb-6">
            <span className="text-balance">
              Generate <span className="text-primary">Synthetic Patients</span> for{" "}
              <span className="text-primary">Ethical</span> Drug Trials
            </span>
          </h1>
          
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10">
            Create 100% synthetic, biologically accurate digital patient twins. 
            Accelerate medical research while ensuring full privacy compliance and 
            maintaining complex biological detail needed for clinical testing.
          </p>
          
          {/* Feature highlights */}
          <div className="grid gap-4 sm:grid-cols-3 max-w-2xl mx-auto">
            <div className="flex flex-col items-center gap-2 rounded-xl border bg-card/50 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
                <Lock className="h-5 w-5 text-success" />
              </div>
              <span className="font-medium">100% Anonymous</span>
              <span className="text-xs text-muted-foreground text-center">GDPR & HIPAA Compliant</span>
            </div>
            
            <div className="flex flex-col items-center gap-2 rounded-xl border bg-card/50 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Zap className="h-5 w-5 text-primary" />
              </div>
              <span className="font-medium">AI-Generated</span>
              <span className="text-xs text-muted-foreground text-center">Biologically Accurate</span>
            </div>
            
            <div className="flex flex-col items-center gap-2 rounded-xl border bg-card/50 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                <Globe className="h-5 w-5 text-accent" />
              </div>
              <span className="font-medium">Diverse Data</span>
              <span className="text-xs text-muted-foreground text-center">Global Demographics</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
