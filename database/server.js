import http from 'http';
import { handleIncomingRequest } from './database.js';

const PORT = 4000;

const server = http.createServer(async (req, res) => {
    if (req.method === 'POST' && req.url === '/receive') {
        let body = '';
        req.on('data', (c) => (body += c));
        req.on('end', async () => {
            try {
                const raw = JSON.parse(body || '{}');
                const result = await handleIncomingRequest(raw);
                res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
                res.end(JSON.stringify({ ok: true, ...result }));
            } catch (e) {
                console.error(e);
                res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
                res.end(JSON.stringify({ ok: false, message: e.message }));
            }
        });
        return;
    }
    res.writeHead(404); res.end('Not Found');
});

server.listen(PORT, () => console.log(`DATABASE на порту ${PORT}`));