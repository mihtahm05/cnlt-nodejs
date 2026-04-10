const { Transform } = require('stream');

// Biến đổi Text thành Chữ IN HOA
class TextTransform extends Transform {
    _transform(chunk, encoding, callback) {
        const result = chunk.toString().toUpperCase();
        this.push(result);
        callback();
    }
}
module.exports = TextTransform;