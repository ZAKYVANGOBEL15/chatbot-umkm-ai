/**
 * AI Service using OpenRouter
 * Provides a unified interface to access multiple models (Gemini, Llama, etc.)
 */

export async function generateAIResponse(
    userMessage: string,
    businessContext: { name: string; description: string; products: any[] },
    history: { role: string; text: string }[]
) {
    // Support both Vite (import.meta.env) and Node.js (process.env)
    // Support both Vite (import.meta.env) and Node.js (process.env)
    const env = (import.meta as any).env || {};
    const apiKey = env.VITE_OPENROUTER_API_KEY || (typeof process !== 'undefined' ? process.env.VITE_OPENROUTER_API_KEY : '');

    if (!apiKey) {
        return "Error: API Key OpenRouter belum dikonfigurasi.";
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

    // Combine history and new message for the payload
    const messages = [
        { role: "system", content: systemInstructions },
        ...history.map(h => ({
            role: h.role === "user" ? "user" : "assistant",
            content: h.text
        })),
        { role: "user", content: userMessage }
    ];

    try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json",
                "HTTP-Referer": "http://localhost:5173", // Required by OpenRouter
                "X-Title": "UMKM Chatbot AI", // Optional, for OpenRouter dashboard
            },
            body: JSON.stringify({
                model: "google/gemini-2.0-flash-exp:free",
                messages: messages,
                // Fallback list using strictly :free models for zero-balance accounts
                models: [
                    "google/gemini-2.0-flash-exp:free",
                    "google/gemini-flash-1.5:free",
                    "meta-llama/llama-3.3-70b-instruct:free"
                ]
            })
        });

        const data = await response.json();

        if (data.error) {
            console.error("OpenRouter Error:", data.error);
            return `Maaf, terjadi masalah pada layanan AI: ${data.error.message || "Unknown error"}`;
        }

        return data.choices[0].message.content;
    } catch (error: any) {
        console.error("AI Fetch Error:", error);
        return `Maaf, gagal menyambung ke otak AI. Cek koneksi internet Anda. (${error.message})`;
    }
}
