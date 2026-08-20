const ORCHESTRATOR_API_URL = '/api/chat';
const AVAILABLE_AGENTS = ['location', 'weather', 'food'];

/**
 * Orchestrator - Analyzes user requests and determines which agents to use
 */
async function getOrchestratorDecision(userInput) {
    try {
        console.log('Calling orchestrator with input:', userInput);
        const response = await fetch(ORCHESTRATOR_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
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
        console.log('Orchestrator response:', data);
        const content = data.choices?.[0]?.message?.content?.trim();
        if (!content) {
            throw new Error('Orchestrator returned an empty response');
        }
        console.log('Orchestrator content:', content);
        
        // Parse JSON response
        try {
            const result = JSON.parse(content);
            console.log('Parsed agents:', result.agents);
            return Array.isArray(result.agents) ? result.agents : AVAILABLE_AGENTS;
        } catch (e) {
            // Try to extract JSON from the response
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const result = JSON.parse(jsonMatch[0]);
                console.log('Extracted agents:', result.agents);
                return Array.isArray(result.agents) ? result.agents : AVAILABLE_AGENTS;
            }
            console.log('Failed to parse agents, using all available agents');
            return AVAILABLE_AGENTS;
        }
    } catch (error) {
        console.error('Orchestrator error:', error);
        if (typeof addTrace !== 'undefined') {
            addTrace(`Orchestrator unavailable; running all enabled agents`, 'info');
        }
        return AVAILABLE_AGENTS;
    }
}
