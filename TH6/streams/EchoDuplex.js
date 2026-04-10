const { Duplex } = require('stream');

// Nhận dữ liệu gì thì trả về đúng dữ liệu đó kèm theo prefix
class EchoDuplex extends Duplex {
    constructor(options) {
        super(options);
        this.dataBuffer = [];
    }

    _read(size) {
        if (this.dataBuffer.length > 0) {
            this.push("Echo server phản hồi: " + this.dataBuffer.shift());
        } else {
            this.push(null);
        }
    }

    _write(chunk, encoding, callback) {
        this.dataBuffer.push(chunk.toString());
        callback();
    }
}
module.exports = EchoDuplex;