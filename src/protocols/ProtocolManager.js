const GT06Protocol = require('./GT06Protocol');
const H02Protocol = require('./H02Protocol');
const TK103Protocol = require('./TK103Protocol');
const logger = require('../utils/logger');

class ProtocolManager {
    constructor() {
        this.protocols = {
            'GT06': new GT06Protocol(),
            'H02': new H02Protocol(),
            'TK103': new TK103Protocol()
        };
    }

    detectProtocol(data) {
        console.log('Detecting protocol for data:', data);
        // GT06 Protocol detection
        if (data.length >= 2 && data[0] === 0x78 && data[1] === 0x78) {
            console.log('GT06');
            return 'GT06';
        }
        
        // H02 Protocol detection
        if (data.length >= 2 && data[0] === 0x24 && data[1] === 0x24) {
            return 'H02';
        }
        
        // TK103 Protocol detection
        if (data.length >= 4) {
            const text = data.toString('ascii', 0, 4);
            if (text === '*HQ,') {
                return 'TK103';
            }
        }
        
        logger.info('Unknown protocol detected:', data.slice(0, Math.min(data.length, 20)).toString('hex'));
        return null;
    }

    parsePacket(protocolType, data) {
        const protocol = this.protocols[protocolType];
        //console.log('El protocolo es: ', protocol);
        if (!protocol) {
            logger.error(`Protocol ${protocolType} not supported`);
            return null;
        }

        try {
            return protocol.parse(data);
        } catch (error) {
            logger.error(`Error parsing ${protocolType} packet:`, error);
            return null;
        }
    }

    createResponse(protocolType, parsedData) {
        const protocol = this.protocols[protocolType];
        if (!protocol || !protocol.createResponse) {
            return null;
        }

        try {
            return protocol.createResponse(parsedData);
        } catch (error) {
            logger.error(`Error creating ${protocolType} response:`, error);
            return null;
        }
    }

    getSupportedProtocols() {
        return Object.keys(this.protocols);
    }
}

module.exports = ProtocolManager;