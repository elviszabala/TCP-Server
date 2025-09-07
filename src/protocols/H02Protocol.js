const BaseProtocol = require('./BaseProtocol');
const logger = require('../utils/logger');

class H02Protocol extends BaseProtocol {
    constructor() {
        super('H02');
    }

    parse(buffer) {
        // H02 es un protocolo ASCII que comienza con $
        const text = buffer.toString('ascii').trim();
        
        if (!text.startsWith('$')) {
            throw new Error('Invalid H02 packet start');
        }

        // Ejemplo: $A35,8612345678,AAA,35,7.092470,100.334955,140101134652,A,10,7,0,0,6#
        const parts = text.split(',');
        
        if (parts.length < 12) {
            throw new Error('H02 packet too short');
        }

        const packet = {
            header: parts[0], // $A35
            imei: parts[1],
            command: parts[2], // AAA, etc.
            length: parseInt(parts[3]),
            latitude: parseFloat(parts[4]),
            longitude: parseFloat(parts[5]),
            datetime: parts[6],
            status: parts[7], // A = valid, V = invalid
            speed: parseInt(parts[8]),
            direction: parseInt(parts[9]),
            altitude: parseInt(parts[10]),
            satellites: parseInt(parts[11]),
            raw: buffer
        };

        // Determinar tipo de paquete
        if (packet.command === 'AAA') {
            packet.type = 'position';
            packet.data = this.parsePosition(packet);
        } else if (packet.command === 'NBR') {
            packet.type = 'heartbeat';
            packet.data = this.parseHeartbeat(packet);
        } else {
            packet.type = 'unknown';
            packet.data = { command: packet.command };
        }

        return packet;
    }

    parsePosition(packet) {
        return {
            deviceId: packet.imei,
            timestamp: this.parseH02DateTime(packet.datetime),
            latitude: packet.latitude,
            longitude: packet.longitude,
            speed: packet.speed,
            course: packet.direction,
            altitude: packet.altitude,
            satellites: packet.satellites,
            valid: packet.status === 'A'
        };
    }

    parseHeartbeat(packet) {
        return {
            deviceId: packet.imei,
            timestamp: this.parseH02DateTime(packet.datetime)
        };
    }

    parseH02DateTime(dateTimeStr) {
        // Formato: YYMMDDHHMMSS (140101134652)
        if (dateTimeStr.length !== 12) {
            throw new Error('Invalid H02 datetime format');
        }

        const year = 2000 + parseInt(dateTimeStr.substr(0, 2));
        const month = parseInt(dateTimeStr.substr(2, 2)) - 1; // JavaScript months are 0-based
        const day = parseInt(dateTimeStr.substr(4, 2));
        const hour = parseInt(dateTimeStr.substr(6, 2));
        const minute = parseInt(dateTimeStr.substr(8, 2));
        const second = parseInt(dateTimeStr.substr(10, 2));

        return new Date(year, month, day, hour, minute, second);
    }
}

module.exports = H02Protocol;