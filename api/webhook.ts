import { generateAIResponse } from '../src/lib/gemini.js';
import admin from 'firebase-admin';
import crypto from 'crypto';

// Helper to initialize Firebase safely using Admin SDK
const getDb = () => {
    // Safety check for ESM environment
    const apps = admin.apps || [];

    if (apps.length === 0) {
        const projectId = process.env.FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID;
        const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
        const privateKey = process.env.FIREBASE_PRIVATE_KEY;

        console.log(`[Firebase] Initializing... Project: ${projectId}, Email: ${clientEmail ? 'EXISTS' : 'MISSING'}, Key: ${privateKey ? 'EXISTS' : 'MISSING'}`);

        if (projectId && clientEmail && privateKey) {
            try {
                admin.initializeApp({
                    credential: admin.credential.cert({
                        projectId,
                        clientEmail,
                        privateKey: privateKey.replace(/\\n/g, '\n'),
                    }),
                });
                console.log('[Firebase] Initialized with Service Account');
            } catch (initErr: any) {
                console.error('[Firebase] Init Error:', initErr.message);
            }
        } else {
            // Fallback for local development or missing envs
            admin.initializeApp({
                projectId: projectId
            });
            console.warn('[Firebase] Initialized with Project ID only (no Service Account)');
        }
    }
    return admin.firestore();
};

// Helper to verify Meta's X-Hub-Signature-256
const verifySignature = (payload: string, signature: string, appSecret: string) => {
    const hash = crypto
        .createHmac('sha256', appSecret)
        .update(payload)
        .digest('hex');
    const expectedSignature = `sha256=${hash}`;
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
};

export default async function handler(req: any, res: any) {
    console.log(`[Webhook] Received ${req.method} request`);

    // 1. Handle Webhook Verification (for Meta)
    if (req.method === 'GET') {
        const mode = req.query['hub.mode'];
        const token = req.query['hub.verify_token'];
        const challenge = req.query['hub.challenge'];

        console.log(`[Webhook] Verification attempt - Token: ${token}`);

        const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN;

        if (mode === 'subscribe' && token === verifyToken) {
            console.log('[Webhook] Verification successful');
            return res.status(200).send(challenge);
        }

        console.warn(`[Webhook] Verification failed. Expected: ${verifyToken}, Got: ${token}`);
        return res.status(403).send('Forbidden');
    }

    // 2. Handle Incoming Messages
    if (req.method === 'POST') {
        try {
            const signature = req.headers['x-hub-signature-256'] as string;
            const appSecret = process.env.WHATSAPP_APP_SECRET;

            if (appSecret && signature) {
                // Verify signature using the raw body
                // req.body might be already parsed, for Vercel Serverless we might need raw body
                const payload = JSON.stringify(req.body);
                if (!verifySignature(payload, signature, appSecret)) {
                    console.warn('[Webhook] Invalid signature');
                    return res.status(401).send('Invalid Signature');
                }
                console.log('[Webhook] Signature verified');
            } else if (!appSecret) {
                console.warn('[Webhook] WHATSAPP_APP_SECRET is not set. Skipping signature validation.');
            }

            const db = getDb();
            const data = req.body;

            // Extract message and business phone number ID
            const value = data.entry?.[0]?.changes?.[0]?.value;
            const message = value?.messages?.[0];
            const phoneNumberId = value?.metadata?.phone_number_id;

            if (message && message.type === 'text' && phoneNumberId) {
                const from = message.from;
                const text = message.text.body;

                console.log(`[WhatsApp] Message from ${from}: ${text} (ID: ${phoneNumberId})`);

                // A. Find the user associated with this Phone Number ID
                const usersRef = db.collection('users');
                const querySnapshot = await usersRef.where('whatsappPhoneNumberId', '==', phoneNumberId).get();

                if (!querySnapshot.empty) {
                    const userDoc = querySnapshot.docs[0];
                    const userData = userDoc.data();
                    const userId = userDoc.id;

                    const accessToken = userData.whatsappAccessToken;

                    // B. Fetch Products for this user
                    const productsSnap = await db.collection('users').doc(userId).collection('products').get();
                    const products = productsSnap.docs.map(d => d.data());

                    const businessContext = {
                        name: userData.businessName || 'Toko Kami',
                        description: userData.businessDescription || 'Toko UMKM.',
                        products: products
                    };

                    // C. Get AI Response
                    const reply = await generateAIResponse(text, businessContext, []);

                    // D. Send Message Back to WhatsApp
                    if (accessToken) {
                        const waResponse = await fetch(`https://graph.facebook.com/v17.0/${phoneNumberId}/messages`, {
                            method: 'POST',
                            headers: {
                                'Authorization': `Bearer ${accessToken}`,
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                messaging_product: 'whatsapp',
                                to: from,
                                text: { body: reply }
                            })
                        });
                        const waData = await waResponse.json();
                        console.log(`[WhatsApp] Reply sent to ${from}`, waData);
                    }
                } else {
                    console.warn(`[WhatsApp] No user found for Phone Number ID: ${phoneNumberId}`);
                }
            }

            return res.status(200).send('OK');
        } catch (e: any) {
            console.error('[Webhook Error]', e.message);
            return res.status(500).json({ error: 'Internal Error', message: e.message });
        }
    }

    return res.status(405).send('Method Not Allowed');
}
