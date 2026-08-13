const API_URL = 'https://vibe-proxy-gqv4.onrender.com/v1/chat/completions';
const API_KEY = 'sk-vibe-summer-2026';

/**
 * Orchestrator - Analyzes user requests and determines which agents to use
 */
async function getOrchestratorDecision(userInput) {
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
                        role: 'user',
                        content: `You are an orchestrator for a party planning assistant. Analyze the following user request and determine which agents should be used to fulfill it.

Available agents:
- location: For location/venue selection and recommendations
- weather: For weather forecasting and climate considerations
- food: For food planning, catering, and menu suggestions

User request: "${userInput}"

Respond with ONLY a JSON object (no markdown, no extra text) in this format:
{"agents": ["location", "weather", "food"]}

Use only the agents needed for this specific request. The array can have 1, 2, or 3 agents.`
                    }
                ]
            })
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        const content = data.choices[0].message.content.trim();
        
        // Parse JSON response
        try {
            const result = JSON.parse(content);
            return result.agents || [];
        } catch (e) {
            // Try to extract JSON from the response
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const result = JSON.parse(jsonMatch[0]);
                return result.agents || [];
            }
            return [];
        }
    } catch (error) {
        addTrace(`Orchestrator error: ${error.message}`, 'error');
        return [];
    }
}
