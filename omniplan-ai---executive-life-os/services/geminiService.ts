
import { GoogleGenAI } from "@google/genai";

export const callGeminiSchedule = async (todoText: string): Promise<any[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  const prompt = `
    I have the following to-do list for today: "${todoText}".
    Please create a realistic schedule starting around 9 AM.
    Return ONLY a raw JSON array of objects. Do not include markdown formatting or backticks.
    Each object should have:
    - title: string
    - start: number (decimal hour, e.g., 9 or 13.5)
    - duration: number (decimal hour, e.g., 1 or 0.5)
    
    Example output format:
    [{"title": "Morning Coffee & Plan", "start": 9, "duration": 0.5}, {"title": "Work Block", "start": 9.5, "duration": 2}]
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{ parts: [{ text: prompt }] }],
      config: {
          temperature: 0.7,
      }
    });

    const text = response.text || "";
    let jsonMatch = text.match(/\[[\s\S]*\]/);
    const cleanText = jsonMatch ? jsonMatch[0] : text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    return JSON.parse(cleanText);
  } catch (error) {
    console.error("Gemini API Error:", error);
    return [];
  }
};

export const predictMainEvent = async (history: string[], currentTodos: string[]): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  const prompt = `
    You are an executive performance coach. Based on the user's past focus areas and current tasks, predict the single most high-impact "Main Event" or theme for today.
    
    Past Themes: ${history.join(", ")}
    Current Tasks: ${currentTodos.join(", ")}
    
    Return ONLY the suggested Main Event title (max 60 characters). No explanation or quotes.
    Example: "Deep Work: Architecture Scalability Review" or "Strategic Networking: Investor Luncheon"
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{ parts: [{ text: prompt }] }],
      config: { temperature: 0.8 }
    });
    return response.text?.trim() || "Deep Work Session";
  } catch (error) {
    console.error("Predict Error:", error);
    return "High Impact Work";
  }
};
