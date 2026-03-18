import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface PatientInput {
  name: string;
  age: number;
  height: number;
  weight: number;
  bloodGroup: string;
  country: string;
  ethnicity: string;
  biologicalMarkers?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { patientData }: { patientData: PatientInput } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are a medical data scientist specializing in synthetic patient data generation for clinical trials. Your task is to generate 5 synthetic patient "digital twins" based on input patient characteristics.

CRITICAL REQUIREMENTS:
1. Generate exactly 5 diverse synthetic patients
2. Each patient must be biologically plausible and maintain medical accuracy
3. Vary demographics while keeping core characteristics related to the input
4. Include a "matchAccuracy" score (70-99%) indicating how closely each twin matches the original profile
5. All data must be 100% synthetic and GDPR-compliant (no real patient data)

For each synthetic twin, generate:
- id: Unique identifier (TWIN-001, TWIN-002, etc.)
- name: Synthetic name appropriate for the ethnicity/region
- age: Vary within ±15 years of input, min 18
- gender: Mix of Male/Female
- height: Vary within ±15cm of input
- weight: Vary within ±20kg of input
- bloodGroup: Can vary but include some matches
- country: Same or nearby regions
- ethnicity: Related ethnic groups
- bmi: Calculated from height/weight
- biologicalMarkers: Relevant health markers (cholesterol, blood pressure, etc.)
- matchAccuracy: Percentage match to original profile
- riskFactors: Array of relevant health risk factors

RESPOND ONLY WITH A VALID JSON ARRAY of 5 patient objects. No markdown, no explanation.`;

    const userPrompt = `Generate 5 synthetic patient twins based on this profile:
Name: ${patientData.name}
Age: ${patientData.age}
Height: ${patientData.height}cm
Weight: ${patientData.weight}kg
Blood Group: ${patientData.bloodGroup}
Country: ${patientData.country}
Ethnicity: ${patientData.ethnicity}
Biological Markers: ${patientData.biologicalMarkers || "Not specified"}

Return a JSON array of 5 synthetic twins.`;

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

    // Parse the JSON response, handling potential markdown code blocks
    let twins;
    try {
      const cleanedContent = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      twins = JSON.parse(cleanedContent);
    } catch (parseError) {
      console.error("Failed to parse AI response:", content);
      throw new Error("Failed to parse synthetic patient data");
    }

    return new Response(JSON.stringify({ twins, inputPatient: patientData }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("generate-twins error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
