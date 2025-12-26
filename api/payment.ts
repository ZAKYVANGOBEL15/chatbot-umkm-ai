import midtransClient from 'midtrans-client';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

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

// Initialize Midtrans
const isProduction = process.env.MIDTRANS_IS_PRODUCTION === 'true';
const snap = new (midtransClient as any).Snap({
    isProduction: isProduction,
    serverKey: process.env.MIDTRANS_SERVER_KEY,
    clientKey: process.env.VITE_MIDTRANS_CLIENT_KEY
});

export default async function handler(req: any, res: any) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const { userId, plan } = req.body;
        if (!userId) return res.status(400).json({ message: 'User ID is required' });

        // 1. Get User Data
        const userDoc = await getDoc(doc(db, 'users', userId));
        if (!userDoc.exists()) return res.status(404).json({ message: 'User not found' });

        const userData = userDoc.data();
        const amount = 193; // Test price: Rp 193
        const orderId = `SUBS-${userId}-${Date.now()}`;

        // 2. Create Transaction Parameters
        const parameter = {
            transaction_details: {
                order_id: orderId,
                gross_amount: amount
            },
            customer_details: {
                first_name: userData.name || 'User',
                email: userData.email
            },
            item_details: [{
                id: 'subscription_pro',
                price: amount,
                quantity: 1,
                name: 'ChatBot Zaky Pro Subscription (30 Days)'
            }],
            callbacks: {
                finish: `${process.env.VITE_APP_URL || 'https://chatbot-umkm-ai.vercel.app'}/dashboard/settings?status=success`,
                error: `${process.env.VITE_APP_URL || 'https://chatbot-umkm-ai.vercel.app'}/dashboard/settings?status=error`,
                pending: `${process.env.VITE_APP_URL || 'https://chatbot-umkm-ai.vercel.app'}/dashboard/settings?status=pending`
            },
            enabled_payments: ["gopay", "qris", "shopeepay", "bank_transfer"]
        };

        // 3. Create Transaction
        const transaction = await snap.createTransaction(parameter);

        return res.status(200).json({
            token: transaction.token,
            redirect_url: transaction.redirect_url
        });

    } catch (error: any) {
        console.error('Payment Error:', error);
        return res.status(500).json({ message: error.message });
    }
}
