
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const summarizeFeedback = async (message: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Summarize this user feedback in 2 sentences: "${message}"`,
    });
    return response.text || "Xulosa mavjud emas.";
  } catch (error) {
    return "AI xato berdi.";
  }
};

export const getResearchAdvice = async (query: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: query,
      config: {
        systemInstruction: `Siz ARM (Axborot-resurs markazi) professional yordamchisiz. 
        Sizning vazifangiz talabalarga quyidagi ma'lumotlar asosida yordam berish:
        1. Ish vaqti: Dushanba-Juma 08:00-20:00, Shanba 09:00-17:00. Yakshanba - dam olish.
        2. Bo'limlar: Elektron Katalog, Raqamli ARM (PDFlar), Ilmiy Yo'l Xarita (Scopus/WoS), Xizmatlar (O'quv zali bron qilish).
        3. Scopus/WoS: Maqola yozish, jurnal tanlash va profil yaratishda metodik ko'mak.
        4. Kitob qidirish: Foydalanuvchini har doim "Katalog" bo'limiga yo'naltiring.
        Javoblaringiz qisqa, do'stona va professional o'zbek tilida bo'lishi shart.`,
      },
    });
    return response.text || "Kechirasiz, hozir javob bera olmayman. Mutaxassis bilan bog'laning.";
  } catch (error) {
    return "Tizimda vaqtinchalik uzilish yuz berdi.";
  }
};

export const getManagementInsights = async (stats: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Siz ARM rahbariyati uchun strategik maslahatchisiz. Quyidagi kutubxona statistikasi asosida fondni shakllantirish va xizmat sifatini oshirish bo'yicha 3 ta muhim tavsiya bering: "${stats}". Javob o'zbek tilida, professional bo'lsin.`,
    });
    return response.text || "Tavsiyalar tayyorlashda xatolik.";
  } catch (error) {
    return "AI tahlili vaqtincha imkonsiz.";
  }
};
