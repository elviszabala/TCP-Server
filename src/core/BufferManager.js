const logger = require('../utils/logger');

class BufferManager {
    constructor() {
        this.buffers = new Map(); // connectionId -> Buffer
        this.maxBufferSize = 4096; // 4KB máximo por buffer
    }

    addData(connectionId, data) {
        let buffer = this.buffers.get(connectionId);
        
        
        if (!buffer) {
            buffer = Buffer.alloc(0);
        }

        // Concatenar nuevos datos
        buffer = Buffer.concat([buffer, data]);

        // Verificar límite de buffer
        if (buffer.length > this.maxBufferSize) {
            logger.warn(`Buffer overflow for connection ${connectionId}, truncating`);
            buffer = buffer.slice(-this.maxBufferSize);
        }

        this.buffers.set(connectionId, buffer);
       // console.log('Buffer actual para', connectionId, ':', buffer);
        //console.log('Buffer global:', this.buffers);
    }

    extractPackets(connectionId) {
        //console.log('Extrayendo');
        const buffer = this.buffers.get(connectionId);
        if (!buffer || buffer.length === 0) {
            console.log('No hay buffer');
            return [];
        }

        const packets = [];
        let processed = 0;

        while (processed < buffer.length) {
            const packetInfo = this.findNextPacket(buffer, processed);
            
            if (!packetInfo) {
                //console.log('No se encontró paquete completo', packetInfo);
                break; // No se encontró paquete completo
            }

            const { start, length } = packetInfo;
            
            if (start + length > buffer.length) {
                console.log('Packet imcomplete');
                break; // Paquete incompleto
            }

            // Extraer paquete
            const packet = buffer.slice(start, start + length);
            packets.push(packet);
            
            processed = start + length;
        }

        // Actualizar buffer con datos no procesados
        if (processed > 0) {
            const remainingBuffer = buffer.slice(processed);
            this.buffers.set(connectionId, remainingBuffer);
        }

        return packets;
    }

   findNextPacket(buffer, startIndex) {
        // Buscar patrones comunes de inicio de paquete
        for (let i = startIndex; i < buffer.length - 1; i++) {
            // GT06 Protocol: 0x78 0x78
            if (buffer[i] === 0x78 && buffer[i + 1] === 0x78) {
                if (i + 2 < buffer.length) {
                    const length = buffer[i + 2] + 5; // length byte + header + checksum
                    return { start: i, length: length };
                }
            }
            
            // H02 Protocol: 0x24 0x24
            if (buffer[i] === 0x24 && buffer[i + 1] === 0x24) {
                // Buscar el final del paquete H02 (termina con 0x0D 0x0A)
                for (let j = i + 2; j < buffer.length - 1; j++) {
                    if (buffer[j] === 0x0D && buffer[j + 1] === 0x0A) {
                        return { start: i, length: j - i + 2 };
                    }
                }
            }
            
            // TK103 Protocol: ASCII text starting with *HQ,
            if (buffer[i] === 0x2A && // *
                i + 3 < buffer.length &&
                buffer[i + 1] === 0x48 && // H
                buffer[i + 2] === 0x51 && // Q
                buffer[i + 3] === 0x2C) { // ,
                // Buscar el final del paquete (termina con #)
                for (let j = i + 4; j < buffer.length; j++) {
                    if (buffer[j] === 0x23) { // #
                        return { start: i, length: j - i + 1 };
                    }
                }
            }
        }
        
        return null;
    }

    clearBuffer(connectionId) {
        this.buffers.delete(connectionId);
    }

    getBufferSize(connectionId) {
        const buffer = this.buffers.get(connectionId);
        return buffer ? buffer.length : 0;
    }
}

module.exports = BufferManager;