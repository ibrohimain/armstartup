import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

export default async function handler(req, res) {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ text: "Savol yuborilmadi." });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });

    res.status(200).json({
      text: response.text || "Javob topilmadi.",
    });
  } catch (error) {
    res.status(500).json({
      text: "AI bilan bog‘lanishda xatolik yuz berdi.",
    });
  }
}
