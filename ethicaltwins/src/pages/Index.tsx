import { useState, useCallback, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { Header } from "@/components/layout/Header";
import { HeroSection } from "@/components/layout/HeroSection";
import { PatientInputForm } from "@/components/dashboard/PatientInputForm";
import { TwinsTable } from "@/components/dashboard/TwinsTable";
import { DrugTrialSimulator } from "@/components/dashboard/DrugTrialSimulator";
import { TrialResults } from "@/components/dashboard/TrialResults";
import { VoiceAssistant } from "@/components/dashboard/VoiceAssistant";
import { LoadingDNA } from "@/components/ui/loading-dna";
import { useVoiceAssistant } from "@/hooks/use-voice-assistant";
import { generateTwins, simulateDrugTrial } from "@/services/api";
import type { PatientInput, SyntheticTwin, DrugTrialResult } from "@/types/patient";
import { Dna, FlaskConical, ArrowDown } from "lucide-react";

const Index = () => {
  const { toast } = useToast();
  const [twins, setTwins] = useState<SyntheticTwin[]>([]);
  const [trialResult, setTrialResult] = useState<DrugTrialResult | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [voiceFormData, setVoiceFormData] = useState<Record<string, unknown> | null>(null);
  const [voiceMedicine, setVoiceMedicine] = useState<string>("");

  // Voice speaking instance for result announcements
  const speakResult = useCallback((text: string) => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.pitch = 1;
      window.speechSynthesis.speak(utterance);
    }
  }, []);

  const handleVoiceInput = useCallback((parsed: Record<string, unknown>) => {
    setVoiceFormData(parsed);
    toast({
      title: "Voice Input Received",
      description: `Parsed ${Object.keys(parsed).length} field(s) from voice command.`,
    });
  }, [toast]);

  const handleVoiceMedicine = useCallback((name: string) => {
    setVoiceMedicine(name);
    toast({
      title: "Medicine Detected",
      description: `"${name}" will be used for drug trial simulation.`,
    });
  }, [toast]);

  const handleGenerateTwins = async (patientData: PatientInput) => {
    setIsGenerating(true);
    setTrialResult(null);
    
    try {
      const result = await generateTwins(patientData);
      setTwins(result.twins);
      toast({
        title: "Synthetic Twins Generated",
        description: `Successfully created ${result.twins.length} digital patient twins.`,
      });
      speakResult(`${result.twins.length} synthetic patients generated successfully with high biological diversity.`);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate synthetic twins.",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSimulateTrial = async (medicineName: string) => {
    if (twins.length === 0) {
      toast({
        variant: "destructive",
        title: "No Patients Available",
        description: "Please generate synthetic twins before running a drug trial.",
      });
      return;
    }

    setIsSimulating(true);
    
    try {
      const result = await simulateDrugTrial(medicineName, twins);
      setTrialResult(result);
      toast({
        title: "Simulation Complete",
        description: `Drug trial simulation for "${medicineName}" completed successfully.`,
      });

      // Voice output for trial results
      const safe = result.patientResults.filter(r => r.safetyStatus === "SAFE").length;
      const caution = result.patientResults.filter(r => r.safetyStatus === "CAUTION").length;
      const risk = result.patientResults.filter(r => r.safetyStatus === "RISK").length;
      let summary = `Drug trial completed for ${medicineName}. `;
      if (safe > 0) summary += `${safe} groups are safe. `;
      if (caution > 0) summary += `${caution} show moderate risk. `;
      if (risk > 0) summary += `${risk} show high risk. `;
      summary += `Overall safety score: ${result.trialSummary.overallSafetyScore} percent.`;
      speakResult(summary);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Simulation Failed",
        description: error instanceof Error ? error.message : "Failed to run drug trial simulation.",
      });
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <HeroSection />
      
      <main className="container py-12 space-y-12">
        {/* Voice Assistant */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-accent-foreground text-sm font-bold">
              🎙
            </div>
            <h2 className="text-xl font-bold">AI Voice Assistant</h2>
            <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">Beta</span>
          </div>
          <VoiceAssistant
            onParsedInput={handleVoiceInput}
            onMedicineParsed={handleVoiceMedicine}
          />
          <p className="text-xs text-muted-foreground mt-2">
            Try: "Patient name John, age 45, weight 70 kg, blood group O positive, from India, test drug Metformin-X"
          </p>
        </section>

        {/* Step 1: Patient Input */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
              1
            </div>
            <h2 className="text-2xl font-bold">Define Patient Profile</h2>
          </div>
          <div className="grid gap-8 lg:grid-cols-2">
            <PatientInputForm 
              onSubmit={handleGenerateTwins} 
              isLoading={isGenerating}
              voiceData={voiceFormData}
            />
            
            {isGenerating && (
              <div className="flex items-center justify-center rounded-xl border bg-card p-8">
                <LoadingDNA message="Generating synthetic twins..." />
              </div>
            )}
            
            {!isGenerating && twins.length === 0 && (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed bg-muted/30 p-8">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
                  <Dna className="h-8 w-8 text-primary animate-pulse" />
                </div>
                <h3 className="text-lg font-medium mb-2">No Twins Generated Yet</h3>
                <p className="text-sm text-muted-foreground text-center max-w-sm">
                  Fill out the patient profile form and click "Generate Synthetic Twins" 
                  to create AI-powered digital patient data.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Generated Twins Section */}
        {twins.length > 0 && (
          <>
            <div className="flex justify-center">
              <ArrowDown className="h-8 w-8 text-muted-foreground animate-bounce" />
            </div>
            
            <section className="animate-fade-in">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                  2
                </div>
                <h2 className="text-2xl font-bold">Review Synthetic Twins</h2>
              </div>
              <TwinsTable twins={twins} />
            </section>

            <div className="flex justify-center">
              <ArrowDown className="h-8 w-8 text-muted-foreground animate-bounce" />
            </div>

            {/* Drug Trial Section */}
            <section className="animate-fade-in">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                  3
                </div>
                <h2 className="text-2xl font-bold">Simulate Drug Trial</h2>
              </div>
              <DrugTrialSimulator 
                twins={twins}
                onSimulate={handleSimulateTrial}
                isLoading={isSimulating}
                voiceMedicine={voiceMedicine}
              />
              
              {isSimulating && (
                <div className="mt-8 flex items-center justify-center rounded-xl border bg-card p-8">
                  <LoadingDNA message="Running drug trial simulation..." />
                </div>
              )}
            </section>
          </>
        )}

        {/* Trial Results */}
        {trialResult && !isSimulating && (
          <>
            <div className="flex justify-center">
              <ArrowDown className="h-8 w-8 text-muted-foreground animate-bounce" />
            </div>
            
            <section className="animate-fade-in">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                  4
                </div>
                <h2 className="text-2xl font-bold">Trial Results</h2>
              </div>
              <TrialResults result={trialResult} />
            </section>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t bg-muted/30 py-8 mt-12">
        <div className="container text-center">
          <div className="flex items-center justify-center gap-2 text-muted-foreground mb-2">
            <Dna className="h-5 w-5 text-primary" />
            <span className="font-medium">EthicalTwins</span>
          </div>
          <p className="text-sm text-muted-foreground">
            AI-powered synthetic patient generation for ethical clinical research.
            <br />
            100% GDPR compliant • No real patient data • Biologically accurate
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
