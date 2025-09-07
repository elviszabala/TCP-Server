const BaseProtocol = require('./BaseProtocol');
const { parseDateTime, parseCoordinate } = require('../parsers/CoordinateParser');

class GT06Protocol extends BaseProtocol {
    constructor() {
        super('GT06');
        this.PROTOCOL_TYPES = {
            LOGIN: 0x01,
            POSITION: 0x22,
            HEARTBEAT: 0x23,
            ALARM: 0x26,
            STATUS: 0x19
        };
    }

    parse(buffer) {
        if (buffer.length < 5) {
            throw new Error('GT06 packet too short');
        }

        // Estructura básica: 0x78 0x78 [LENGTH] [PROTOCOL] [DATA] [SERIAL] [CHECKSUM] 0x0D 0x0A
        const packet = {
            startBits: buffer.readUInt16BE(0),
            length: buffer.readUInt8(2),
            protocol: buffer.readUInt8(3),
            data: null,
            serial: buffer.readUInt16BE(buffer.length - 4),
            checksum: buffer.readUInt16BE(buffer.length - 2),
            raw: buffer
        };

        // Validar estructura
        if (packet.startBits !== 0x7878) {
            throw new Error('Invalid GT06 start bits');
        }

        if (!this.validateChecksum(buffer)) {
            throw new Error('Invalid GT06 checksum');
        }

        // Extraer datos según tipo de protocolo
        const dataBuffer = buffer.slice(4, 4 + packet.length - 5);
        
        switch (packet.protocol) {
            case this.PROTOCOL_TYPES.LOGIN:
                packet.data = this.parseLogin(dataBuffer);
                packet.type = 'login';
                break;
                
            case this.PROTOCOL_TYPES.POSITION:
                packet.data = this.parsePosition(dataBuffer);
                packet.type = 'position';
                break;
                
            case this.PROTOCOL_TYPES.HEARTBEAT:
                packet.data = this.parseHeartbeat(dataBuffer);
                packet.type = 'heartbeat';
                break;
                
            case this.PROTOCOL_TYPES.ALARM:
                packet.data = this.parseAlarm(dataBuffer);
                packet.type = 'alarm';
                break;
                
            default:
                packet.data = { raw: dataBuffer };
                packet.type = 'unknown';
        }

        return packet;
    }

    parseLogin(data) {
        if (data.length < 8) {
            throw new Error('GT06 login data too short');
        }

        // IMEI (8 bytes)
        const imeiBuffer = data.slice(0, 8);
        let imei = '';
        for (let i = 0; i < 8; i++) {
            imei += imeiBuffer[i].toString(16).padStart(2, '0');
        }

        return {
            deviceId: imei,
            imei: imei,
            modelId: data.length > 8 ? data.readUInt16BE(8) : null
        };
    }

    parsePosition(data) {

        console.log('Data de posicion: ', data);
        if (data.length < 21) {
            throw new Error('GT06 position data too short');
        }

        const position = {
            timestamp: parseDateTime(data.slice(0, 6)),
            satellites: data.readUInt8(6) & 0x0F,
            latitude: parseCoordinate(data.readUInt32BE(7), false),
            longitude: parseCoordinate(data.readUInt32BE(11), true),
            speed: data.readUInt8(15),
            course: data.readUInt16BE(16) & 0x03FF,
            /*mcc: data.readUInt16BE(18),
            mnc: data.readUInt8(20),
            lac: data.readUInt16BE(21),
            cellId: data.readUInt32BE(23) & 0x00FFFFFF,
            acc: (data.readUInt8(16) & 0x20) > 0,
            dataUploadMode: (data.readUInt8(16) & 0x40) > 0,
            gpsRealTime: (data.readUInt8(16) & 0x80) > 0 */
        };

        // Información adicional si está disponible
        if (data.length > 27) {
            position.mileage = data.readUInt32BE(27);
        }

        return position;
    }

    parseHeartbeat(data) {
        return {
            terminalInfo: data.readUInt8(0),
            voltage: data.readUInt16BE(1) / 100, // Voltaje en V
            gsmSignal: data.readUInt8(3),
            language: data.readUInt16BE(4)
        };
    }

    parseAlarm(data) {
        const alarmTypes = {
            0x01: 'sos',
            0x02: 'power_cut',
            0x03: 'vibration',
            0x04: 'fence_in',
            0x05: 'fence_out',
            0x06: 'overspeed'
        };

        const position = this.parsePosition(data.slice(1)); // Skip alarm type byte
        
        return {
            alarmType: alarmTypes[data.readUInt8(0)] || 'unknown',
            alarmCode: data.readUInt8(0),
            ...position
        };
    }

    createResponse(parsedData) {
        // Crear respuesta de confirmación
        const response = Buffer.alloc(10);
        
        // Header
        response.writeUInt16BE(0x7878, 0);
        response.writeUInt8(0x05, 2); // Length
        response.writeUInt8(0x01, 3); // Response protocol
        response.writeUInt16BE(parsedData.serial, 4); // Serial number
        
        // Checksum
        const checksum = this.calculateChecksum(response.slice(2, 6));
        response.writeUInt16BE(checksum, 6);
        
        // End
        response.writeUInt16BE(0x0D0A, 8);
        
        return response;
    }

    validateChecksum(buffer) {
        if (buffer.length < 8) return false;
        
        const dataForChecksum = buffer.slice(2, buffer.length - 4);
        const receivedChecksum = buffer.readUInt16BE(buffer.length - 4);
        const calculatedChecksum = this.calculateChecksum(dataForChecksum);
        
        return receivedChecksum === calculatedChecksum;
    }

    calculateChecksum(data) {
        let checksum = 0;
        for (let i = 0; i < data.length; i++) {
            checksum += data[i];
        }
        return checksum & 0xFFFF;
    }
}

module.exports = GT06Protocol;