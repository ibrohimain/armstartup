// src/services/geminiService.ts

export const getResearchAdvice = async (query: string): Promise<string> => {
  const res = await fetch("/api/gemini", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt: query }),
  });

  const data = await res.json();
  return data.text;
};

export const summarizeFeedback = async (message: string): Promise<string> => {
  const res = await fetch("/api/gemini", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      prompt: `Summarize this feedback in 2 sentences: "${message}"`,
    }),
  });

  const data = await res.json();
  return data.text;
};

export const getManagementInsights = async (stats: string): Promise<string> => {
  const res = await fetch("/api/gemini", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      prompt: `Quyidagi ARM statistikasi asosida 3 ta muhim strategik tavsiya bering: "${stats}"`,
    }),
  });

  const data = await res.json();
  return data.text;
};
