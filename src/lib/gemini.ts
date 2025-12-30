/**
 * AI Service using Mistral AI
 * Provides stable access for both Dashboard Simulator and WhatsApp Webhook.
 */

export async function generateAIResponse(
    userMessage: string,
    businessContext: { name: string; description: string; products: any[] },
    history: { role: string; text: string }[]
) {
    // Get API key safely for both Server (Node) and Client (Browser)
    let apiKey = '';

    if (typeof process !== 'undefined' && process.env) {
        apiKey = process.env.MISTRAL_API_KEY || process.env.VITE_MISTRAL_API_KEY || '';
    }

    // Fallback for browser environment (Vite)
    if (!apiKey && typeof window !== 'undefined') {
        // @ts-ignore
        const meta = import.meta as any;
        apiKey = meta.env?.VITE_MISTRAL_API_KEY || '';
    }

    if (!apiKey) {
        return "Error: API Key Mistral belum dikonfigurasi. Hubungi Admin.";
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
                "Authorization": `Bearer ${apiKey}`,
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
            return `Maaf, terjadi masalah pada layanan AI: ${data.error.message || "Unknown error"}`;
        }

        return data.choices?.[0]?.message?.content || "Maaf, saya tidak mendapatkan jawaban.";
    } catch (error: any) {
        console.error("AI Fetch Error:", error);
        return `Maaf, gagal menyambung ke otak AI. (${error.message})`;
    }
}
