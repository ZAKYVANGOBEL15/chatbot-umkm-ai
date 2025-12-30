import { generateAIResponse } from '../src/lib/gemini.js';
import * as admin from 'firebase-admin';

// Helper to initialize Firebase safely using Admin SDK
const getDb = () => {
    if (!admin.apps.length) {
        const projectId = process.env.FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID;
        const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
        const privateKey = process.env.FIREBASE_PRIVATE_KEY;

        if (projectId && clientEmail && privateKey) {
            // Admin Mode (Service Account)
            admin.initializeApp({
                credential: admin.credential.cert({
                    projectId,
                    clientEmail,
                    privateKey: privateKey.replace(/\\n/g, '\n'),
                }),
            });
            console.log('[Firebase] Initialized with Service Account');
        } else {
            // Fallback to project ID (only works in some environments or with local emulator)
            admin.initializeApp({
                projectId: projectId
            });
            console.warn('[Firebase] Initialized with Project ID only (no Service Account)');
        }
    }
    return admin.firestore();
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
