// events/AppEmitter.js  (phiên bản đơn giản - không có eventCount)

const EventEmitter = require('events');
const fs = require('fs');
const path = require('path');

class AppEmitter extends EventEmitter {
    constructor() {
        super();
        this.logFilePath = path.join(__dirname, '../data/log.txt');
    }

    trigger(eventName, data = {}) {
        const logData = {
            timestamp: new Date().toISOString(),
            eventName,
            data
        };

        this.logToFile(eventName, logData);
        console.log(`[AppEmitter] Emit event: "${eventName}"`, data);
        this.emit(eventName, data);
    }

    logToFile(eventName, logData) {
        const logMsg = `[${logData.timestamp}] Sự kiện: ${eventName} | Dữ liệu: ${JSON.stringify(logData.data)}\n`;

        fs.appendFile(this.logFilePath, logMsg, (err) => {
            if (err) console.error("Lỗi ghi log:", err.message);
            else console.log(`Ghi log: ${eventName}`);
        });
    }
}

module.exports = AppEmitter;