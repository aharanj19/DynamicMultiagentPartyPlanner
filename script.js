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

function setAgentEnabled(agentType, enabled) {
    if (!agentType || !agents[agentType]) {
        return;
    }

    agentStates[agentType] = enabled;
    const toggle = document.querySelector(`.agent-toggle[data-agent="${agentType}"]`);
    if (toggle) {
        updateAgentToggleUI(toggle, enabled);
    }
    if (typeof addTrace !== 'undefined') {
        addTrace(`${agents[agentType].name} ${enabled ? 'enabled' : 'disabled'}`, 'info');
    }
}

function updateAgentToggleUI(toggle, enabled) {
    const agentCard = toggle.closest('.agent-card');

    toggle.classList.toggle('enabled', enabled);
    toggle.classList.toggle('disabled', !enabled);
    toggle.setAttribute('aria-pressed', String(enabled));
    toggle.title = enabled ? 'Enabled' : 'Disabled';
    toggle.innerHTML = `<span class="toggle-text">${enabled ? 'ON' : 'OFF'}</span>`;

    if (agentCard) {
        agentCard.classList.toggle('disabled', !enabled);
    }
}

function initializeApp() {
    console.log('Initializing application...');
    
    // Initialize all agent toggles as enabled
    document.querySelectorAll('.agent-toggle').forEach(toggle => {
        const agentType = toggle.dataset.agent;
        agentStates[agentType] = true;
        updateAgentToggleUI(toggle, true);
        
        toggle.addEventListener('click', (e) => {
            e.stopPropagation();
            const nextState = !agentStates[agentType];
            setAgentEnabled(agentType, nextState);
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

                if (!response || !String(response).trim()) {
                    throw new Error('No result produced');
                }
                
                displayResult(agentType, response);
                addTrace(`${agentConfig.name} completed`, 'success');
            } catch (error) {
                console.error(`Error calling ${agentType}:`, error);
                addTrace(`${agentConfig.name} failed: ${error.message}`, 'error');
                setAgentEnabled(agentType, false);
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
