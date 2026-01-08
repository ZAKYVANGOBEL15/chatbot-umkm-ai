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
                const payload = JSON.stringify(req.body);
                const isValid = verifySignature(payload, signature, appSecret);
                console.log(`[Webhook] Signature validation result: ${isValid}`);

                if (!isValid && process.env.SKIP_SIGNATURE_VALIDATION !== 'true') {
                    console.warn('[Webhook] Invalid signature. Payload length:', payload.length);
                    return res.status(401).send('Invalid Signature');
                }
            } else if (!appSecret) {
                console.warn('[Webhook] WHATSAPP_APP_SECRET is not set. Skipping signature validation.');
            }

            const db = getDb();
            const data = req.body;

            // FULL PAYLOAD LOGGING (DEBUG ONLY)
            console.log('[Webhook] Full Payload:', JSON.stringify(data, null, 2));

            // Log raw structure for debugging
            const value = data.entry?.[0]?.changes?.[0]?.value;
            const message = value?.messages?.[0];
            const statuses = value?.statuses?.[0];
            const phoneNumberId = value?.metadata?.phone_number_id;

            console.log(`[Webhook] Event Type: ${message ? 'Message' : (statuses ? 'Status Update' : 'Other')}`);
            if (statuses && statuses.status === 'failed') {
                const recipient = statuses.recipient_id;
                console.error(`[Webhook] Delivery Failed to ${recipient}:`, JSON.stringify(statuses.errors, null, 2));
            }

            if (phoneNumberId) {
                console.log(`[Webhook] Business Phone Number ID: ${phoneNumberId}`);
            }

            if (message && message.type === 'text' && phoneNumberId) {
                const from = message.from;
                const text = message.text.body;

                console.log(`[WhatsApp] Message from ${from}: ${text} (ID: ${phoneNumberId})`);

                // A. Find the user associated with this Phone Number ID
                const usersRef = db.collection('users');
                console.log(`[WhatsApp] Searching for user with whatsappPhoneNumberId: ${phoneNumberId}`);
                const querySnapshot = await usersRef.where('whatsappPhoneNumberId', '==', phoneNumberId).get();

                console.log(`[WhatsApp] Search result count: ${querySnapshot.size}`);

                if (!querySnapshot.empty) {
                    const userDoc = querySnapshot.docs[0];
                    const userData = userDoc.data();
                    const userId = userDoc.id;
                    console.log(`[WhatsApp] Found user: ${userId} (${userData.businessName})`);

                    // --- SUBSCRIPTION CHECK ---
                    const status = userData.subscriptionStatus || 'trial';
                    let isExpired = false;

                    if (status === 'active' && userData.subscriptionExpiresAt) {
                        isExpired = new Date(userData.subscriptionExpiresAt).getTime() < Date.now();
                    } else if (status === 'trial' && userData.trialExpiresAt) {
                        isExpired = new Date(userData.trialExpiresAt).getTime() < Date.now();
                    }

                    console.log(`[WhatsApp] User Status: ${status}, Expired: ${isExpired}`);

                    if (isExpired) {
                        console.warn(`[WhatsApp] User ${userId} (${userData.businessName}) has an expired ${status}. Skipping response.`);
                        return res.status(200).send('OK');
                    }
                    // --------------------------

                    const accessToken = userData.whatsappAccessToken;
                    const businessPhone = userData.businessPhone; // Optional fallback

                    // B. Fetch Products & Social Media for this user
                    const productsSnap = await db.collection('users').doc(userId).collection('products').get();
                    const products = productsSnap.docs.map(d => d.data());

                    const businessContext = {
                        name: userData.businessName || 'Toko Kami',
                        description: userData.businessDescription || 'Toko UMKM.',
                        products: products,
                        instagram: userData.instagram,
                        facebook: userData.facebook,
                        businessEmail: userData.businessEmail,
                        businessType: userData.businessType || 'retail'
                    };

                    // C. Identify Customer & Fetch History
                    let customerId = '';
                    let history: { role: string; text: string }[] = [];
                    const customersRef = db.collection('users').doc(userId).collection('customers');
                    const customerQuery = await customersRef.where('phone', '==', from).limit(1).get();

                    if (!customerQuery.empty) {
                        customerId = customerQuery.docs[0].id;
                        // Fetch last 15 messages
                        const messagesSnap = await customersRef.doc(customerId)
                            .collection('messages')
                            .orderBy('createdAt', 'asc') // Create index if needed, or filter in memory
                            .limitToLast(15)
                            .get();

                        history = messagesSnap.docs.map(doc => ({
                            role: doc.data().role,
                            text: doc.data().text
                        }));
                    } else {
                        // Create new customer proactively to store history
                        const newCustomer = await customersRef.add({
                            phone: from,
                            name: "Pelanggan Baru", // Will be updated by lead gen later
                            status: 'new',
                            source: 'whatsapp',
                            createdAt: new Date().toISOString(),
                            lastInteraction: new Date().toISOString()
                        });
                        customerId = newCustomer.id;
                    }

                    // Save User Message to History
                    if (customerId) {
                        await customersRef.doc(customerId).collection('messages').add({
                            role: 'user',
                            text: text,
                            createdAt: new Date().toISOString()
                        });
                    }

                    // D. Get AI Response
                    let reply = await import('../src/lib/gemini.js').then(m =>
                        m.generateAIResponse(text, businessContext, history)
                    );

                    // --- LEAD GENERATION LOGIC ---
                    const match = reply.match(/:::LEAD_DATA\s*=?\s*(\{.*?\})?:::/);
                    if (match && match[1]) {
                        try {
                            const leadData = JSON.parse(match[1]);
                            console.log("[WhatsApp] Lead Captured:", leadData);

                            // Update existing customer doc
                            if (customerId) {
                                await customersRef.doc(customerId).update({
                                    name: leadData.name,
                                    phone: leadData.phone, // Ensure phone is consistent
                                    nik: leadData.nik || '-',
                                    address: leadData.address || '-',
                                    dob: leadData.dob || '-',
                                    phoneNumberId: phoneNumberId,
                                    status: 'new', // Or 'lead'
                                    lastInteraction: new Date().toISOString()
                                });
                            }

                            // Clean reply
                            reply = reply.replace(match[0], '').trim();
                        } catch (e) {
                            console.error("[WhatsApp] Failed to parse lead:", e);
                            reply = reply.replace(match[0], '').trim();
                        }
                    }
                    // -----------------------------

                    // Save AI Reply to History
                    if (customerId) {
                        await customersRef.doc(customerId).collection('messages').add({
                            role: 'assistant',
                            text: reply,
                            createdAt: new Date().toISOString()
                        });
                    }

                    // E. Send Message Back to WhatsApp
                    if (accessToken) {
                        console.log(`[WhatsApp] Attempting to send reply to ${from} via v22.0...`);
                        const waResponse = await fetch(`https://graph.facebook.com/v22.0/${phoneNumberId}/messages`, {
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
