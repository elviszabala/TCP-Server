const { Sequelize } = require('sequelize');
const logger = require('../utils/logger');

class Database {
    constructor(config){
         this.config = config;
        this.sequelize = null;
        this.isConnected = false;
    }

    async connect (){
         try {
            this.sequelize = new Sequelize({
                dialect: this.config.dialect,
                host: this.config.host,
                port: this.config.port,
                database: this.config.database,
                username: this.config.username,
                password: this.config.password,
                logging: this.config.logging,
                pool: this.config.pool,
                define: {
                    timestamps: true,
                    underscored: true,
                    freezeTableName: true
                }
            });

            // Probar conexión
            await this.sequelize.authenticate();
            this.isConnected = true;
            logger.info('Database connection established successfully');

            // Configurar modelos
            await this.setupModels();

        } catch (error) {
            logger.error('Unable to connect to database:', error);
            throw error;
        }
    }

    async setupModels(){

        //Modelos

        const Device = require('../models/Device')(this.sequelize);




         // Sincronizar modelos (solo en desarrollo)
        if (process.env.NODE_ENV === 'development') {
            await this.sequelize.sync({ alter: true });
            logger.info('Database models synchronized');
        }
    }

     async disconnect() {
        if (this.sequelize && this.isConnected) {
            await this.sequelize.close();
            this.isConnected = false;
            logger.info('Database connection closed');
        }
    }

    getSequelize() {
        return this.sequelize;
    }

    async testConnection() {
        try {
            await this.sequelize.authenticate();
            return true;
        } catch (error) {
            logger.error('Database connection test failed:', error);
            return false;
        }
    }
}

module.exports = Database;