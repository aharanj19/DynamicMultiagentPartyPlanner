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
 * Display agent result in the results panel
 */
function displayResult(agentType, content) {
    const resultsList = document.getElementById('resultsList');
    
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
