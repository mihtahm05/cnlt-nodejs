const EventEmitter = require('events');
const fs = require('fs');
const path = require('path');

// Kế thừa EventEmitter (giống slide bài 2)
class AppEmitter extends EventEmitter {
    constructor() {
        super();
        this.logFilePath = path.join(__dirname, '../data/log.txt');
    }

    // Ghi log ra file
    logToFile(eventName, data) {
        const time = new Date().toISOString();
        const logMsg = `[${time}] Sự kiện: ${eventName} | Dữ liệu: ${JSON.stringify(data)}\n`;

        fs.appendFile(this.logFilePath, logMsg, (err) => {
            if (err) console.error("Lỗi ghi log:", err);
        });
    }
}

module.exports = AppEmitter;