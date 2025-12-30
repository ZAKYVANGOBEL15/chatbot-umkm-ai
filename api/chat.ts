export default async function handler(req: any, res: any) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const { message, history, businessContext } = req.body || {};

        if (!message || !businessContext) {
            return res.status(400).json({ error: 'Missing message or businessContext' });
        }

        // 1. Get API Key safely
        const apiKey = process.env.MISTRAL_API_KEY || process.env.VITE_MISTRAL_API_KEY;

        if (!apiKey) {
            return res.status(500).json({ error: 'MISTRAL_API_KEY is not configured in Vercel environment variables.' });
        }

        // 2. Prepare System Instructions
        const productList = (businessContext.products || [])
            .map((p: any) => `- ${p.name} (Rp ${Number(p.price).toLocaleString('id-ID')}): ${p.description}`)
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

        const messages = [
            { role: "system", content: systemInstructions },
            ...(history || []).map((h: any) => ({
                role: h.role === "user" ? "user" : "assistant",
                content: h.text
            })),
            { role: "user", content: message }
        ];

        // 3. Call Mistral API directly from here
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
            return res.status(500).json({ error: `Mistral Error: ${data.error.message}` });
        }

        const reply = data.choices?.[0]?.message?.content || "Maaf, saya tidak mendapatkan jawaban.";
        return res.status(200).json({ reply });

    } catch (error: any) {
        console.error('Chat API Fatal Error:', error);
        return res.status(500).json({
            error: 'Internal Server Error',
            message: error.message
        });
    }
}
