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
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "google/gemini-2.0-flash-exp:free",
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
