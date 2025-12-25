// This is a Vercel Serverless Function (Edge Runtime preferred)
// Path: api/webhook.ts

export const config = {
    runtime: 'edge',
};

export default async function handler(req: Request) {
    const url = new URL(req.url);

    // 1. Handle Webhook Verification (for Meta)
    if (req.method === 'GET') {
        const mode = url.searchParams.get('hub.mode');
        const token = url.searchParams.get('hub.verify_token');
        const challenge = url.searchParams.get('hub.challenge');

        if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
            return new Response(challenge, { status: 200 });
        }
        return new Response('Forbidden', { status: 403 });
    }

    // 2. Handle Incoming Messages
    if (req.method === 'POST') {
        try {
            const data = await req.json();

            // WhatsApp message structure
            const message = data.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
            const businessId = data.entry?.[0]?.changes?.[0]?.value?.metadata?.phone_number_id;

            if (message && message.type === 'text') {
                const from = message.from; // Customer phone number
                const text = message.text.body;

                // LOGIC: 
                // 1. Cari user/bisnis berdasarkan phone_number_id atau metadata lain.
                // 2. Ambil context (produk/deskripsi) dari Firestore Admin.
                // 3. Panggil Gemini AI.
                // 4. Kirim balik pesan ke WhatsApp menggunakan Cloud API.

                console.log(`Received message from ${from}: ${text}`);

                // UNTUK MVP: Kita butuh database yang memetakan meta_business_id -> firebase_user_id
            }

            return new Response('OK', { status: 200 });
        } catch (e) {
            console.error('Webhook error:', e);
            return new Response('Internal Error', { status: 500 });
        }
    }

    return new Response('Method Not Allowed', { status: 405 });
}
