/**
 * Jepoy Robot Chatbot Implementation
 * Integrates Gemini API to provide a friendly chemistry assistant.
 */

const JEPOY_CONFIG = {
    // Note: In a production app, the API key should be handled by a backend proxy.
    apiKey: (window.GEMINI_API_KEY || "AIzaSyD5C_2NHw_yZiIqeDM8RR61r_wCYJ9_C34").trim(),
    model: "gemini-2.0-flash", // Updated to a confirmed working model
    systemPrompt: `You are Jepoy Robot, the friendly AI assistant for CheMuLab, an interactive chemistry learning platform. 
    Your goal is to help users explore elements, discover reactions, and navigate the app.
    
    TONE: Friendly, enthusiastic, and helpful. Use lab-related metaphors.
    
    KNOWLEDGE BASE SUMMARY:
    - Element Discovery: Database of elements with search.
    - Your Lab: Combine elements for new reactions.
    - Games: Reaction Quiz, Periodic Puzzle, Whack-a-Mole.
    - Progress: Tracks milestones and achievements.
    - Friends: Social learning with friends.
    - Profile: Custom avatars and verification status.

    Always keep explanations simple but scientifically accurate.`
};

class JepoyChatbot {
    constructor() {
        this.isOpen = false;
        this.messages = [
            { role: "bot", content: "Hello! I'm Jepoy Robot. How can I help you in the lab today?" }
        ];
        this.initUI();
    }

    initUI() {
        // Create Chat Bubble
        const bubble = document.createElement("div");
        bubble.className = "chatbot-bubble";
        bubble.innerHTML = '<img src="img/jepoy.png" alt="Jepoy Robot">';
        bubble.onclick = () => this.toggleChat();
        document.body.appendChild(bubble);

        // Create Chat Window
        const windowDiv = document.createElement("div");
        windowDiv.className = "chatbot-window";
        windowDiv.id = "chatbotWindow";
        windowDiv.innerHTML = `
            <div class="chatbot-header">
                <h3>Jepoy Robot</h3>
                <button class="chatbot-close" onclick="window.jepoyRobot.toggleChat()">×</button>
            </div>
            <div class="chatbot-messages" id="chatbotMessages"></div>
            <div class="chatbot-input-area">
                <input type="text" class="chatbot-input" id="chatbotInput" placeholder="Ask Jepoy something...">
                <button class="chatbot-send" id="chatbotSend">
                    <svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"></path></svg>
                </button>
            </div>
        `;
        document.body.appendChild(windowDiv);

        this.messagesDiv = document.getElementById("chatbotMessages");
        this.inputField = document.getElementById("chatbotInput");
        this.sendBtn = document.getElementById("chatbotSend");

        this.sendBtn.onclick = () => this.handleSendMessage();
        this.inputField.onkeypress = (e) => {
            if (e.key === "Enter") this.handleSendMessage();
        };

        this.renderMessages();
    }

    toggleChat() {
        const windowDiv = document.getElementById("chatbotWindow");
        this.isOpen = !this.isOpen;
        if (this.isOpen) {
            windowDiv.classList.add("active");
            this.inputField.focus();
        } else {
            windowDiv.classList.remove("active");
        }
    }

    renderMessages() {
        this.messagesDiv.innerHTML = "";
        this.messages.forEach(msg => {
            const msgDiv = document.createElement("div");
            msgDiv.className = `message ${msg.role}`;
            msgDiv.textContent = msg.content;
            this.messagesDiv.appendChild(msgDiv);
        });
        this.messagesDiv.scrollTop = this.messagesDiv.scrollHeight;
    }

    async handleSendMessage() {
        const text = this.inputField.value.trim();
        if (!text) return;

        this.messages.push({ role: "user", content: text });
        this.inputField.value = "";
        this.renderMessages();

        // Add loading state
        const loadingDiv = document.createElement("div");
        loadingDiv.className = "message bot loading";
        loadingDiv.textContent = "Jepoy is thinking...";
        this.messagesDiv.appendChild(loadingDiv);
        this.messagesDiv.scrollTop = this.messagesDiv.scrollHeight;

        try {
            const response = await this.callGemini(text);
            if (this.messagesDiv.contains(loadingDiv)) {
                this.messagesDiv.removeChild(loadingDiv);
            }
            this.messages.push({ role: "bot", content: response });
            this.renderMessages();
        } catch (error) {
            console.error("Jepoy Error Log:", error);
            if (this.messagesDiv.contains(loadingDiv)) {
                this.messagesDiv.removeChild(loadingDiv);
            }

            const errorMsg = error.message.includes("403") || error.message.includes("permission") ?
                "My key seems to be invalid or limited! Ensure 'Generative Language API' is enabled in your Google AI Studio project." :
                "Oops! My circuits got a bit tangled. Error: " + error.message;
            this.messages.push({ role: "bot", content: errorMsg });
            this.renderMessages();
        }
    }

    async callGemini(prompt) {
        if (!JEPOY_CONFIG.apiKey || JEPOY_CONFIG.apiKey.startsWith("YOUR_")) {
            return "I need a valid API key to think! Please update the key in js/chatbot.js.";
        }

        // Try these models based on confirmation from listModels diagnostic
        const modelsToTry = ["gemini-2.0-flash", "gemini-1.5-flash", "gemini-flash-latest"];
        let lastError = null;

        for (const model of modelsToTry) {
            try {
                const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${JEPOY_CONFIG.apiKey}`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        system_instruction: { parts: [{ text: JEPOY_CONFIG.systemPrompt }] },
                        contents: [{ parts: [{ text: prompt }] }]
                    })
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.candidates && data.candidates[0].content && data.candidates[0].content.parts) {
                        return data.candidates[0].content.parts[0].text;
                    }
                } else if (response.status !== 404) {
                    const errorData = await response.json();
                    throw new Error(errorData.error ? errorData.error.message : response.statusText);
                }
            } catch (err) {
                console.warn(`Attempt with ${model} failed:`, err.message);
                lastError = err.message;
            }
        }

        throw new Error(lastError || "Could not find a working model. Is your API key correct?");
    }
}

// Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
    window.jepoyRobot = new JepoyChatbot();
});
