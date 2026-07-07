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

/**
 * Generates a simulated live football match feed.
 */
export async function getSimulatedMatchFeed(): Promise<any> {
  const model = genAI.getGenerativeModel({ 
    model: 'gemini-2.5-flash',
    tools: [{ googleSearch: {} }] as any
  });
  
  const prompt = `
    You are a sports data feed generator for the FIFA World Cup 2026. Today's date is ${new Date().toDateString()}.
    Using Google Search Grounding, search official sources (ESPN.com, FIFA.com, or BBC) for REAL matches.
    CRITICAL INSTRUCTION: If there are NO live matches happening RIGHT NOW today, you MUST search for the results of the most recently COMPLETED matches (e.g., the Round of 16 matches that finished a few days ago). 
    DO NOT predict or hallucinate scores for future matches (e.g., matches scheduled for later in July). ONLY output scores for matches that have already finished or are actively being played.
    Extract the real teams and real scores from that reliable source.
    Generate a JSON object representing one of these matches (live or recently completed) and two other recent matches.
    You must output STRICT JSON ONLY matching this schema without markdown wrappers. Do NOT include search citations or markdown formatting in your response.
    {
      "liveMatch": {
        "homeTeam": "String (e.g. USA)",
        "awayTeam": "String (e.g. MEXICO)",
        "homeScore": Number,
        "awayScore": Number,
        "minute": Number (e.g. 72),
        "primaryColor": "String (Hex code of home team main color, e.g. #002868)",
        "secondaryColor": "String (Hex code of away team main color, e.g. #006847)",
        "slides": [
          { "id": 1, "text": "Commentary text...", "isGoal": false },
          { "id": 2, "text": "<span class='text-emerald-400 text-sm'>STRIKE!</span> Another commentary...", "isGoal": true },
          { "id": 3, "text": "Another event...", "isGoal": false }
        ]
      },
      "completedMatch": {
        "homeTeam": "String",
        "awayTeam": "String",
        "homeScore": Number,
        "awayScore": Number
      },
      "upcomingMatch": {
        "homeTeam": "String",
        "awayTeam": "String",
        "time": "String (e.g. 19:00 Local)"
      }
    }
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    
    // Strip markdown wrappers and any trailing search citations/text
    let rawText = response.text().trim();
    rawText = rawText.replace(/^```json\n?/, '').replace(/\n?```$/, '');
    
    // If the model appended citations after the JSON block, we extract just the JSON
    const jsonEnd = rawText.lastIndexOf('}');
    if (jsonEnd !== -1) {
      rawText = rawText.substring(0, jsonEnd + 1);
    }

    return JSON.parse(rawText);
  } catch (error) {
    console.error("Gemini Live Feed Fault:", error);
    // Fallback data if API fails
    // Dynamic realistic fallback when quota is exceeded
    const fallbackTeams = [
      { h: "BRAZIL", a: "GERMANY", hc: "#009c3b", ac: "#000000" },
      { h: "ARGENTINA", a: "FRANCE", hc: "#74acdf", ac: "#002395" },
      { h: "ENGLAND", a: "SPAIN", hc: "#cf081f", ac: "#c60b1e" }
    ];
    const match = fallbackTeams[Math.floor(Math.random() * fallbackTeams.length)];
    const min = Math.floor(Math.random() * 90);
    const hScore = Math.floor(Math.random() * 3);
    const aScore = Math.floor(Math.random() * 3);

    return {
      liveMatch: {
        homeTeam: match.h, awayTeam: match.a, homeScore: hScore, awayScore: aScore, minute: min,
        primaryColor: match.hc, secondaryColor: match.ac,
        slides: [
          { id: 1, text: "Gemini API Blocked (Free Tier Quota). Injecting realistic mock data.", isGoal: false },
          { id: 2, text: "A phenomenal strike from outside the box!", isGoal: true },
          { id: 3, text: "The stadium erupts into massive cheers!", isGoal: false }
        ]
      },
      completedMatch: { homeTeam: "USA", awayTeam: "MEXICO", homeScore: 2, awayScore: 1 },
      upcomingMatch: { homeTeam: "JAPAN", awayTeam: "SENEGAL", time: "19:00 Local" }
    };
  }
}

/**
 * Translates an English PA announcement into multiple languages.
 */
export async function translateAnnouncement(text: string): Promise<string> {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  const prompt = `
    Translate this stadium PA announcement into Spanish, French, and German.
    Format the output elegantly like a Jumbotron broadcast display.
    Do not use markdown wrappers.
    Announcement: "${text}"
  `;
  try {
    const result = await model.generateContent(prompt);
    return (await result.response).text();
  } catch (e) {
    return "TRANSLATION ERROR: Systems offline.";
  }
}

/**
 * Generates a Live Fan Sentiment Analysis based on stadium conditions.
 */
export async function getSentimentAnalysis(telemetry: StadiumTelemetry): Promise<string> {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  const prompt = `
    You are analyzing thousands of live fan tweets inside the OmniPitch stadium.
    Current conditions: WBGT Temperature: ${telemetry.wbgtTemperature}°C. 
    Gate delays: ${JSON.stringify(telemetry.gateThroughput)}.
    Generate a 2-3 sentence summary of the "Stadium Vibe Score" based on these conditions. Be highly realistic.
  `;
  try {
    const result = await model.generateContent(prompt);
    return (await result.response).text();
  } catch (e) {
    return "VIBE SCORE: Neutral. (Analysis Offline)";
  }
}

/**
 * Generates a step-by-step checklist for a volunteer task.
 */
export async function getTaskChecklist(incidentDesc: string): Promise<string[]> {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  const prompt = `
    You are generating a triage protocol for a stadium volunteer.
    Incident: ${incidentDesc}.
    Return EXACTLY 3 actionable, concise steps as a JSON string array. (e.g. ["Step 1", "Step 2", "Step 3"]).
    Output RAW JSON ONLY. No markdown wrappers.
  `;
  try {
    const result = await model.generateContent(prompt);
    let rawText = (await result.response).text().trim();
    rawText = rawText.replace(/^```json\n?/, '').replace(/\n?```$/, '');
    return JSON.parse(rawText);
  } catch (e) {
    return ["Assess the situation immediately.", "Contact Command Center if backup is needed.", "Ensure fan safety above all else."];
  }
}
