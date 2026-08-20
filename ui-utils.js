/**
 * UI Utilities - Display results and manage workflow trace
 */

// Agent configuration
const agents = {
    location: { name: 'Location Planner', color: 'location', emoji: '📍' },
    weather: { name: 'Weather Forecaster', color: 'weather', emoji: '⛅' },
    food: { name: 'Food Planner', color: 'food', emoji: '🍽️' }
};

/**
 * Display thinking process for an agent
 */
function displayThinking(agentType) {
    console.log('displayThinking called for:', agentType);
    const resultsList = document.getElementById('resultsList');
    
    if (!resultsList) {
        console.error('resultsList element not found!');
        return;
    }
    
    // Remove empty state if it exists
    const emptyState = resultsList.querySelector('.empty-state');
    if (emptyState) {
        emptyState.remove();
    }

    const thinkingDiv = document.createElement('div');
    thinkingDiv.className = `result-item ${agentType} thinking`;
    thinkingDiv.id = `thinking-${agentType}`;
    thinkingDiv.innerHTML = `
        <div class="agent-title">${agents[agentType].emoji} ${agents[agentType].name}</div>
        <div class="agent-content thinking-content">
            <div class="thinking-spinner">🤔 Thinking</div>
        </div>
    `;

    resultsList.appendChild(thinkingDiv);
    resultsList.scrollTop = resultsList.scrollHeight;
    console.log('Thinking div created for:', agentType);
    return thinkingDiv;
}

/**
 * Update thinking display with thinking blocks
 */
function updateThinking(agentType, thinkingText) {
    const thinkingDiv = document.getElementById(`thinking-${agentType}`);
    if (thinkingDiv) {
        const contentDiv = thinkingDiv.querySelector('.agent-content');
        contentDiv.innerHTML = `
            <div class="thinking-block">
                <div class="thinking-label">🧠 AI Thinking Process:</div>
                <div class="thinking-text">${escapeHtml(thinkingText)}</div>
            </div>
        `;
    }
}

/**
 * Display agent result in the results panel
 */
function displayResult(agentType, content) {
    console.log('displayResult called for:', agentType, 'with content:', content);
    const resultsList = document.getElementById('resultsList');
    
    if (!resultsList) {
        console.error('resultsList element not found!');
        return;
    }
    
    // Remove empty state if it exists
    const emptyState = resultsList.querySelector('.empty-state');
    if (emptyState) {
        emptyState.remove();
    }

    const resultDiv = document.createElement('div');
    resultDiv.className = `result-item ${agentType}`;
    resultDiv.innerHTML = `
        <div class="agent-title">${agents[agentType].emoji} ${agents[agentType].name}</div>
        <div class="agent-content">${escapeHtml(content)}</div>
    `;

    resultsList.appendChild(resultDiv);
    resultsList.scrollTop = resultsList.scrollHeight;
    console.log('Result div created and added for:', agentType);
}

/**
 * Add trace message to the workflow trace panel
 */
function addTrace(message, type = 'info') {
    console.log(`[${type.toUpperCase()}] ${message}`);
    
    const traceList = document.getElementById('traceList');
    
    // Remove empty state if it exists
    const emptyState = traceList.querySelector('.empty-state');
    if (emptyState) {
        emptyState.remove();
    }

    const timestamp = new Date().toLocaleTimeString();
    const traceDiv = document.createElement('div');
    traceDiv.className = `trace-item ${type}`;
    traceDiv.innerHTML = `
        <span class="trace-timestamp">${timestamp}</span>
        ${escapeHtml(message)}
    `;

    traceList.appendChild(traceDiv);
    traceList.scrollTop = traceList.scrollHeight;
}

/**
 * Clear results panel
 */
function clearResults() {
    const resultsList = document.getElementById('resultsList');
    resultsList.innerHTML = '<div class="empty-state">Results will appear here...</div>';
}

/**
 * Escape HTML to prevent XSS attacks
 */
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}
