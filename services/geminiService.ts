
import { GoogleGenAI, Type } from "@google/genai";
import { SYMPTOMS_LIST } from "../constants";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function parseSymptoms(text: string): Promise<string[]> {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Extract medical symptoms from the following text and match them to our internal ID list:
    ${SYMPTOMS_LIST.map(s => `${s.id}: ${s.label}`).join(', ')}
    
    Text: "${text}"
    
    Return only a JSON array of matching symptom IDs. If no symptoms found, return [].`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: { type: Type.STRING }
      }
    }
  });

  try {
    return JSON.parse(response.text.trim());
  } catch (e) {
    console.error("Failed to parse Gemini response", e);
    return [];
  }
}

export async function explainDiagnosis(diagnosis: string, reasoning: string): Promise<string> {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `You are an AI Medical Logic Expert. Given a diagnosis and a logic-based reasoning trace, provide a human-friendly, compassionate, and clear explanation of why this conclusion was reached.
    
    Diagnosis: ${diagnosis}
    Reasoning Trace Summary: ${reasoning}
    
    Strict Requirement: Start with a disclaimer that this is educational and not medical advice. Use professional yet accessible language.`,
  });

  return response.text || "No explanation generated.";
}
