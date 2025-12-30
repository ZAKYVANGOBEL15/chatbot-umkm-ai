import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * AI Service using Mistral AI or Google Gemini
 * Provides extremely stable and reliable access for production UMKM Chatbot.
 */

export async function generateAIResponse(
    userMessage: string,
    businessContext: { name: string; description: string; products: any[] },
    history: { role: string; text: string }[]
) {
    // Get API keys safely for both Server (process.env) and Client (import.meta.env)
    let MISTRAL_API_KEY = '';
    let GEMINI_API_KEY = '';

    try {
        // 1. Try Node.js process.env first (Server side)
        if (typeof process !== 'undefined' && process.env) {
            MISTRAL_API_KEY = process.env.MISTRAL_API_KEY || process.env.VITE_MISTRAL_API_KEY || '';
            GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || '';
        }

        // 2. Fallback to import.meta.env (Client side)
        // We use a string check to avoid syntax errors in environments that don't support it
        if (!MISTRAL_API_KEY || !GEMINI_API_KEY) {
            const meta = (import.meta as any);
            if (meta && meta.env) {
                MISTRAL_API_KEY = MISTRAL_API_KEY || meta.env.MISTRAL_API_KEY || meta.env.VITE_MISTRAL_API_KEY || '';
                GEMINI_API_KEY = GEMINI_API_KEY || meta.env.GEMINI_API_KEY || meta.env.VITE_GEMINI_API_KEY || '';
            }
        }
    } catch (e) {
        console.warn("Env check warning:", e);
    }

    const productList = (businessContext.products || [])
        .map(p => `- ${p.name} (Rp ${Number(p.price).toLocaleString('id-ID')}): ${p.description}`)
        .join('\n');

    const systemInstructions = `
Anda adalah Customer Service untuk "${businessContext.name}".
Waktu saat ini: ${new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })}.
Deskripsi Bisnis: ${businessContext.description || "UMKM Indonesia."}
Daftar Produk:
${productList || "Hubungi kami untuk informasi produk lengkap."}

Tugas: Jawab pertanyaan pelanggan dengan ramah, singkat, dan gunakan data di atas. Jangan mengarang informasi.
Gunakan gaya bahasa yang akrab (Kak/Sist).
`.trim();

    // 1. Try Mistral AI first (User Preference)
    if (MISTRAL_API_KEY) {
        try {
            const messages = [
                { role: "system", content: systemInstructions },
                ...history.map(h => ({
                    role: h.role === "user" ? "user" : "assistant",
                    content: h.text
                })),
                { role: "user", content: userMessage }
            ];

            const response = await fetch("https://api.mistral.ai/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${MISTRAL_API_KEY}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    model: "mistral-small-latest",
                    messages: messages,
                    temperature: 0.7,
                    max_tokens: 500
                })
            });

            const data = await response.json();

            if (data.error) {
                console.error("Mistral Error:", data.error);
                return `Error Mistral: ${data.error.message || "Unknown error"}`;
            }

            if (data.choices && data.choices[0]?.message?.content) {
                return data.choices[0].message.content;
            }
        } catch (mistralError: any) {
            console.error("Mistral AI Fetch Error:", mistralError);
            // Fallback to Gemini if Mistral fails
        }
    }

    // 2. Try Google Gemini as fallback
    if (GEMINI_API_KEY) {
        try {
            const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

            const chatHistory = history.map(h => ({
                role: h.role === "model" ? "model" : "user",
                parts: [{ text: h.text }]
            }));

            const chat = model.startChat({
                history: chatHistory,
                systemInstruction: systemInstructions,
            });

            const result = await chat.sendMessage(userMessage);
            const responseText = result.response.text();

            if (responseText) return responseText;
        } catch (geminiError: any) {
            console.error("Gemini Error:", geminiError);
        }
    }

    return "Error: API Key AI belum dikonfigurasi. Pastikan GEMINI_API_KEY atau MISTRAL_API_KEY sudah ada di Environment Variables.";
}
