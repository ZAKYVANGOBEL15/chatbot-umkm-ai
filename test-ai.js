import fetch from "node-fetch";

// RUN THIS SCRIPT WITH: node test-ai.js
// This tests connectivity via OpenRouter

const API_KEY = "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";

async function testOpenRouter() {
    console.log("--- Diagnosa API (Via OpenRouter) ---");

    try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${API_KEY}`,
                "Content-Type": "application/json",
                "HTTP-Referer": "http://localhost:5173",
                "X-Title": "Chatbot AI UMKM"
            },
            body: JSON.stringify({
                model: "meta-llama/llama-3.1-8b-instruct:free",
                messages: [{ role: "user", content: "Say 'ROUTER SUCCESS' if you can hear me." }]
            })
        });

        const data = await response.json();

        if (data.error) {
            console.log("❌ GAGAL. Error:", data.error.message);
        } else {
            console.log("✅ BERHASIL! Respon:", data.choices[0].message.content);
        }
    } catch (error) {
        console.log("❌ ERROR:", error.message);
    }
    console.log("-------------------------------------");
}

testOpenRouter();
