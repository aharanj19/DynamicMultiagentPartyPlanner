const FOOD_API_URL = '/api/chat';

/**
 * Food Planner Agent - Recommends menus and catering options
 */
class FoodAgent {
    constructor() {
        this.name = 'Food Planner';
        this.type = 'food';
        this.emoji = '🍽️';
    }

    getSystemPrompt() {
        return `You are a professional food planner and catering coordinator. Based on the user's party planning request, suggest appropriate menu options, catering considerations, dietary needs planning, and food-related logistics. Be concise and practical.`;
    }

    async call(userInput) {
        try {
            console.log('FoodAgent.call() - Input:', userInput);
            
            const response = await fetch(FOOD_API_URL, {
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
            console.log('FoodAgent response:', data);
            
            const content = data.choices[0].message.content;
            console.log('FoodAgent content:', content);
            
            return content;
        } catch (error) {
            console.error('FoodAgent error:', error);
            throw new Error(`${this.name} failed: ${error.message}`);
        }
    }
}

const foodAgent = new FoodAgent();
