import { GoogleGenerativeAI } from '@google/generative-ai';
import type { StadiumTelemetry } from '../types';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(apiKey);

/**
 * Executes a localized, grounded conversational assistance cycle for fans.
 */
export async function getFanAssistance(
  userQuery: string, 
  userLang: string, 
  telemetry: StadiumTelemetry,
  needsStepFree: boolean
): Promise<string> {
  if (!apiKey) return "API_KEY_MISSING";
  
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  
  const systemContext = `
    You are OmniPitch 2026, the official GenAI operational assistant for the FIFA World Cup 2026 stadium management team.
    You must assist fans in their native language. Respond strictly in: ${userLang}.
    
    CRITICAL LIVE STADIUM STATUS TO GROUND YOUR ASSIST:
    - Current Wet Bulb Globe Temperature (WBGT): ${telemetry.wbgtTemperature}°C (If >32°C, remind fans to stay hydrated and favor shaded paths).
    - Gate Bottlenecks: ${JSON.stringify(telemetry.gateThroughput)}
    - Local Public Transit Delays: ${JSON.stringify(telemetry.transitDelays)}
    - Accessibility Constraints: User Step-Free Requirement is set to ${needsStepFree}. Keep routes matching this constraint.
    
    Instructions: Provide hyper-localized, safe navigation and support. Do not hallucinate data outside this provided operational payload. Keep answers concise (under 3 sentences).
  `;

  try {
    const result = await model.generateContent([systemContext, userQuery]);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Gemini Multi-turn Chat Fault:", error);
    return "Oops! Our AI network is a bit crowded right now. 🏟️ Please give me a moment and try asking again, or refer to the stadium Jumbotrons for immediate directions!";
  }
}

/**
 * Executes Multimodal Vision Analysis for automated volunteer dispatching.
 */
export async function processVisionIncident(
  base64Image: string, 
  mimeType: string, 
  locationContext: string
): Promise<{ type: string; severity: string; dispatchOrder: string }> {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  
  const visionPrompt = `
    Analyze this structural operational anomaly reported inside the stadium at: ${locationContext}.
    Classify the problem and identify critical parameters.
    You must output a strict JSON string parsing into this layout matching valid syntax:
    {
      "type": "MEDICAL" | "CROWD_BOTTLENECK" | "FACILITY_DAMAGE" | "WEATHER_HAZARD",
      "severity": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
      "dispatchOrder": "A one-sentence urgent direction dispatching localized teams to rectify the exact structural issue visible."
    }
    Output raw JSON only. Do not wrap in markdown \`\`\` json wrappers.
  `;

  const imagePart = {
    inlineData: { data: base64Image, mimeType }
  };

  try {
    const result = await model.generateContent([visionPrompt, imagePart]);
    const response = await result.response;
    return JSON.parse(response.text().trim());
  } catch (error) {
    console.error("Gemini Vision Fault:", error);
    return {
      type: "FACILITY_DAMAGE",
      severity: "MEDIUM",
      dispatchOrder: "Manual triage required. Please deploy nearest volunteer."
    };
  }
}

/**
 * Generates operational recommendations for the Organizer Command Center.
 */
export async function getOrganizerRecommendation(
  query: string,
  telemetry: StadiumTelemetry
): Promise<string> {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  
  const prompt = `
    You are the OmniPitch AI Command Console.
    Current Telemetry Context:
    - WBGT: ${telemetry.wbgtTemperature}
    - Gate Throughput: ${JSON.stringify(telemetry.gateThroughput)}
    - Transit Delays: ${JSON.stringify(telemetry.transitDelays)}
    - Concession Inventory: ${JSON.stringify(telemetry.concessionInventory)}
    
    The organizer is asking: "${query}".
    Provide a hyper-focused, tactical operational recommendation based on the data. Keep it under 3 sentences.
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Gemini Organizer Fault:", error);
    return "AI Core offline. Revert to manual operational protocols.";
  }
}
