/**
 * Combined Server - Serves static files AND proxies API requests
 * This solves the issue of CORS and localhost access in GitHub Codespaces
 */

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const url = require('url');

const EXTERNAL_API_URL = 'https://vibe-proxy-gqv4.onrender.com/v1/chat/completions';
const API_KEY = 'sk-vibe-summer-2026';
const PORT = 8000;

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;

    // Enable CORS for all responses
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        res.writeHead(200, { 'Access-Control-Allow-Methods': 'POST, OPTIONS' });
        res.end();
        return;
    }

    // Handle API proxy requests
    if (pathname === '/api/chat') {
        if (req.method !== 'POST') {
            res.writeHead(405, {
                'Content-Type': 'application/json',
                'Allow': 'POST, OPTIONS'
            });
            res.end(JSON.stringify({ error: 'Method not allowed. Use POST for /api/chat.' }));
            return;
        }

        res.setHeader('Content-Type', 'application/json');
        
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', () => {
            try {
                const requestData = JSON.parse(body);

                const payload = JSON.stringify(requestData);
                const options = {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${API_KEY}`,
                        'Content-Length': Buffer.byteLength(payload)
                    }
                };

                console.log(`[${new Date().toISOString()}] Proxying request to external API...`);

                const externalReq = https.request(EXTERNAL_API_URL, options, (externalRes) => {
                    let responseData = '';

                    externalRes.on('data', chunk => {
                        responseData += chunk.toString();
                    });

                    externalRes.on('end', () => {
                        try {
                            res.writeHead(externalRes.statusCode);
                            res.end(responseData);
                            console.log(`[${new Date().toISOString()}] Response sent to client`);
                        } catch (error) {
                            console.error('Error sending response:', error);
                            res.writeHead(500);
                            res.end(JSON.stringify({ error: 'Internal server error' }));
                        }
                    });
                });

                externalReq.setTimeout(15000, () => {
                    externalReq.destroy(new Error('External API request timed out'));
                });

                externalReq.on('error', (error) => {
                    console.error('External API error:', error);
                    res.writeHead(502);
                    res.end(JSON.stringify({ error: error.message || 'Failed to reach external API' }));
                });

                externalReq.write(payload);
                externalReq.end();
            } catch (error) {
                console.error('Error parsing request:', error);
                res.writeHead(400);
                res.end(JSON.stringify({ error: 'Invalid request' }));
            }
        });
        return;
    }

    // Serve static files
    let filePath = '.' + pathname;
    if (filePath === './') {
        filePath = './index.html';
    }

    const extname = String(path.extname(filePath)).toLowerCase();
    const mimeTypes = {
        '.html': 'text/html',
        '.js': 'text/javascript',
        '.css': 'text/css',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpg',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml',
        '.wav': 'audio/wav',
        '.mp4': 'video/mp4',
        '.woff': 'application/font-woff',
        '.ttf': 'application/font-ttf',
        '.eot': 'application/vnd.ms-fontobject',
        '.otf': 'application/font-otf',
        '.wasm': 'application/wasm'
    };

    const contentType = mimeTypes[extname] || 'application/octet-stream';

    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code === 'ENOENT') {
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end('<h1>404 - File Not Found</h1>', 'utf-8');
            } else {
                res.writeHead(500);
                res.end('Sorry, check with the site admin for error: ' + error.code + ' ..\n');
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

server.listen(PORT, '0.0.0.0', () => {
    console.log(`\n🚀 Combined Server running on http://localhost:${PORT}`);
    console.log(`📡 Static files being served from current directory`);
    console.log(`🔄 API proxy forwarding to: ${EXTERNAL_API_URL}`);
    console.log(`\nOpen your browser and go to: http://localhost:${PORT}\n`);
});
