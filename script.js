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
    location: true,
    weather: true,
    food: true
};

let isProcessing = false;

console.log('App initialized with agents:', Object.keys(agentInstances));

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', initializeApp);

function initializeApp() {
    console.log('Initializing application...');
    
    // Initialize all agent toggles as enabled
    document.querySelectorAll('.agent-toggle').forEach(toggle => {
        const agentType = toggle.dataset.agent;
        // Set enabled class for all agents
        toggle.classList.add('enabled');
        
        toggle.addEventListener('click', (e) => {
            e.stopPropagation();
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
        console.log('Agents to run (from orchestrator):', agentsToRun);
        console.log('Agent states (enabled/disabled):', agentStates);

        // Filter agents by which ones are enabled
        const enabledAgents = agentsToRun.filter(agent => agentStates[agent]);
        console.log('Enabled agents:', enabledAgents);

        if (enabledAgents.length === 0) {
            addTrace('No enabled agents selected for this request', 'error');
            isProcessing = false;
            document.getElementById('submitBtn').disabled = false;
            return;
        }

        addTrace(`Running enabled agents: ${enabledAgents.map(a => agents[a].name).join(', ')}`, 'success');

        // Step 2: Run selected enabled agents
        for (const agentType of enabledAgents) {
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
        addTrace(`Processing failed: ${error.message}`, 'error');
    } finally {
        isProcessing = false;
        document.getElementById('submitBtn').disabled = false;
    }
}
