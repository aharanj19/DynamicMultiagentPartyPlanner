const API_URL = 'https://vibe-proxy-gqv4.onrender.com/v1/chat/completions';
const API_KEY = 'sk-vibe-summer-2026';

/**
 * Weather Forecaster Agent - Provides weather forecasts and climate considerations
 */
class WeatherAgent {
    constructor() {
        this.name = 'Weather Forecaster';
        this.type = 'weather';
        this.emoji = '⛅';
    }

    getSystemPrompt() {
        return `You are a weather forecaster and climate specialist for parties. Analyze the user's party planning request and provide relevant weather forecasts, climate considerations, and recommendations for indoor/outdoor setup based on expected weather conditions. Be concise and practical.`;
    }

    async call(userInput) {
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${API_KEY}`
                },
                body: JSON.stringify({
                    model: 'class-chat-model',
                    messages: [
                        {
                            role: 'system',
                            content: this.getSystemPrompt()
                        },
                        {
                            role: 'user',
                            content: userInput
                        }
                    ]
                })
            });

            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }

            const data = await response.json();
            return data.choices[0].message.content;
        } catch (error) {
            throw new Error(`${this.name} failed: ${error.message}`);
        }
    }
}

const weatherAgent = new WeatherAgent();
