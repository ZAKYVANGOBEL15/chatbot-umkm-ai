import { generateAIResponse } from '../src/lib/gemini.js';
import { initializeApp, getApp, getApps } from 'firebase/app';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';

// Helper to initialize Firebase safely
const getDb = () => {
    const firebaseConfig = {
        apiKey: process.env.VITE_FIREBASE_API_KEY || process.env.FIREBASE_API_KEY,
        authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || process.env.FIREBASE_AUTH_DOMAIN,
        projectId: process.env.VITE_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID,
        storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || process.env.FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || process.env.FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.VITE_FIREBASE_APP_ID || process.env.FIREBASE_APP_ID
    };

    const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    return getFirestore(app);
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
                const usersRef = collection(db, 'users');
                const q = query(usersRef, where('whatsappPhoneNumberId', '==', phoneNumberId));
                const querySnapshot = await getDocs(q);

                if (!querySnapshot.empty) {
                    const userDoc = querySnapshot.docs[0];
                    const userData = userDoc.data();
                    const userId = userDoc.id;

                    const accessToken = userData.whatsappAccessToken;

                    // B. Fetch Products for this user
                    const productsSnap = await getDocs(collection(db, 'users', userId, 'products'));
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
