import { GoogleGenAI, Type } from "@google/genai";
import { Ticket, Device, Customer } from "../types";

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

interface SystemContext {
  tickets: Ticket[];
  devices: Device[];
  customers: Customer[];
}

export const chatWithCopilot = async (message: string, context: SystemContext, history: {role: string, parts: {text: string}[]}[]): Promise<string> => {
  try {
    // condense context to save tokens and focus on summary
    const ticketSummary = context.tickets.map(t => `${t.id}: ${t.title} (${t.status}, ${t.severity})`).join('\n');
    const deviceSummary = `Total Devices: ${context.devices.length}, Offline/Maintenance: ${context.devices.filter(d => d.status !== 'Active').length}`;
    const customerSummary = `Total Customers: ${context.customers.length}, Active: ${context.customers.filter(c => c.status === 'Active').length}`;

    const systemInstruction = `
      You are "ISP Copilot", an AI assistant for the ISP Issue Management System.
      You have access to the current system state.
      
      Current System Context:
      [TICKETS]
      ${ticketSummary}
      
      [STATS]
      ${deviceSummary}
      ${customerSummary}

      Rules:
      1. Answer questions based on the context provided.
      2. If asked to draft emails or messages, use a professional tone.
      3. Be concise and helpful for NOC engineers and Support staff.
      4. If you don't know something that isn't in the context, say so.
    `;

    // We use a stateless call for simplicity here, but constructing a chat session is better.
    // However, since we need to inject dynamic context every time (as tickets update), 
    // we'll prepend the system instruction + context to the conversation.

    const chatSession = ai.chats.create({
      model: "gemini-2.5-flash",
      config: {
        systemInstruction: systemInstruction,
      },
      history: history
    });

    const response = await chatSession.sendMessage({ message });
    return response.text || "I'm having trouble processing that request.";

  } catch (error) {
    console.error("Copilot Error:", error);
    return "Sorry, I am currently offline or encountered an error.";
  }
};