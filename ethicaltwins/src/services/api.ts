import type { PatientInput, SyntheticTwin, DrugTrialResult } from "@/types/patient";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

async function callEdgeFunction<T>(functionName: string, body: object): Promise<T> {
  const response = await fetch(`${SUPABASE_URL}/functions/v1/${functionName}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    if (response.status === 429) {
      throw new Error("Rate limit exceeded. Please wait a moment and try again.");
    }
    if (response.status === 402) {
      throw new Error("AI usage limit reached. Please add credits to continue.");
    }
    throw new Error(errorData.error || `Request failed with status ${response.status}`);
  }

  return response.json();
}

export async function generateTwins(patientData: PatientInput): Promise<{
  twins: SyntheticTwin[];
  inputPatient: PatientInput;
}> {
  return callEdgeFunction("generate-twins", { patientData });
}

export async function simulateDrugTrial(
  medicineName: string,
  twins: SyntheticTwin[]
): Promise<DrugTrialResult> {
  return callEdgeFunction("simulate-drug-trial", { medicineName, twins });
}
