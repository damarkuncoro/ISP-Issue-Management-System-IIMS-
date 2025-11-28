import { GoogleGenAI, Type } from "@google/genai";
import { Ticket } from "../types";

const apiKey = process.env.API_KEY || ''; // Ensure API key is available
const ai = new GoogleGenAI({ apiKey });

export interface AIAnalysisResult {
  rootCause: string;
  recommendedAction: string;
  estimatedFixTime: string;
  priorityAssessment: string;
}

export const analyzeTicketWithGemini = async (ticket: Ticket): Promise<AIAnalysisResult | null> => {
  try {
    const prompt = `
      You are an expert Network Operations Center (NOC) AI Assistant for an ISP.
      Analyze the following issue ticket and provide technical insights.

      Ticket Details:
      - Title: ${ticket.title}
      - Type: ${ticket.type}
      - Severity: ${ticket.severity}
      - Device: ${ticket.device_id || 'N/A'}
      - Logs/Description: ${ticket.description || 'No description provided.'} ${ticket.logs || ''}

      Please provide a structured JSON response with:
      1. Potential Root Cause
      2. Recommended Action for the Engineer
      3. Estimated Fix Time (e.g., "30 mins", "2 hours")
      4. Priority Assessment (Justification for severity)
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            rootCause: { type: Type.STRING },
            recommendedAction: { type: Type.STRING },
            estimatedFixTime: { type: Type.STRING },
            priorityAssessment: { type: Type.STRING },
          },
        },
      },
    });

    const resultText = response.text;
    if (!resultText) return null;

    return JSON.parse(resultText) as AIAnalysisResult;

  } catch (error) {
    console.error("Error analyzing ticket with Gemini:", error);
    return null;
  }
};

export const generateTicketSummary = async (tickets: Ticket[]): Promise<string> => {
  try {
    const openCritical = tickets.filter(t => t.severity === 'Critical' && t.status !== 'Closed').length;
    const ticketDescriptions = tickets.slice(0, 5).map(t => `- ${t.title} (${t.severity})`).join('\n');

    const prompt = `
      As a NOC Manager Assistant, write a very brief 2-sentence executive summary of the current network health.
      
      Context:
      - Total Active Critical Issues: ${openCritical}
      - Recent Issues:
      ${ticketDescriptions}
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    return response.text || "System is stable.";
  } catch (error) {
    return "Unable to generate summary.";
  }
};