/**
 * Main Application - Coordinates agents and UI
 */

// Ensure all agents are loaded before proceeding
if (typeof locationAgent === 'undefined' || typeof weatherAgent === 'undefined' || typeof foodAgent === 'undefined') {
    console.error('Error: Agent instances not properly loaded. Check script loading order.');
}

const agentInstances = {
    location: locationAgent,
    weather: weatherAgent,
    food: foodAgent
};

const agentStates = {
    location: false,
    weather: false,
    food: false
};

let isProcessing = false;

console.log('App initialized with agents:', Object.keys(agentInstances));

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', initializeApp);

function initializeApp() {
    console.log('Initializing application...');
    
    // Initialize toggle handlers
    document.querySelectorAll('.agent-toggle').forEach(toggle => {
    toggle.addEventListener('click', (e) => {
        e.stopPropagation();
        const agentType = toggle.dataset.agent;
        agentStates[agentType] = !agentStates[agentType];
        toggle.classList.toggle('enabled');
        addTrace(`${agents[agentType].name} ${agentStates[agentType] ? 'enabled' : 'disabled'}`, 'info');
    });
});

    // Submit button handler
    document.getElementById('submitBtn').addEventListener('click', async () => {
        const userInput = document.getElementById('userInput').value.trim();
        
        if (!userInput) {
            addTrace('Please enter a request', 'error');
            return;
        }

        if (isProcessing) {
            addTrace('Still processing previous request...', 'error');
            return;
        }

        await processRequest(userInput);
    });

    // Allow Enter key to submit
    document.getElementById('userInput').addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 'Enter') {
            document.getElementById('submitBtn').click();
        }
    });
}

/**
 * Process user request: Get orchestrator decision and run selected agents
 */
async function processRequest(userInput) {
    isProcessing = true;
    document.getElementById('submitBtn').disabled = true;

    clearResults();
    addTrace(`User request: "${userInput}"`, 'info');

    try {
        // Step 1: Get orchestrator decision
        addTrace('🤖 Orchestrator analyzing request...', 'info');
        const agentsToRun = await getOrchestratorDecision(userInput);

        if (agentsToRun.length === 0) {
            addTrace('No suitable agents found for this request', 'error');
            isProcessing = false;
            document.getElementById('submitBtn').disabled = false;
            return;
        }

        addTrace(`Orchestrator selected: ${agentsToRun.map(a => agents[a].name).join(', ')}`, 'success');

        // Step 2: Run selected agents
        for (const agentType of agentsToRun) {
            const agentConfig = agents[agentType];
            addTrace(`Running ${agentConfig.name}...`, agentType);
            
            try {
                const agent = agentInstances[agentType];
                if (!agent) {
                    throw new Error(`Agent instance for ${agentType} not found`);
                }
                console.log(`Calling ${agentType} agent...`);
                const response = await agent.call(userInput);
                console.log(`${agentType} response:`, response);
                displayResult(agentType, response);
                addTrace(`${agentConfig.name} completed`, 'success');
            } catch (error) {
                console.error(`Error calling ${agentType}:`, error);
                addTrace(`${agentConfig.name} failed: ${error.message}`, 'error');
            }
        }

        addTrace('Processing complete', 'success');
    } catch (error) {
        console.error('Error in processRequest:', error);
