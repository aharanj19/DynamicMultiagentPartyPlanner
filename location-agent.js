const LOCATION_API_URL = '/api/chat';

/**
 * Location Planner Agent - Recommends venues and locations
 */
class LocationAgent {
    constructor() {
        this.name = 'Location Planner';
        this.type = 'location';
        this.emoji = '📍';
    }

    getSystemPrompt() {
        return `You are a location planner for parties and events. Given a user's party planning request, provide specific venue recommendations, location suggestions, and logistical considerations. Be concise and practical.`;
    }

    async call(userInput) {
        try {
            console.log('LocationAgent.call() - Input:', userInput);
            
            const response = await fetch(LOCATION_API_URL, {
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
            console.log('LocationAgent response:', data);
            
            const content = data.choices[0].message.content;
            console.log('LocationAgent content:', content);
            
            return content;
        } catch (error) {
            console.error('LocationAgent error:', error);
            throw new Error(`${this.name} failed: ${error.message}`);
        }
    }
}

const locationAgent = new LocationAgent();
