const PositionRepository = require('../database/repositories/PositionRepository');
const EventBus = require('../core/EventBus');

class PositionService {
    async savePosition(deviceId, positionData) {
        const position = await PositionRepository.create(deviceId, positionData);
        
        // Emitir posición en tiempo real
        EventBus.emit('position:new', { deviceId, position });
        
        return position;
    }

    async getLastPosition(deviceId) {
        return PositionRepository.findLastByDevice(deviceId);
    }

    async getHistory(deviceId, from, to) {
        return PositionRepository.findBetween(deviceId, from, to);
    }
}

module.exports = new PositionService();
