const fs = require('fs');
let content = fs.readFileSync('src/services/deepseek.ts', 'utf8');

content = content.replace(/import \{ MATCH_FEED_TTL_MS \} from '\.\.\/constants';/, "import { MATCH_FEED_TTL_MS, INCIDENT_DESC_MAX_LENGTH } from '../constants';");
content = content.replace(/dispatchOrder = sanitizeInput\(String\(value\.dispatchOrder \?\? ''\), 280\);/, "dispatchOrder = sanitizeInput(String(value.dispatchOrder ?? ''), INCIDENT_DESC_MAX_LENGTH);");
content = content.replace(/<incident>\$\{sanitizeInput\(incidentDesc, 280\)\}<\/incident>/, "<incident>${sanitizeInput(incidentDesc, INCIDENT_DESC_MAX_LENGTH)}</incident>");

content = content.replace(/\/\*\*[\s\S]*?Sanitizes user input[\s\S]*?\*\//, `/**
 * Sanitizes user input to prevent prompt injection attacks.
 * Strips control characters and limits input length for security.
 *
 * @param input - The raw user input string.
 * @param maxLength - The maximum allowed length (default 4000).
 * @returns The sanitized string.
 */`);

content = content.replace(/\/\*\*[\s\S]*?Executes a localized, grounded conversational assistance cycle for fans\.[\s\S]*?\*\//, `/**
 * Executes a localized, grounded conversational assistance cycle for fans.
 *
 * @param userQuery - The fan's query or request.
 * @param userLang - The language requested by the fan (e.g., 'en', 'es').
 * @param telemetry - The current stadium telemetry data.
 * @param needsStepFree - Whether the fan requires step-free access.
 * @param resolvedFacts - Optional pre-resolved facts from the decision engine.
 * @returns A promise resolving to the AI-generated assistance response.
 */`);

content = content.replace(/\/\*\*[\s\S]*?Executes Multimodal Vision Analysis for automated volunteer dispatching\.[\s\S]*?\*\//, `/**
 * Executes Multimodal Vision Analysis for automated volunteer dispatching.
 *
 * @param base64Image - The base64 encoded image string.
 * @param mimeType - The MIME type of the image.
 * @param locationContext - Context about where the incident occurred.
 * @returns A promise resolving to the incident type, severity, and dispatch order.
 */`);

content = content.replace(/\/\*\*[\s\S]*?Generates operational recommendations for the Organizer Command Center\.[\s\S]*?\*\//, `/**
 * Generates operational recommendations for the Organizer Command Center.
 *
 * @param query - The organizer's query or request.
 * @param telemetry - The current stadium telemetry data.
 * @returns A promise resolving to the AI-generated operational recommendation.
 */`);

content = content.replace(/\/\*\*[\s\S]*?Generates a simulated live football match feed\.[\s\S]*?\*\//, `/**
 * Generates a simulated live football match feed.
 *
 * @returns A promise resolving to the generated match feed response.
 */`);

content = content.replace(/\/\*\*[\s\S]*?Translates an English PA announcement into multiple languages\.[\s\S]*?\*\//, `/**
 * Translates an English PA announcement into multiple languages.
 *
 * @param text - The original English announcement text.
 * @returns A promise resolving to the translated announcement.
 */`);

content = content.replace(/\/\*\*[\s\S]*?Generates a Live Fan Sentiment Analysis based on stadium conditions\.[\s\S]*?\*\//, `/**
 * Generates a Live Fan Sentiment Analysis based on stadium conditions.
 *
 * @param telemetry - The current stadium telemetry data.
 * @returns A promise resolving to the sentiment analysis text.
 */`);

content = content.replace(/\/\*\*[\s\S]*?Generates a step-by-step checklist for a volunteer task\.[\s\S]*?\*\//, `/**
 * Generates a step-by-step checklist for a volunteer task.
 *
 * @param incidentDesc - The description of the incident requiring triage.
 * @returns A promise resolving to an array of actionable checklist steps.
 */`);

content = content.replace(/export function clearAICache\(\) \{/, `/**
 * Clears the AI response caches for match feeds and sentiment analysis.
 */
export function clearAICache() {`);

fs.writeFileSync('src/services/deepseek.ts', content);
