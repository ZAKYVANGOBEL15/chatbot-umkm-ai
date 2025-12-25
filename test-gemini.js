import { GoogleGenAI } from "@google/genai";

// RUN THIS SCRIPT WITH: node test-gemini.js
// This uses the NEW @google/genai SDK

const API_KEY = "AIzaSyBHx3_c5ItovlQp5i3go8zhX5B7EjqaqsE";
const client = new GoogleGenAI({ apiKey: API_KEY });

const models = [
    "gemini-1.5-flash",
    "gemini-2.0-flash-exp",
    "gemini-1.5-pro",
    "gemini-2.0-flash"
];

async function testModels() {
    console.log("--- Diagnosa API Gemini (SDK BARU: @google/genai) ---");
    console.log("API Key:", API_KEY.substring(0, 10) + "...");

    for (const modelName of models) {
        process.stdout.write(`Mencoba model ${modelName}... `);
        try {
            const response = await client.models.generateContent({
                model: modelName,
                contents: "Say 'OK' if you can hear me."
            });
            console.log("✅ BERHASIL! Respon:", response.text);
        } catch (error) {
            console.log(`❌ GAGAL. Error: ${error.message}`);
        }
    }
    console.log("-----------------------------------------------------");
}

testModels().catch(err => console.error("Fatal Error:", err));
