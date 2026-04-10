const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

// Import Custom Classes
const AppEmitter = require('./events/AppEmitter');
const TextTransform = require('./streams/TextTransform');
const EchoDuplex = require('./streams/EchoDuplex');

// Khởi tạo Event Emitter
const appEmitter = new AppEmitter();
let eventCounter = 0;

// Đăng ký listener (sử dụng on và once)
appEmitter.once('firstRun', () => console.log('Server NodeJS đã khởi động!'));
appEmitter.on('userAction', (data) => {
    eventCounter++;
    appEmitter.logToFile('userAction', { ...data, counter: eventCounter });
    console.log(`[Event Triggered] userAction - Lần ${eventCounter}`);
});

appEmitter.emit('firstRun');

// Helper function để đọc và trả về file tĩnh (HTML, CSS, JPG)
function serveStaticFile(res, filePath, contentType) {
    const fullPath = path.join(__dirname, filePath);
    fs.readFile(fullPath, (err, data) => {
        if (err) {
            res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
            res.end('404 - Không tìm thấy file');
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(data);
        }
    });
}

// Khởi tạo HTTP Server
const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;
    const method = req.method;

    // ----- ROUTING CÁC FILE TĨNH & CSS -----
    if (method === 'GET') {
        if (pathname === '/') return serveStaticFile(res, 'views/index.html', 'text/html; charset=utf-8');
        if (pathname === '/events') return serveStaticFile(res, 'views/events.html', 'text/html; charset=utf-8');
        if (pathname === '/request') return serveStaticFile(res, 'views/request.html', 'text/html; charset=utf-8');
        if (pathname === '/streams') return serveStaticFile(res, 'views/streams.html', 'text/html; charset=utf-8');

        if (pathname === '/css/style.css') return serveStaticFile(res, 'public/css/style.css', 'text/css');
    }

    // ----- ROUTING API & ENDPOINTS -----

    // 1. Trả dữ liệu JSON (/json)
    if (pathname === '/json' && method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ status: 'success', message: 'Đây là dữ liệu JSON trả về từ Server' }));
        return;
    }

    // 2. Streaming hình ảnh (/image)
    if (pathname === '/image' && method === 'GET') {
        const imgPath = path.join(__dirname, 'public/images/logo.jpg');
        res.setHeader('Content-Type', 'image/jpeg');
        const imgStream = fs.createReadStream(imgPath);
        imgStream.on('error', () => {
            res.writeHead(404);
            res.end('Image not found. Vui lòng copy 1 file logo.jpg vào thư mục public/images/');
        });
        imgStream.pipe(res); // Streaming hình ảnh
        return;
    }

    // 3. Trigger Event (/event)
    if (pathname === '/event' && method === 'POST') {
        appEmitter.emit('userAction', { user: 'Client', action: 'Click trigger' });
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ message: 'Sự kiện đã được kích hoạt và ghi log!', counter: eventCounter }));
        return;
    }

    // 4. Download/Đọc file log (/download-log)
    if (pathname === '/download-log' && method === 'GET') {
        const logPath = path.join(__dirname, 'data/log.txt');
        res.writeHead(200, {
            'Content-Type': 'text/plain; charset=utf-8',
            'Content-Disposition': 'inline; filename="log.txt"' // Sửa 'inline' thành 'attachment' nếu muốn ép tải xuống
        });
        const readStream = fs.createReadStream(logPath);
        readStream.pipe(res);
        return;
    }

    // 5. Hiển thị thông tin Request & Header (/api/request-info)
    const url = require('url');

    if (req.url === '/api/request-info') {
        const parsed = url.parse(req.url, true);

        res.writeHead(200, {
            'Content-Type': 'application/json',
            'X-Custom-Header': 'NodeJS-Practice-Request-Demo',
            'X-Powered-By': 'HTTP Module'
        });

        const data = {
            method: req.method,
            url: req.url,
            query: parsed.query,
            headers: req.headers
        };

        res.end(JSON.stringify(data));
        return;
    }
 
    // ----- CÁC ENDPOINT DEMO STREAMS (Từ form gửi lên) -----

    // 4.1 Readable Stream (Giữ nguyên - chạy tốt)
    if (pathname === '/api/read-stream' && method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
        fs.createReadStream(path.join(__dirname, 'data/story.txt')).pipe(res);
        return;
    }

    // 4.2 Writable Stream (Đã sửa chữ 'if' và giải mã tiếng Việt)
    if (pathname === '/api/write-stream' && method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', () => {
            const params = new URLSearchParams(body);
            const content = params.get('data') || '';
            const writeStream = fs.createWriteStream(path.join(__dirname, 'data/output.txt'));
            writeStream.write(content);
            writeStream.end();

            writeStream.on('finish', () => {
                res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
                res.end('Đã ghi dữ liệu vào data/output.txt thành công!');
            });
        });
        return;
    }

    // 4.3 Transform Stream (Sửa lại để không bị dính data=)
    if (pathname === '/api/transform-stream' && method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', () => {
            const params = new URLSearchParams(body);
            const content = params.get('data') || '';

            res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
            const transformer = new TextTransform();

            // Đẩy dữ liệu sạch vào transformer
            transformer.write(content);
            transformer.end();
            transformer.pipe(res);
        });
        return;
    }

    // 4.4 Duplex Stream (Sửa tương tự 4.3)
    if (pathname === '/api/duplex-stream' && method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', () => {
            const params = new URLSearchParams(body);
            const content = params.get('data') || '';

            res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
            const duplexer = new EchoDuplex();

            duplexer.write(content);
            duplexer.end();
            duplexer.pipe(res);
        });
        return;
    }
})
// Chạy server tại port 3000
server.listen(3000, () => {
    console.log('Server đang chạy tại: http://localhost:3000');
});