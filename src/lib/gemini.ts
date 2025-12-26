import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * AI Service using Direct Google Gemini SDK
 * Provides faster and more stable access for production UMKM Chatbot.
 */

export async function generateAIResponse(
    userMessage: string,
    businessContext: { name: string; description: string; products: any[] },
    history: { role: string; text: string }[]
) {
    // Get API key from environment
    const apiKey = (typeof process !== 'undefined' && process.env?.VITE_GEMINI_API_KEY) ||
        ((import.meta as any).env?.VITE_GEMINI_API_KEY);

    if (!apiKey) {
        return "Error: API Key Gemini belum dikonfigurasi. Silakan tambahkan VITE_GEMINI_API_KEY di environment variables.";
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

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

    try {
        // Prepare chat history for the SDK format
        const chat = model.startChat({
            history: [
                {
                    role: "user",
                    parts: [{ text: systemInstructions + "\n\nTunggu pertanyaan saya." }],
                },
                {
                    role: "model",
                    parts: [{ text: "Siap Kak! Saya CS " + businessContext.name + ". Ada yang bisa saya bantu?" }],
                },
                ...history.map(h => ({
                    role: h.role === "user" ? "user" : "model",
                    parts: [{ text: h.text }]
                }))
            ],
        });

        const result = await chat.sendMessage(userMessage);
        const responseText = result.response.text();

        return responseText;
    } catch (error: any) {
        console.error("Gemini API Error:", error);

        if (error.message?.includes('429')) {
            return "Maaf, kuota tanya-jawab sedang penuh (Rate Limit). Silakan coba lagi sebentar lagi ya Kak!";
        }

        return `Maaf, gagal menyambung ke otak AI. (${error.message})`;
    }
}
