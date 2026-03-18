import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface SyntheticTwin {
  id: string;
  name: string;
  age: number;
  gender: string;
  height: number;
  weight: number;
  bloodGroup: string;
  country: string;
  ethnicity: string;
  bmi: number;
  biologicalMarkers: string;
  matchAccuracy: number;
  riskFactors: string[];
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { medicineName, twins }: { medicineName: string; twins: SyntheticTwin[] } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    if (!medicineName || !twins || twins.length === 0) {
      return new Response(JSON.stringify({ error: "Medicine name and twins data are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const systemPrompt = `You are a clinical pharmacologist simulating drug safety trials on synthetic patient populations. Your task is to analyze potential drug interactions and safety outcomes for synthetic patients.

CRITICAL REQUIREMENTS:
1. Analyze each synthetic patient for drug safety
2. Consider age, BMI, blood group, existing risk factors, and biological markers
3. Provide realistic safety assessments based on patient characteristics
4. This is a SIMULATION for research purposes only - not real medical advice

For each patient, generate:
- patientId: The twin's ID
- safetyStatus: "SAFE" | "CAUTION" | "RISK"
- efficacyScore: 0-100 (predicted drug efficacy for this patient type)
- sideEffects: Array of potential side effects based on patient profile
- contraindications: Any contraindications based on patient characteristics
- recommendation: Brief clinical recommendation
- riskLevel: "low" | "medium" | "high"
- demographicGroup: Categorize by age group (young adult, middle-aged, senior)

Also provide an overall trial summary:
- overallSafetyScore: 0-100
- recommendedDosage: Suggested dosage based on population
- trialOutcome: "APPROVED_FOR_TESTING" | "REQUIRES_FURTHER_STUDY" | "NOT_RECOMMENDED"
- keyFindings: Array of important findings

RESPOND ONLY WITH A VALID JSON object containing "patientResults" array and "trialSummary" object. No markdown, no explanation.`;

    const twinsDescription = twins.map(t => 
      `- ${t.id} (${t.name}): Age ${t.age}, ${t.gender}, BMI ${t.bmi?.toFixed(1) || 'N/A'}, Blood: ${t.bloodGroup}, Ethnicity: ${t.ethnicity}, Risk Factors: ${t.riskFactors?.join(', ') || 'None noted'}`
    ).join('\n');

    const userPrompt = `Simulate a drug safety trial for "${medicineName}" on these synthetic patients:

${twinsDescription}

Analyze each patient and provide safety results. Return a JSON object with "patientResults" array and "trialSummary" object.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI usage limit reached. Please add credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      throw new Error("No content in AI response");
    }

    // Parse the JSON response
    let trialResults;
    try {
      const cleanedContent = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      trialResults = JSON.parse(cleanedContent);
    } catch (parseError) {
      console.error("Failed to parse AI response:", content);
      throw new Error("Failed to parse trial simulation data");
    }

    return new Response(JSON.stringify({ 
      medicineName,
      ...trialResults,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("simulate-drug-trial error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
