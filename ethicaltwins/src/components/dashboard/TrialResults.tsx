import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  FileText, 
  Pill, 
  TrendingUp,
  Shield,
  Users
} from "lucide-react";
import type { DrugTrialResult, PatientResult } from "@/types/patient";

interface TrialResultsProps {
  result: DrugTrialResult;
}

export function TrialResults({ result }: TrialResultsProps) {
  const { medicineName, patientResults, trialSummary, timestamp } = result;

  const getStatusIcon = (status: PatientResult["safetyStatus"]) => {
    switch (status) {
      case "SAFE":
        return <CheckCircle2 className="h-5 w-5 text-success" />;
      case "CAUTION":
        return <AlertTriangle className="h-5 w-5 text-warning" />;
      case "RISK":
        return <XCircle className="h-5 w-5 text-destructive" />;
    }
  };

  const getStatusBadge = (status: PatientResult["safetyStatus"]) => {
    switch (status) {
      case "SAFE":
        return <Badge className="bg-success text-success-foreground">Safe</Badge>;
      case "CAUTION":
        return <Badge className="bg-warning text-warning-foreground">Caution</Badge>;
      case "RISK":
        return <Badge className="bg-destructive text-destructive-foreground">Risk</Badge>;
    }
  };

  const getOutcomeBadge = (outcome: string) => {
    switch (outcome) {
      case "APPROVED_FOR_TESTING":
        return <Badge className="bg-success text-success-foreground text-sm">Approved for Testing</Badge>;
      case "REQUIRES_FURTHER_STUDY":
        return <Badge className="bg-warning text-warning-foreground text-sm">Requires Further Study</Badge>;
      case "NOT_RECOMMENDED":
        return <Badge className="bg-destructive text-destructive-foreground text-sm">Not Recommended</Badge>;
      default:
        return <Badge variant="secondary">{outcome}</Badge>;
    }
  };

  const safeCount = patientResults.filter(p => p.safetyStatus === "SAFE").length;
  const cautionCount = patientResults.filter(p => p.safetyStatus === "CAUTION").length;
  const riskCount = patientResults.filter(p => p.safetyStatus === "RISK").length;

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <Card className="shadow-card border-border/50 overflow-hidden">
        <div className="gradient-primary p-1" />
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <Pill className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl">{medicineName}</CardTitle>
                <CardDescription>
                  Drug Trial Simulation Results • {new Date(timestamp).toLocaleString()}
                </CardDescription>
              </div>
            </div>
            {getOutcomeBadge(trialSummary.trialOutcome)}
          </div>
        </CardHeader>
        <CardContent>
          {/* Stats Grid */}
          <div className="grid gap-4 sm:grid-cols-4 mb-6">
            <div className="rounded-lg border bg-card p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Shield className="h-4 w-4" />
                <span className="text-sm">Safety Score</span>
              </div>
              <div className="flex items-end gap-2">
                <span className="text-3xl font-bold text-primary">{trialSummary.overallSafetyScore}</span>
                <span className="text-muted-foreground">/100</span>
              </div>
              <Progress value={trialSummary.overallSafetyScore} className="mt-2 h-2" />
            </div>
            
            <div className="rounded-lg border bg-card p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <CheckCircle2 className="h-4 w-4 text-success" />
                <span className="text-sm">Safe</span>
              </div>
              <span className="text-3xl font-bold text-success">{safeCount}</span>
              <span className="text-muted-foreground ml-1">patients</span>
            </div>
            
            <div className="rounded-lg border bg-card p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <AlertTriangle className="h-4 w-4 text-warning" />
                <span className="text-sm">Caution</span>
              </div>
              <span className="text-3xl font-bold text-warning">{cautionCount}</span>
              <span className="text-muted-foreground ml-1">patients</span>
            </div>
            
            <div className="rounded-lg border bg-card p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <XCircle className="h-4 w-4 text-destructive" />
                <span className="text-sm">Risk</span>
              </div>
              <span className="text-3xl font-bold text-destructive">{riskCount}</span>
              <span className="text-muted-foreground ml-1">patients</span>
            </div>
          </div>

          {/* Recommended Dosage */}
          <div className="rounded-lg bg-muted/50 p-4 mb-6">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <span className="font-medium">Recommended Dosage</span>
            </div>
            <p className="text-foreground">{trialSummary.recommendedDosage}</p>
          </div>

          {/* Key Findings */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <FileText className="h-5 w-5 text-primary" />
              <span className="font-medium">Key Findings</span>
            </div>
            <ul className="space-y-2">
              {trialSummary.keyFindings.map((finding, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                  <span>{finding}</span>
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Individual Patient Results */}
      <Card className="shadow-card border-border/50">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl">Patient-Level Results</CardTitle>
              <CardDescription>
                Detailed safety analysis for each synthetic patient
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {patientResults.map((patient, index) => (
              <div 
                key={patient.patientId}
                className="rounded-lg border p-4 animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(patient.safetyStatus)}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-medium text-primary">{patient.patientId}</span>
                        {getStatusBadge(patient.safetyStatus)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {patient.demographicGroup} • Risk Level: <span className="capitalize">{patient.riskLevel}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Efficacy:</span>
                    <div className="flex items-center gap-2">
                      <Progress value={patient.efficacyScore} className="w-24 h-2" />
                      <span className="font-medium">{patient.efficacyScore}%</span>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  {patient.sideEffects.length > 0 && (
                    <div>
                      <span className="text-sm text-muted-foreground">Potential Side Effects</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {patient.sideEffects.map((effect, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">{effect}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {patient.contraindications.length > 0 && (
                    <div>
                      <span className="text-sm text-muted-foreground">Contraindications</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {patient.contraindications.map((contra, i) => (
                          <Badge key={i} variant="outline" className="text-xs border-destructive/50 text-destructive">
                            {contra}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <Separator className="my-3" />
                
                <div>
                  <span className="text-sm text-muted-foreground">Recommendation</span>
                  <p className="text-sm mt-1">{patient.recommendation}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
