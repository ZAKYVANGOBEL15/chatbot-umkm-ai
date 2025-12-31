import { getDb } from './lib/db.js';

export default async function handler(req: any, res: any) {
    // 1. Handle CORS
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const { userId } = req.query;

        if (!userId) {
            return res.status(400).json({ error: 'Missing userId parameter' });
        }

        const db = getDb();

        // Fetch User Profile
        const userDoc = await db.collection('users').doc(userId as string).get();

        if (!userDoc.exists) {
            return res.status(404).json({ error: 'User/Business not found' });
        }

        const userData = userDoc.data();

        // Fetch Products
        const productsSnap = await db.collection('users').doc(userId as string).collection('products').get();
        const products = productsSnap.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        const businessContext = {
            name: userData?.businessName || 'Bisnis Kami',
            description: userData?.businessDescription || 'Layanan kami.',
            products: products
        };

        return res.status(200).json(businessContext);

    } catch (error: any) {
        console.error('Business Info API Error:', error);
        return res.status(500).json({
            error: 'Internal Server Error',
            message: error.message
        });
    }
}
