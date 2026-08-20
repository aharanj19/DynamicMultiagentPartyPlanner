/**
 * Local Proxy Server - Forwards API requests from the browser to the external API
 * This solves CORS issues when running the app locally
 */

const http = require('http');
const https = require('https');
const url = require('url');

const EXTERNAL_API_URL = 'https://vibe-proxy-gqv4.onrender.com/v1/chat/completions';
const API_KEY = 'sk-vibe-summer-2026';
const PROXY_PORT = 3001;

const server = http.createServer((req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Content-Type', 'application/json');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        res.writeHead(200, { 'Access-Control-Allow-Methods': 'POST, OPTIONS' });
        res.end();
        return;
    }

    // Only accept POST requests to /api/chat
    if (req.url !== '/api/chat') {
        res.writeHead(404);
        res.end(JSON.stringify({ error: 'Not found' }));
        return;
    }

    if (req.method !== 'POST') {
        res.writeHead(405, {
            'Allow': 'POST, OPTIONS'
        });
        res.end(JSON.stringify({ error: 'Method not allowed. Use POST for /api/chat.' }));
        return;
    }

    // Collect request body
    let body = '';
    req.on('data', chunk => {
        body += chunk.toString();
    });

    req.on('end', () => {
        try {
            const requestData = JSON.parse(body);

            // Forward request to external API
            const payload = JSON.stringify(requestData);
            const options = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${API_KEY}`,
                    'Content-Length': Buffer.byteLength(payload)
                }
            };

            console.log(`[${new Date().toISOString()}] Forwarding request to external API...`);

            const externalReq = https.request(EXTERNAL_API_URL, options, (externalRes) => {
                let responseData = '';

                externalRes.on('data', chunk => {
                    responseData += chunk.toString();
                });

                externalRes.on('end', () => {
                    try {
                        res.writeHead(externalRes.statusCode, externalRes.headers);
                        res.end(responseData);
                        console.log(`[${new Date().toISOString()}] Response sent to client`);
                    } catch (error) {
                        console.error('Error sending response:', error);
                        res.writeHead(500);
                        res.end(JSON.stringify({ error: 'Internal server error' }));
                    }
                });
            });

            externalReq.on('error', (error) => {
                console.error('External API error:', error);
                res.writeHead(502);
                res.end(JSON.stringify({ error: 'Failed to reach external API' }));
            });

            externalReq.write(payload);
            externalReq.end();
        } catch (error) {
            console.error('Error parsing request:', error);
            res.writeHead(400);
            res.end(JSON.stringify({ error: 'Invalid request' }));
        }
    });
});

server.listen(PROXY_PORT, '0.0.0.0', () => {
    console.log(`\n🚀 Proxy server running on http://localhost:${PROXY_PORT}`);
    console.log(`📡 Forwarding requests to: ${EXTERNAL_API_URL}`);
    console.log(`\nUpdate your frontend to use: http://localhost:${PROXY_PORT}/api/chat\n`);
});
