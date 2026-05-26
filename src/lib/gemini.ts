import { GoogleGenAI, Type } from "@google/genai";
import { MeetingAnalysis, EmailAnalysis } from "../types";

let aiInstance: GoogleGenAI | null = null;
 
 function getAI() {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is required");
    }
    aiInstance = new GoogleGenAI({ 
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiInstance;
}

export async function generateFollowUpEmail(meetingData: any): Promise<EmailAnalysis> {
  const ai = getAI();
  const result = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [{ 
      role: "user", 
      parts: [{ 
        text: `You are a professional executive assistant.
        
        Generate a concise and professional follow-up email based on the meeting notes, summaries, action items, owners, and deadlines provided.
        
        Meeting Data:
        ${JSON.stringify(meetingData, null, 2)}
        
        Return ONLY a JSON object with "subject" and "body" fields. Use clean formatting with line breaks in the body.` 
      }] 
    }],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          subject: { type: Type.STRING },
          body: { type: Type.STRING }
        },
        required: ["subject", "body"]
      }
    }
  });

  return JSON.parse(result.text || "{}");
}

export async function analyzeMeetingNotes(text: string): Promise<MeetingAnalysis> {
  const ai = getAI();
  const result = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [{ role: "user", parts: [{ text: `You are an expert meeting assistant.

Analyze the provided notes and return a structured JSON object.

Notes:
${text}

Return only valid JSON.` }] }],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: { type: Type.STRING },
          key_points: { type: Type.ARRAY, items: { type: Type.STRING } },
          action_items: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                task: { type: Type.STRING },
                owner: { type: Type.STRING },
                deadline: { type: Type.STRING },
                priority: { type: Type.STRING, enum: ["low", "medium", "high"] }
              },
              required: ["task", "owner", "deadline", "priority"]
            }
          },
          follow_up_email: { type: Type.STRING },
          sentiment: { type: Type.STRING },
          meeting_topics: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["summary", "key_points", "action_items", "follow_up_email", "sentiment", "meeting_topics"]
      }
    }
  });

  try {
    const responseText = result.text || "";
    return JSON.parse(responseText);
  } catch (error) {
    console.error("Failed to parse Gemini response:", result.text);
    throw new Error("Failed to process meeting notes. Please try again.");
  }
}
