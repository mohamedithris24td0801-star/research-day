import { useState, useCallback, useRef, useEffect } from "react";

export type VoiceStatus = "idle" | "listening" | "processing" | "speaking" | "error";

interface ParsedVoiceInput {
  name?: string;
  age?: number;
  height?: number;
  weight?: number;
  bloodGroup?: string;
  country?: string;
  ethnicity?: string;
  biologicalMarkers?: string;
  medicineName?: string;
}

interface UseVoiceAssistantReturn {
  status: VoiceStatus;
  statusText: string;
  transcript: string;
  parsedInput: ParsedVoiceInput | null;
  errorMessage: string | null;
  isSupported: boolean;
  startListening: () => void;
  stopListening: () => void;
  speak: (text: string) => void;
  stopSpeaking: () => void;
  retry: () => void;
}

const bloodGroupMap: Record<string, string> = {
  "a positive": "A+", "a+": "A+", "a pos": "A+",
  "a negative": "A-", "a-": "A-", "a neg": "A-",
  "b positive": "B+", "b+": "B+", "b pos": "B+",
  "b negative": "B-", "b-": "B-", "b neg": "B-",
  "ab positive": "AB+", "ab+": "AB+", "ab pos": "AB+",
  "ab negative": "AB-", "ab-": "AB-", "ab neg": "AB-",
  "o positive": "O+", "o+": "O+", "o pos": "O+",
  "o negative": "O-", "o-": "O-", "o neg": "O-",
};

function parseVoiceInput(transcript: string): ParsedVoiceInput {
  const t = transcript.toLowerCase();
  const result: ParsedVoiceInput = {};

  // Name
  const nameMatch = t.match(/(?:patient\s+)?name\s+(?:is\s+)?([a-z]+(?:\s+[a-z]+)?)/i);
  if (nameMatch) result.name = nameMatch[1].replace(/\b\w/g, c => c.toUpperCase());

  // Age
  const ageMatch = t.match(/age\s+(?:is\s+)?(\d+)/);
  if (ageMatch) result.age = parseInt(ageMatch[1]);

  // Height
  const heightMatch = t.match(/height\s+(?:is\s+)?(\d+)\s*(?:cm|centimeters?)?/);
  if (heightMatch) result.height = parseInt(heightMatch[1]);

  // Weight
  const weightMatch = t.match(/weight\s+(?:is\s+)?(\d+)\s*(?:kg|kilograms?)?/);
  if (weightMatch) result.weight = parseInt(weightMatch[1]);

  // Blood group
  for (const [spoken, bg] of Object.entries(bloodGroupMap)) {
    if (t.includes(`blood group ${spoken}`) || t.includes(`blood type ${spoken}`)) {
      result.bloodGroup = bg;
      break;
    }
  }

  // Country
  const countries = [
    "united states", "united kingdom", "germany", "france", "japan",
    "china", "india", "brazil", "australia", "canada", "south korea",
    "mexico", "italy", "spain", "netherlands", "nigeria", "south africa"
  ];
  for (const c of countries) {
    if (t.includes(c) || t.includes(`from ${c}`)) {
      result.country = c.replace(/\b\w/g, ch => ch.toUpperCase());
      break;
    }
  }

  // Ethnicity
  const ethnicities = [
    "caucasian", "african", "asian", "hispanic", "latino", "middle eastern",
    "south asian", "east asian", "southeast asian", "pacific islander", "native american"
  ];
  for (const e of ethnicities) {
    if (t.includes(e)) {
      result.ethnicity = e.replace(/\b\w/g, ch => ch.toUpperCase());
      break;
    }
  }

  // Medicine name
  const drugMatch = t.match(/(?:test\s+(?:drug|medicine|tablet)\s+)([a-z0-9\-]+(?:\s+[a-z0-9\-]+)?)/i)
    || t.match(/(?:medicine|drug|tablet)\s+(?:name\s+)?(?:is\s+)?([a-z0-9\-]+(?:\s+[a-z0-9\-]+)?)/i);
  if (drugMatch) result.medicineName = drugMatch[1].replace(/\b\w/g, c => c.toUpperCase());

  return result;
}

export function useVoiceAssistant(): UseVoiceAssistantReturn {
  const [status, setStatus] = useState<VoiceStatus>("idle");
  const [transcript, setTranscript] = useState("");
  const [parsedInput, setParsedInput] = useState<ParsedVoiceInput | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef(typeof window !== "undefined" ? window.speechSynthesis : null);

  const SpeechRecognitionAPI = typeof window !== "undefined"
    ? ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition)
    : undefined;

  const isSupported = !!SpeechRecognitionAPI;

  const statusTextMap: Record<VoiceStatus, string> = {
    idle: "Tap microphone to speak",
    listening: "Listening...",
    processing: "Processing your input...",
    speaking: "Speaking results...",
    error: errorMessage || "An error occurred",
  };

  const startListening = useCallback(() => {
    if (!SpeechRecognitionAPI) {
      setStatus("error");
      setErrorMessage("Speech recognition is not supported in this browser.");
      return;
    }

    setErrorMessage(null);
    setTranscript("");
    setParsedInput(null);

    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onstart = () => setStatus("listening");

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = "";
      for (let i = 0; i < event.results.length; i++) {
        finalTranscript += event.results[i][0].transcript;
      }
      setTranscript(finalTranscript);
    };

    recognition.onend = () => {
      setStatus("processing");
      setTimeout(() => {
        setTranscript(prev => {
          if (prev.trim()) {
            const parsed = parseVoiceInput(prev);
            setParsedInput(parsed);
            if (Object.keys(parsed).length === 0) {
              setStatus("error");
              setErrorMessage("Couldn't understand. Try: \"Patient age 45, weight 70 kg, blood group O positive\"");
            } else {
              setStatus("idle");
            }
          } else {
            setStatus("error");
            setErrorMessage("No speech detected. Please try again.");
          }
          return prev;
        });
      }, 500);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      setStatus("error");
      if (event.error === "not-allowed") {
        setErrorMessage("Microphone permission denied. Please allow microphone access.");
      } else if (event.error === "no-speech") {
        setErrorMessage("No speech detected. Please try again.");
      } else {
        setErrorMessage(`Speech error: ${event.error}`);
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [SpeechRecognitionAPI]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
  }, []);

  const speak = useCallback((text: string) => {
    if (!synthRef.current) return;
    synthRef.current.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1;
    utterance.onstart = () => setStatus("speaking");
    utterance.onend = () => setStatus("idle");
    utterance.onerror = () => setStatus("idle");
    synthRef.current.speak(utterance);
  }, []);

  const stopSpeaking = useCallback(() => {
    synthRef.current?.cancel();
    setStatus("idle");
  }, []);

  const retry = useCallback(() => {
    setErrorMessage(null);
    setStatus("idle");
    startListening();
  }, [startListening]);

  useEffect(() => {
    return () => {
      recognitionRef.current?.abort();
      synthRef.current?.cancel();
    };
  }, []);

  return {
    status,
    statusText: statusTextMap[status],
    transcript,
    parsedInput,
    errorMessage,
    isSupported,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
    retry,
  };
}
