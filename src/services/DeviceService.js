const DeviceRepository = require('../database/repositories/DeviceRepository');
const EventBus = require('../core/EventBus');

class DeviceService {
    async registerDevice(deviceData) {
        const device = await DeviceRepository.create(deviceData);
        EventBus.emit('device:registered', device);
        return device;
    }

    async updateStatus(deviceId, status) {
        const device = await DeviceRepository.updateStatus(deviceId, status);
        EventBus.emit('device:status', { deviceId, status });
        return device;
    }

    async getById(deviceId) {
        return DeviceRepository.findById(deviceId);
    }

    async listByUser(userId) {
        return DeviceRepository.findByUser(userId);
    }
}

module.exports = new DeviceService();
