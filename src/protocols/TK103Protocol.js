const BaseProtocol = require('./BaseProtocol');

class TK103Protocol extends BaseProtocol {
    constructor() {
        super('TK103');
    }

    parse(buffer) {
        // TK103 es un protocolo ASCII
        const text = buffer.toString('ascii').trim();
        
        // Ejemplo: *HQ,8612345678,V1,121459,A,-23.545450,-46.639308,000.0,000,070315,FFFFFBFF#
        if (!text.startsWith('*HQ,') || !text.endsWith('#')) {
            throw new Error('Invalid TK103 packet format');
        }

        // Remover delimitadores
        const content = text.slice(4, -1);
        const parts = content.split(',');

        if (parts.length < 10) {
            throw new Error('TK103 packet too short');
        }

        const packet = {
            imei: parts[0],
            command: parts[1],
            time: parts[2],
            status: parts[3], // A = valid, V = invalid
            latitude: parseFloat(parts[4]),
            longitude: parseFloat(parts[5]),
            speed: parseFloat(parts[6]),
            course: parseInt(parts[7]),
            date: parts[8],
            io: parts[9] || '',
            raw: buffer
        };

        // Determinar tipo según comando
        if (packet.command.startsWith('V')) {
            packet.type = 'position';
            packet.data = this.parsePosition(packet);
        } else if (packet.command === 'A10') {
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
            timestamp: this.parseTK103DateTime(packet.date, packet.time),
            latitude: packet.latitude,
            longitude: packet.longitude,
            speed: packet.speed * 1.852, // Convertir knots a km/h
            course: packet.course,
            valid: packet.status === 'A',
            io: packet.io
        };
    }

    parseHeartbeat(packet) {
        return {
            deviceId: packet.imei,
            timestamp: this.parseTK103DateTime(packet.date, packet.time)
        };
    }

    parseTK103DateTime(dateStr, timeStr) {
        // Fecha: DDMMYY, Hora: HHMMSS
        if (dateStr.length !== 6 || timeStr.length !== 6) {
            throw new Error('Invalid TK103 datetime format');
        }

        const day = parseInt(dateStr.substr(0, 2));
        const month = parseInt(dateStr.substr(2, 2)) - 1;
        const year = 2000 + parseInt(dateStr.substr(4, 2));
        
        const hour = parseInt(timeStr.substr(0, 2));
        const minute = parseInt(timeStr.substr(2, 2));
        const second = parseInt(timeStr.substr(4, 2));

        return new Date(year, month, day, hour, minute, second);
    }

    createResponse(parsedData) {
        // TK103 requiere respuesta de confirmación
        const response = `*HQ,${parsedData.data.deviceId},V1,000000,A#`;
        return Buffer.from(response, 'ascii');
    }
}

module.exports = TK103Protocol;