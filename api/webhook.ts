import { generateAIResponse } from '../src/lib/gemini.js';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, where, getDocs, getDoc, doc } from 'firebase/firestore';

// Firebase configuration from environment variables
const firebaseConfig = {
    apiKey: process.env.VITE_FIREBASE_API_KEY,
    authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export default async function handler(req: any, res: any) {
    // 1. Handle Webhook Verification (for Meta)
    if (req.method === 'GET') {
        const mode = req.query['hub.mode'];
        const token = req.query['hub.verify_token'];
        const challenge = req.query['hub.challenge'];

        if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
            return res.status(200).send(challenge);
        }
        return res.status(403).send('Forbidden');
    }

    // 2. Handle Incoming Messages
    if (req.method === 'POST') {
        try {
            const data = req.body;

            // Extract message and business phone number ID
            const value = data.entry?.[0]?.changes?.[0]?.value;
            const message = value?.messages?.[0];
            const phoneNumberId = value?.metadata?.phone_number_id;

            if (message && message.type === 'text' && phoneNumberId) {
                const from = message.from; // Customer phone number
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
                    const accessToken = userData.whatsappAccessToken;
                    if (accessToken) {
                        try {
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
                        } catch (waErr) {
                            console.error('[WhatsApp] Failed to send message:', waErr);
                        }
                    } else {
                        console.warn(`[WhatsApp] No access token found for user ${userId}`);
                    }
                } else {
                    console.warn(`[WhatsApp] No user found for Phone Number ID: ${phoneNumberId}`);
                }
            }

            return res.status(200).send('OK');
        } catch (e: any) {
            console.error('Webhook error:', e);
            return res.status(500).send('Internal Error');
        }
    }

    return res.status(405).send('Method Not Allowed');
}
