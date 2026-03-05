const http = require('http') // Tạo import http
const server = http.createServer((req, res) => { //(tạo web sever gồm req và res)
    console.log(req.url)
    const url = req.url
    res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
   if (url === '/' || url === ''){
    res.end('Trang chủ')
   } else if (url === '/about'){
    res.end('Trang giới thiệu')
   } else if (url === '/contact'){
    res.end('Trang liên hệ')
   } else {
    res.writeHead(404, {'Content-Type': 'text/plain; charset=utf-8'});
    res.end('Không tìm thấy trang')
   }
})

server.listen(3000)