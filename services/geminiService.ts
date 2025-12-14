import { GoogleGenAI } from "@google/genai";

// --- SOZLAMALAR ---
// Siz taqdim etgan kalit. Bu kalit kod bilan birga yuradi.
const MANUAL_API_KEY = "AIzaSyCjM7h4hJftWfTpGuM7lFfAIAHUkUfMCbs"; 

let ai: GoogleGenAI | null = null;

const initGemini = () => {
    try {
        // Kalit borligini tekshiramiz
        if (MANUAL_API_KEY && MANUAL_API_KEY.length > 10) {
            ai = new GoogleGenAI({ apiKey: MANUAL_API_KEY });
        }
    } catch (e) {
        console.warn("AI init warning (Ignored for offline mode):", e);
    }
};

// Ilovani ishga tushirish
initGemini();

// --- OFFLINE (ZAXIRA) JAVOBLAR TIZIMI ---
// Bu funksiya API ishlamagan har qanday holatda ishga tushadi
const getOfflineResponse = (text: string): string => {
    const t = text.toLowerCase().trim();
    
    // Salomlashish
    if (t.includes('salom') || t.includes('assalom') || t.includes('hormang') || t.includes('hayrli')) {
        return "Assalomu alaykum! JizPI Axborot-Resurs Markazi virtual yordamchisiman. Sizga qanday yordam bera olaman?";
    }
    
    // Ish vaqti
    if (t.includes('vaqt') || t.includes('soat') || t.includes('ochiq') || t.includes('ishlay') || t.includes('qachon')) {
        return "Kutubxonamiz ish vaqti: Dushanba-Shanba kunlari soat 08:30 dan 18:00 gacha. Yakshanba - dam olish kuni.";
    }
    
    // Kitob qidirish
    if (t.includes('kitob') || t.includes('qidir') || t.includes('bor') || t.includes('topish') || t.includes('darslik')) {
        return "Kitoblarni qidirish uchun yuqoridagi menyudan 'Elektron Katalog' bo'limiga o'ting. U yerda nom yoki muallif bo'yicha qidirishingiz mumkin.";
    }
    
    // Manzil
    if (t.includes('manzil') || t.includes('qaer') || t.includes('joy') || t.includes('lokatsiya')) {
        return "Bizning manzil: Jizzax shahri, Islom Karimov ko'chasi 4-uy. Jizzax Politexnika Instituti Bosh binosi, 1-qavat.";
    }
    
    // Rahmat
    if (t.includes('rahmat') || t.includes('sog') || t.includes('tashakkur')) {
        return "Arzimaydi! Bilim olishdan charchamang. Yana savollaringiz bo'lsa marhamat.";
    }

    // O'zi haqida
    if (t.includes('kim') || t.includes('nima') || t.includes('san')) {
        return "Men JizPI Axborot-Resurs Markazining maxsus sun'iy intellekt yordamchisiman.";
    }

    // Tushunarsiz so'rovlar uchun umumiy javob
    return "Uzr, hozircha server bilan to'liq aloqa o'rnatilmadi, lekin men sizga yordam berishga harakat qilaman. Iltimos, kutubxona ish vaqti, manzil yoki kitoblar haqida so'rang.";
};

// Matnni tozalash funksiyasi (inglizcha fikrlarni olib tashlash)
const cleanResponse = (text: string): string => {
    if (!text) return "";
    // "_thought" bilan boshlanib "_" bilan tugaydigan bloklarni olib tashlash
    let cleaned = text.replace(/^_thought[\s\S]*?(_\s*|_\n)/i, '').trim();
    // Agar yana qandaydir "Thought:" kabi so'zlar qolgan bo'lsa
    cleaned = cleaned.replace(/^thought:[\s\S]*?\n/i, '').trim();
    return cleaned;
};

export const generateLibraryResponse = async (
  prompt: string,
  history: { role: 'user' | 'model'; text: string }[] = []
): Promise<string> => {
  // 1. Agar AI obyekti yaratilmagan bo'lsa, darhol offline javob qaytaramiz
  if (!ai) {
      return getOfflineResponse(prompt);
  }

  try {
    const model = 'gemini-2.5-flash';

    const chat = ai.chats.create({
      model: model,
      config: {
        systemInstruction: `Siz Jizzax Politexnika Instituti Axborot-Resurs Markazi (Kutubxona)ning rasmiy sun'iy intellekt maslahatchisisiz.
        
        QAT'IY QOIDALAR:
        1. Javobni faqat O'ZBEK tilida bering.
        2. Hech qanday ichki fikrlash jarayonini (thought process, reasoning) yozmang.
        3. To'g'ridan-to'g'ri foydalanuvchining savoliga javob bering.
        4. Javoblaringiz muloyim va qisqa bo'lsin.
        5. Kitoblar haqida so'ralsa, umumiy ma'lumot bering.
        6. Ish vaqti: Dushanba-Shanba (08:30 - 18:00).`,
      },
      history: history.map(h => ({
        role: h.role,
        parts: [{ text: h.text }]
      }))
    });

    const result = await chat.sendMessage({ message: prompt });
    
    if (!result.text) throw new Error("Empty response");
    
    // Javobni tozalab qaytaramiz
    return cleanResponse(result.text);
    
  } catch (error: any) {
    // 2. MUHIM: API dan har qanday xatolik (400, 403, 500, Internet yo'q) kelsa,
    // Foydalanuvchiga XATO KO'RSATMAYMIZ.
    console.warn("AI Error (Falling back to internal mode):", error.message);
    
    return getOfflineResponse(prompt);
  }
};