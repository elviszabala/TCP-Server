class DeviceRepository {
    constructor(sequelize) {
        this.models = sequelize.models;
    }

    async create(deviceData) {
        return this.models.Device.create(deviceData);
    }

    async findById(deviceId) {
        return this.models.Device.findByPk(deviceId, {
            include: ['positions', 'events', 'user']
        });
    }

    async findByImei(imei) {
        return this.models.Device.findOne({ where: { imei } });
    }

    async update(deviceId, updateData) {
        const device = await this.models.Device.findByPk(deviceId);
        if (!device) return null;
        return device.update(updateData);
    }

    async listByUser(userId) {
        return this.models.Device.findAll({ where: { user_id: userId } });
    }
}

module.exports = DeviceRepository;
