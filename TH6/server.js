const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url'); // Khai báo 1 lần duy nhất ở đây

// Import Custom Classes
const AppEmitter = require('./events/AppEmitter');
const TextTransform = require('./streams/TextTransform');
const EchoDuplex = require('./streams/EchoDuplex');

// Khởi tạo Event Emitter
const appEmitter = new AppEmitter();
let eventCounter = 0;

// Đăng ký listener
appEmitter.once('firstRun', () => console.log('Server NodeJS đã khởi động!'));
appEmitter.on('userAction', (data) => {
    eventCounter++;
    appEmitter.logToFile('userAction', { ...data, counter: eventCounter });
    console.log(`[Event Triggered] userAction - Lần ${eventCounter}`);
});

appEmitter.emit('firstRun');

// Helper function để đọc và trả về file tĩnh
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
    // 1. Phân tích URL ngay từ đầu để dùng chung cho mọi route
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

    // 1. Trả dữ liệu JSON
    if (pathname === '/json' && method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        return res.end(JSON.stringify({ status: 'success', message: 'Đây là dữ liệu JSON trả về từ Server' }));
    }

    // 2. Streaming hình ảnh
    if (pathname === '/image' && method === 'GET') {
        const imgPath = path.join(__dirname, 'public/images/logo.jpg');
        const imgStream = fs.createReadStream(imgPath);
        
        imgStream.on('open', () => {
            res.setHeader('Content-Type', 'image/jpeg');
            imgStream.pipe(res);
        });

        imgStream.on('error', () => {
            res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
            res.end('Image not found. Vui lòng copy 1 file logo.jpg vào thư mục public/images/');
        });
        return;
    }

    // 3. Trigger Event
    if (pathname === '/event' && method === 'POST') {
        appEmitter.emit('userAction', { user: 'Client', action: 'Click trigger' });
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        return res.end(JSON.stringify({ message: 'Sự kiện đã được kích hoạt và ghi log!', counter: eventCounter }));
    }

    // 4. Download/Đọc file log
    if (pathname === '/download-log' && method === 'GET') {
        const logPath = path.join(__dirname, 'data/log.txt');
        res.writeHead(200, {
            'Content-Type': 'text/plain; charset=utf-8',
            'Content-Disposition': 'inline; filename="log.txt"'
        });
        const readStream = fs.createReadStream(logPath);
        readStream.on('error', () => res.end('Chưa có file log.'));
        return readStream.pipe(res);
    }

    // 5. Hiển thị thông tin Request & Header (ĐÃ SỬA LỖI KHAI BÁO LẠI URL)
    // 5. Hiển thị thông tin Request & Header - Theo đúng yêu cầu bài thực hành
    if (pathname === '/api/request-info' && method === 'GET') {

        // Thiết lập Response Headers (bắt buộc phải có res.writeHead)
        res.writeHead(200, {
            'Content-Type': 'application/json; charset=utf-8',
            'X-Custom-Header': 'NodeJS-Practice-Request-Demo',
            'X-Powered-By': 'HTTP Module - url.parse()',
            'Cache-Control': 'no-cache, no-store'
        });

        // Chuẩn bị dữ liệu theo đúng yêu cầu
        const responseData = {
            method: method,
            url: req.url,                    // URL gốc (req.url)
            pathname: parsedUrl.pathname || 'N/A',   // Pathname sau khi parse
            search: parsedUrl.search || '(không có)', // Query String
            query: parsedUrl.query || {},            // Parsed Query (object)
            headers: req.headers
        };

        return res.end(JSON.stringify(responseData, null, 2));
    }
 
    // ----- CÁC ENDPOINT DEMO STREAMS -----

    // 4.1 Readable Stream
    if (pathname === '/api/read-stream' && method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
        const storyPath = path.join(__dirname, 'data/story.txt');
        const storyStream = fs.createReadStream(storyPath);
        storyStream.on('error', () => res.end('Không tìm thấy file data/story.txt'));
        return storyStream.pipe(res);
    }

    // 4.2 Writable Stream
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

    // 4.3 Transform Stream
    if (pathname === '/api/transform-stream' && method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', () => {
            const params = new URLSearchParams(body);
            const content = params.get('data') || '';
            res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
            const transformer = new TextTransform();
            transformer.write(content);
            transformer.end();
            transformer.pipe(res);
        });
        return;
    }

    // 4.4 Duplex Stream
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

    // 404 cho các route không tồn tại
    if (!res.writableEnded) {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('404 - Trang web không tồn tại');
    }
});

// Chạy server tại port 3000
server.listen(3000, () => {
    console.log('Server NodeJS đã khởi động!');
    console.log('Server đang chạy tại: http://localhost:3000');
});