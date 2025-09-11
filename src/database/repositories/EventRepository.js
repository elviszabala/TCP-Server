class EventRepository {
    constructor(sequelize) {
        this.models = sequelize.models;
    }

    async save(eventData) {
        return this.models.Event.create(eventData);
    }

    async getByDevice(deviceId, limit = 50) {
        return this.models.Event.findAll({
            where: { device_id: deviceId },
            order: [['timestamp', 'DESC']],
            limit
        });
    }

    async getByType(type, start, end) {
        return this.models.Event.findAll({
            where: {
                type,
                timestamp: { [this.models.Sequelize.Op.between]: [start, end] }
            },
            order: [['timestamp', 'DESC']]
        });
    }
}

module.exports = EventRepository;
