(function () {
    // 1. Configuration
    const script = document.currentScript;
    const userId = script.getAttribute('data-userid');
    const apiBase = script.src.split('/widget.js')[0]; // Auto-detect current host

    if (!userId) {
        console.error('Chatbot Widget: Missing data-userid attribute!');
        return;
    }

    // 2. State
    let businessContext = null;
    let chatHistory = [];
    let isOpen = false;

    // 3. Styles Injection
    const style = document.createElement('style');
    style.innerHTML = `
        #chatbot-widget-container {
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 999999;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        }
        #chatbot-bubble {
            width: 60px;
            height: 60px;
            border-radius: 50%;
            background: #000;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            display: flex;
            align-items: center;
            justify-content: center;
            transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        #chatbot-bubble:hover { transform: scale(1.1); }
        #chatbot-bubble svg { color: white; width: 28px; height: 28px; }

        #chatbot-window {
            position: absolute;
            bottom: 80px;
            right: 0;
            width: 350px;
            height: 500px;
            background: white;
            border-radius: 20px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.1);
            display: none;
            flex-direction: column;
            overflow: hidden;
            border: 1px solid #f0f0f0;
        }
        #chatbot-window.active { display: flex; animation: slideIn 0.3s ease-out; }

        @keyframes slideIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }

        #chatbot-header {
            padding: 20px;
            background: #000;
            color: white;
            display: flex;
            align-items: center;
            gap: 12px;
        }
        #chatbot-header-info h4 { margin: 0; font-size: 16px; font-weight: 700; }
        #chatbot-header-info p { margin: 2px 0 0; font-size: 11px; opacity: 0.7; }

        #chatbot-messages {
            flex: 1;
            padding: 20px;
            overflow-y: auto;
            background: #fdfdfd;
            display: flex;
            flex-direction: column;
            gap: 12px;
        }
        .cb-msg {
            max-width: 80%;
            padding: 10px 14px;
            border-radius: 15px;
            font-size: 13.5px;
            line-height: 1.4;
        }
        .cb-msg-user {
            align-self: flex-end;
            background: #000;
            color: white;
            border-bottom-right-radius: 2px;
        }
        .cb-msg-bot {
            align-self: flex-start;
            background: #f1f1f1;
            color: #1a1a1a;
            border-bottom-left-radius: 2px;
        }

        #chatbot-input-area {
            padding: 15px;
            border-top: 1px solid #f0f0f0;
            display: flex;
            gap: 8px;
        }
        #chatbot-input {
            flex: 1;
            border: 1px solid #e0e0e0;
            border-radius: 10px;
            padding: 10px 14px;
            outline: none;
            font-size: 13px;
        }
        #chatbot-input:focus { border-color: #000; }
        #chatbot-send {
            background: #000;
            color: white;
            border: none;
            padding: 0 15px;
            border-radius: 10px;
            cursor: pointer;
            font-size: 13px;
            font-weight: 600;
        }
        
        .cb-typing { font-style: italic; opacity: 0.5; font-size: 12px; }
    `;
    document.head.appendChild(style);

    // 4. Create UI Elements
    const container = document.createElement('div');
    container.id = 'chatbot-widget-container';
    container.innerHTML = `
        <div id="chatbot-bubble">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
        </div>
        <div id="chatbot-window">
            <div id="chatbot-header">
                <div id="chatbot-header-info">
                    <h4 id="cb-biz-name">Loading...</h4>
                    <p>AI Customer Service</p>
                </div>
            </div>
            <div id="chatbot-messages">
                <div class="cb-msg cb-msg-bot">Halo! Ada yang bisa saya bantu?</div>
            </div>
            <form id="chatbot-input-area">
                <input type="text" id="chatbot-input" placeholder="Tanyakan sesuatu..." autocomplete="off">
                <button type="submit" id="chatbot-send">Kirim</button>
            </form>
        </div>
    `;
    document.body.appendChild(container);

    const bubble = document.getElementById('chatbot-bubble');
    const windowEl = document.getElementById('chatbot-window');
    const messagesEl = document.getElementById('chatbot-messages');
    const form = document.getElementById('chatbot-input-area');
    const input = document.getElementById('chatbot-input');
    const bizNameEl = document.getElementById('cb-biz-name');

    // 5. Actions
    const toggleChat = () => {
        isOpen = !isOpen;
        windowEl.classList.toggle('active', isOpen);
        if (isOpen && !businessContext) fetchBusinessInfo();
    };

    const fetchBusinessInfo = async () => {
        try {
            const res = await fetch(`${apiBase}/api/business-info?userId=${userId}`);
            businessContext = await res.json();
            bizNameEl.textContent = businessContext.name;
        } catch (e) {
            console.error('Chatbot: Gagal memuat info bisnis');
            bizNameEl.textContent = 'Customer Service';
        }
    };

    const addMessage = (text, role) => {
        const msg = document.createElement('div');
        msg.className = `cb-msg cb-msg-${role}`;
        msg.textContent = text;
        messagesEl.appendChild(msg);
        messagesEl.scrollTop = messagesEl.scrollHeight;
        if (role !== 'system') {
            chatHistory.push({ role, text });
        }
    };

    const sendMessage = async (e) => {
        e.preventDefault();
        const text = input.value.trim();
        if (!text) return;

        input.value = '';
        addMessage(text, 'user');

        // Add typing indicator
        const typing = document.createElement('div');
        typing.className = 'cb-msg cb-msg-bot cb-typing';
        typing.textContent = 'Sedang mengetik...';
        messagesEl.appendChild(typing);
        messagesEl.scrollTop = messagesEl.scrollHeight;

        try {
            const res = await fetch(`${apiBase}/api/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: text,
                    history: chatHistory.slice(0, -1), // Exclude current msg which is added below
                    businessContext: businessContext,
                    userId: userId
                })
            });
            const data = await res.json();
            messagesEl.removeChild(typing);
            addMessage(data.reply, 'bot');
        } catch (e) {
            messagesEl.removeChild(typing);
            addMessage('Maaf, terjadi kesalahan koneksi.', 'bot');
        }
    };

    // 6. Event Listeners
    bubble.addEventListener('click', toggleChat);
    form.addEventListener('submit', sendMessage);

})();
