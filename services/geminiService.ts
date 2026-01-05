
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

// Always use const ai = new GoogleGenAI({apiKey: process.env.API_KEY});

export const summarizeFeedback = async (message: string): Promise<string> => {
  try {
    // Create a new instance right before the call to ensure the latest API key is used
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    // Calling generateContent with model and contents directly
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Summarize this user feedback in 2 sentences: "${message}"`,
    });
    // response.text is a property, not a method
    return response.text || "Xulosa mavjud emas.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "AI tahlili vaqtincha imkonsiz.";
  }
};

export const getResearchAdvice = async (query: string): Promise<string> => {
  try {
    // Create a new instance right before the call to ensure the latest API key is used
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: query,
      config: {
        systemInstruction: `Siz ARM (Axborot-resurs markazi) professional yordamchisiz. 
        Javoblaringiz qisqa, do'stona va professional o'zbek tilida bo'lishi shart.
        Foydalanuvchiga kutubxona xizmatlari, Scopus va ilmiy maqolalar bo'yicha yordam bering.`,
      },
    });
    return response.text || "Savolga javob topilmadi.";
  } catch (error) {
    return "Tizimda uzilish yuz berdi.";
  }
};

export const getManagementInsights = async (stats: string): Promise<string> => {
  try {
    // Create a new instance right before the call to ensure the latest API key is used
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Quyidagi kutubxona statistikasi asosida 3 ta strategik tavsiya bering: "${stats}"`,
    });
    return response.text || "Tavsiyalar tayyor emas.";
  } catch (error) {
    return "AI xizmati vaqtincha o'chirilgan.";
  }
};
