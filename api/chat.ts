import { generateAIResponse } from '../src/lib/gemini';

export default async function handler(req: any, res: any) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const { message, history, businessContext } = req.body || {};

        if (!message || !businessContext) {
            console.error('Missing fields:', { message: !!message, businessContext: !!businessContext });
            return res.status(400).json({
                error: 'Missing required fields',
                received: Object.keys(req.body || {})
            });
        }

        // Generate AI Response using the server-side API Key
        const reply = await generateAIResponse(message, businessContext, history || []);

        return res.status(200).json({ reply });
    } catch (error: any) {
        console.error('Chat API Error:', error);
        return res.status(500).json({
            error: 'Internal Server Error',
            message: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
}
