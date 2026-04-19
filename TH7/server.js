const http = require('http');
const url = require('url');
const fs = require('fs');

// ====================== TẠO ẢNH CAT.PNG (CHỈ CHẠY 1 LẦN) ======================
const base64String = "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";

const catPngBuffer = Buffer.from(base64String, "base64");
fs.writeFile('files/cat.png', catPngBuffer, (err) => {
    if (err) throw err;
    console.log('✅ cat.png đã được tạo thành công!');
});

// ====================== TẠO FILE cats.txt VÀ ĐỔI TÊN THÀNH "những con mèo.txt" ======================
let fileContent = 'Ragdoll, Scottish fold, British shorthair...';
let filePath = 'files/cats.txt';

// 1. Tạo file cats.txt
fs.writeFile(filePath, fileContent, (err) => {
    if (err) throw err;
    console.log('✅ The file cats.txt was successfully saved.');

    // 2. Đổi tên thành "những con mèo.txt"
    fs.rename('files/cats.txt', 'files/những con mèo.txt', (renameErr) => {
        if (renameErr) throw renameErr;
        console.log('✅ Đổi tên thành "những con mèo.txt" thành công!');
    });
});
// ==================================================================================================

const server = http.createServer((req, res) => {
    let urlData = url.parse(req.url, true);
    let fileName = './views' + urlData.pathname;

    if (urlData.pathname === '/') {
        fileName = './views/index.html';
    }

    fs.readFile(fileName, (err, data) => {
        if (err) {
            console.log(err);
            res.writeHead(404, { 'Content-Type': 'text/html' });
            res.write('404 Not Found');
            return res.end();
        }
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.write(data);
        return res.end();
    });
});

server.listen(8017, 'localhost', () => {
    console.log('🚀 Server chạy tại http://localhost:8017');
});