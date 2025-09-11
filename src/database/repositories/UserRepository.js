class UserRepository {
    constructor(sequelize) {
        this.models = sequelize.models;
    }

    async create(userData) {
        return this.models.User.create(userData);
    }

    async findById(userId) {
        return this.models.User.findByPk(userId, {
            include: ['devices']
        });
    }

    async findByEmail(email) {
        return this.models.User.findOne({ where: { email } });
    }

    async update(userId, updateData) {
        const user = await this.models.User.findByPk(userId);
        if (!user) return null;
        return user.update(updateData);
    }

    async listAll() {
        return this.models.User.findAll();
    }
}

module.exports = UserRepository;
