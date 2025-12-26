import midtransClient from 'midtrans-client';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, updateDoc } from 'firebase/firestore';
import crypto from 'crypto';

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
    if (req.method !== 'POST') {
        return res.status(405).send('Method not allowed');
    }

    try {
        const notification = req.body;

        // Verify Signature (Recommended by Midtrans)
        const serverKey = process.env.MIDTRANS_SERVER_KEY || '';
        const signatureKey = crypto.createHash('sha512')
            .update(notification.order_id + notification.status_code + notification.gross_amount + serverKey)
            .digest('hex');

        if (signatureKey !== notification.signature_key) {
            return res.status(403).send('Invalid signature');
        }

        const orderId = notification.order_id;
        const transactionStatus = notification.transaction_status;
        const fraudStatus = notification.fraud_status;

        // Extract User ID from Order ID (SUBS-userId-timestamp)
        const parts = orderId.split('-');
        if (parts.length < 2) return res.status(400).send('Invalid order format');
        const userId = parts[1];

        console.log(`Transaction notification received. Order ID: ${orderId}. Status: ${transactionStatus}. User ID: ${userId}`);

        if (transactionStatus === 'capture' || transactionStatus === 'settlement') {
            if (fraudStatus === 'challenge') {
                // TODO: Handle challenge
            } else if (fraudStatus === 'accept' || !fraudStatus) {
                // SUCCESS
                const trialExpiresAt = new Date();
                trialExpiresAt.setDate(trialExpiresAt.getDate() + 30); // Extend 30 days

                await updateDoc(doc(db, 'users', userId), {
                    subscriptionStatus: 'active',
                    subscriptionPlan: 'pro',
                    trialExpiresAt: trialExpiresAt.toISOString(),
                    lastPaymentDate: new Date().toISOString()
                });
                console.log(`User ${userId} subscription activated!`);
            }
        } else if (transactionStatus === 'cancel' || transactionStatus === 'deny' || transactionStatus === 'expire') {
            // FAILED
        } else if (transactionStatus === 'pending') {
            // PENDING
        }

        return res.status(200).send('OK');

    } catch (error: any) {
        console.error('Webhook Error:', error);
        return res.status(500).send('Internal Error');
    }
}
