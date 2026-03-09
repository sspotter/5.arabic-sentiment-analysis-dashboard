import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function analyzeArabicSentimentBatch(comments: string[]): Promise<{ sentiment: 'positive' | 'negative' | 'neutral', score: number }[]> {
  const prompt = `Analyze the sentiment of the following Arabic comments. Return a JSON array of objects with 'sentiment' (positive, negative, or neutral) and 'score' (-1.0 to 1.0).
  
Comments:
${comments.map((c, i) => `${i}: ${c}`).join('\n')}
`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              sentiment: { type: Type.STRING, description: "positive, negative, or neutral" },
              score: { type: Type.NUMBER, description: "Sentiment score from -1.0 to 1.0" }
            }
          }
        }
      }
    });

    const text = response.text;
    if (text) {
      return JSON.parse(text);
    }
    return comments.map(() => ({ sentiment: 'neutral', score: 0 }));
  } catch (error) {
    console.error("Error analyzing sentiment:", error);
    // Fallback to neutral on error
    return comments.map(() => ({ sentiment: 'neutral', score: 0 }));
  }
}
