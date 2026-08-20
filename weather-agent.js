const WEATHER_API_URL = '/api/chat';

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
            console.log('WeatherAgent.call() - Input:', userInput);
            
            const response = await fetch(WEATHER_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
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
            console.log('WeatherAgent response:', data);
            
            const content = data.choices[0].message.content;
            console.log('WeatherAgent content:', content);
            
            return content;
        } catch (error) {
            console.error('WeatherAgent error:', error);
            throw new Error(`${this.name} failed: ${error.message}`);
        }
    }
}

const weatherAgent = new WeatherAgent();
