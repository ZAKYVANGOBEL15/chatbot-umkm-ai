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

        // 2. Fetch URL Content via Jina Reader (Fix for SPAs)
        // Jina Reader converts JS-heavy sites into clean markdown for LLMs
        const targetUrl = url.startsWith('http') ? url : `https://${url}`;
        const readerUrl = `https://r.jina.ai/${targetUrl}`;

        const response = await fetch(readerUrl);
        const mdContent = await response.text();

        // 3. Limit content size
        const cleanContent = mdContent
            .substring(0, 8000) // Limit to 8k chars for AI efficiency
            .trim();

        if (cleanContent.length < 50) {
            return res.status(400).json({ error: 'Konten website tidak ditemukan atau terlalu sedikit.' });
        }

        // 4. Send to Mistral for Extraction
        const apiKey = process.env.MISTRAL_API_KEY || process.env.VITE_MISTRAL_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ error: 'MISTRAL_API_KEY is not configured.' });
        }

        const prompt = `
Context: Teks berikut dalam format Markdown diambil dari sebuah website bisnis.
Tujuan: Ekstrak informasi bisnis secara detail untuk melatih AI Chatbot.

Teks Website:
"""
${cleanContent}
"""

Tugas:
Berikan output dalam format JSON murni (tanpa markdown code block) dengan struktur:
{
  "businessName": "Nama Bisnis",
  "businessDescription": "Deskripsi lengkap layanan, jam buka, keunggulan, dan identitas bisnis lainnya.",
  "products": [
    { "name": "Nama Produk/Layanan", "price": 0, "description": "Deskripsi singkat yang membantu asisten menjawab pertanyaan pelanggan" }
  ]
}
Catatan Penting:
1. Ekstrak sebanyak mungkin layanan/produk yang ditemukan.
2. Jika harga tidak ada, tulis 0.
3. Gunakan Bahasa Indonesia yang ramah (Kak/Sist).
4. Pastikan JSON valid.
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
