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

        // 3. Smart content selection: Get Head and Tail to ensure Footer is captured
        // Many footers are at the end of long pages.
        let cleanContent = mdContent.trim();
        if (cleanContent.length > 15000) {
            const head = cleanContent.substring(0, 10000);
            const tail = cleanContent.substring(cleanContent.length - 5000);
            cleanContent = `${head}\n\n...[konten tengah dipotong]...\n\n${tail}`;
        }

        if (cleanContent.length < 50) {
            return res.status(400).json({ error: 'Konten website tidak ditemukan atau terlalu sedikit.' });
        }

        // 4. Send to Mistral for Extraction
        const apiKey = process.env.MISTRAL_API_KEY || process.env.VITE_MISTRAL_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ error: 'MISTRAL_API_KEY is not configured.' });
        }

        const prompt = `
Context: Teks berikut dalam format Markdown diambil dari sebuah website bisnis (Landing Page).
Tujuan: Ekstrak informasi bisnis secara SANGAT DETAIL untuk melatih AI Chatbot agar bisa menjawab pertanyaan pelanggan layaknya asisten ahli.

Teks Website:
"""
${cleanContent}
"""

Tugas:
Berikan output dalam format JSON murni (tanpa markdown code block) dengan struktur:
{
  "businessName": "Nama Bisnis",
  "businessDescription": "Deskripsi super lengkap. Sertakan: 1) Siapa kami (tentang bisnis), 2) Keunggulan/Filosofi, 3) Info Tim Ahli/Dokter (jika ada), 4) Info Fasilitas/Galeri, 5) Jam operasional & Lokasi (jika ada). Buat narasi yang profesional.",
  "instagram": "Username Instagram atau URL lengkap (jika ditemukan)",
  "facebook": "Nama Halaman FB atau URL lengkap (jika ditemukan)",
  "businessEmail": "Alamat Email Bisnis (jika ditemukan)",
  "products": [
    { "name": "Nama Produk/Layanan", "price": 0, "description": "Deskripsi detail tentang manfaat, prosedur, atau fitur layanan tersebut." }
  ]
}
Catatan Penting:
1. EKSTRAK SEMUA layanan/produk yang ditemukan. Jangan ada yang terlewat.
2. Jika ada kategori (misal: Optical Radiance, Dermal Vitality), masukkan tiap item di bawahnya sebagai produk terpisah.
3. Cari link Instagram, Facebook, dan Email di bagian Header atau Footer.
4. Gunakan Bahasa Indonesia yang sangat ramah dan elegan (Kak/Sist).
5. Jika harga tidak ada, tulis 0.
6. Pastikan JSON valid dan deskripsi bisnis sangat informatif.
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
