import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FlaskConical, Play } from "lucide-react";
import type { SyntheticTwin } from "@/types/patient";

interface DrugTrialSimulatorProps {
  twins: SyntheticTwin[];
  onSimulate: (medicineName: string) => void;
  isLoading: boolean;
  voiceMedicine?: string;
}

export function DrugTrialSimulator({ twins, onSimulate, isLoading, voiceMedicine }: DrugTrialSimulatorProps) {
  const [medicineName, setMedicineName] = useState("");

  useEffect(() => {
    if (voiceMedicine) {
      setMedicineName(voiceMedicine);
    }
  }, [voiceMedicine]);

  const handleSimulate = () => {
    if (medicineName.trim()) {
      onSimulate(medicineName.trim());
    }
  };

  return (
    <Card className="shadow-card border-border/50">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/20">
            <FlaskConical className="h-5 w-5 text-accent" />
          </div>
          <div>
            <CardTitle className="text-xl">Drug Trial Simulation</CardTitle>
            <CardDescription>
              Test a medicine across all {twins.length} synthetic patients
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="flex-1">
            <Label htmlFor="medicine" className="sr-only">Medicine Name</Label>
            <Input
              id="medicine"
              placeholder="Enter medicine/tablet name (e.g., Metformin 500mg)"
              value={medicineName}
              onChange={(e) => setMedicineName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSimulate()}
              disabled={isLoading || twins.length === 0}
            />
          </div>
          <Button 
            onClick={handleSimulate}
            disabled={isLoading || !medicineName.trim() || twins.length === 0}
            className="gap-2"
          >
            <Play className="h-4 w-4" />
            {isLoading ? "Simulating..." : "Run Simulation"}
          </Button>
        </div>
        
        {twins.length === 0 && (
          <p className="mt-3 text-sm text-muted-foreground">
            Generate synthetic twins first to run a drug trial simulation.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
