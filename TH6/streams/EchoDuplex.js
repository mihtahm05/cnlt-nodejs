const { Duplex } = require('stream');

// Nhận dữ liệu gì thì trả về đúng dữ liệu đó kèm theo prefix
class EchoDuplex extends Duplex {
    constructor(options) {
        super(options);
    }

    // Khi có dữ liệu viết vào (từ form POST)
    _write(chunk, encoding, callback) {
        const message = chunk.toString();

        // Echo ngay lập tức: đẩy dữ liệu ra readable side
        this.push(`Echo server phản hồi: ${message}\n`);

        callback(); // Quan trọng: phải gọi callback để thông báo đã xử lý xong chunk
    }

    // Readable side không cần làm gì nhiều vì chúng ta đã push trực tiếp trong _write
    _read(size) {
        // Để trống hoặc có thể để this.push(null) nếu muốn chủ động kết thúc,
        // nhưng ở đây không cần vì Duplex sẽ tự kết thúc khi writable kết thúc
    }

    // Tùy chọn: Đảm bảo readable side kết thúc khi writable side kết thúc
    _final(callback) {
        this.push(null);   // Kết thúc readable stream
        callback();
    }
}

module.exports = EchoDuplex;