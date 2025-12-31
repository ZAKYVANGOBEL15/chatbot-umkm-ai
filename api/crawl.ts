export default async function handler(req: any, res: any) {
    // 1. Handle CORS
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const { url } = req.body || {};

        if (!url) {
            return res.status(400).json({ error: 'Missing URL' });
        }

        // 2. Fetch URL Content
        const response = await fetch(url);
        const html = await response.text();

        // 3. Basic Sanitization (Remove script/style)
        const cleanContent = html
            .replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gim, "")
            .replace(/<style\b[^>]*>([\s\S]*?)<\/style>/gim, "")
            .replace(/<[^>]*>?/gm, " ") // Remove all HTML tags
            .replace(/\s+/g, " ") // Clean extra whitespace
            .trim()
            .substring(0, 10000); // Limit to first 10k chars

        // 4. Send to Mistral for Extraction
        const apiKey = process.env.MISTRAL_API_KEY || process.env.VITE_MISTRAL_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ error: 'MISTRAL_API_KEY is not configured.' });
        }

        const prompt = `
Context: Teks berikut diambil dari sebuah website bisnis.
Tujuan: Ekstrak informasi bisnis untuk melatih AI Chatbot.

Teks Website:
"""
${cleanContent}
"""

Tugas:
Berikan output dalam format JSON murni (tanpa markdown code block) dengan struktur:
{
  "businessName": "Nama Bisnis",
  "businessDescription": "Deskripsi singkat layanan, jam buka, dan identitas bisnis",
  "products": [
    { "name": "Nama Produk/Layanan", "price": 0, "description": "Deskripsi singkat" }
  ]
}
Catatan: Jika harga tidak ditemukan, tulis 0. Gunakan Bahasa Indonesia yang ramah.
`.trim();

        const aiResponse = await fetch("https://api.mistral.ai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "mistral-small-latest",
                messages: [{ role: "user", content: prompt }],
                temperature: 0.1,
                response_format: { type: "json_object" }
            })
        });

        const data = await aiResponse.json();

        if (data.error) {
            return res.status(500).json({ error: `AI Extraction Error: ${data.error.message}` });
        }

        let extracted = data.choices[0]?.message?.content;

        // Safety parse
        try {
            if (typeof extracted === 'string') {
                extracted = JSON.parse(extracted);
            }
        } catch (e) {
            console.error('Parse Error:', extracted);
        }

        return res.status(200).json(extracted);

    } catch (error: any) {
        console.error('Crawl API Fatal Error:', error);
        return res.status(500).json({
            error: 'Internal Server Error',
            message: error.message
        });
    }
}
