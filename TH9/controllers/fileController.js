const fs = require('fs');

const readSync = (req, res) => {
    console.log("Bắt đầu đọc file đồng bộ...");
    // Blocking: Server phải chờ tác vụ hoàn thành, không xử lý việc khác.
    const data = fs.readFileSync('data.txt', 'utf8');
    console.log("Đọc file đồng bộ xong!");
    res.status(200).json({ message: "Đọc đồng bộ xong", data });
};

const readAsync = (req, res) => {
    console.log("Bắt đầu đọc file bất đồng bộ...");
    // Non-blocking: Server giao tác vụ I/O đi xử lý, tiếp tục làm việc khác[cite: 174, 175].
    fs.readFile('data.txt', 'utf8', (err, data) => {
        if (err) return res.status(500).json({ error: err });
        console.log("Đọc file bất đồng bộ xong!");
        res.status(200).json({ message: "Đọc bất đồng bộ xong", data });
    });
    console.log("Lệnh readFile đã được đẩy ra background chạy...");
};

module.exports = { readSync, readAsync };