class PositionRepository {
    constructor(sequelize) {
        this.models = sequelize.models;
    }

    async save(positionData) {
        return this.models.Position.create(positionData);
    }

    async getLastPosition(deviceId) {
        return this.models.Position.findOne({
            where: { device_id: deviceId },
            order: [['timestamp', 'DESC']]
        });
    }

    async getPositionsInRange(deviceId, start, end) {
        return this.models.Position.findAll({
            where: {
                device_id: deviceId,
                timestamp: { [this.models.Sequelize.Op.between]: [start, end] }
            },
            order: [['timestamp', 'ASC']]
        });
    }
}

module.exports = PositionRepository;
