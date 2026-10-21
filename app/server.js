import http from 'http';
import { transferData } from './transfer.js';

const PORT = 3000;

const server = http.createServer(async (req, res) => {
    if (req.method === 'POST' && req.url === '/requests') {
        let body = '';
        req.on('data', (c) => (body += c));
        req.on('end', async () => {
            try {
                const data = JSON.parse(body);
                await transferData(data);
                res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
                res.end(JSON.stringify({ ok: true, message: 'Заявка сохранена' }));
            } catch (e) {
                console.error(e);
                res.writeHead(502, { 'Content-Type': 'application/json; charset=utf-8' });
                res.end(JSON.stringify({ ok: false, message: 'Не удалось обработать заявку' }));
            }
        });
        return;
    }
    res.writeHead(404); res.end('Not Found');
});

server.listen(PORT, () => console.log(`APP на порту ${PORT}`));