require('dotenv').config();

//console.log('Environment Variables:', process.env.GPS_SERVER_PORT);

const config = {

    gps: {
        port: process.env.GPS_SERVER_PORT || 8080,
        host: process.env.GPS_SERVER_HOST || '0.0.0.0',
        timeout: parseInt(process.env.GPS_TIMEOUT) || 60000, // 5 minutos
        keepAliveInterval: parseInt(process.env.KEEP_ALIVE_INTERVAL) || 30000, // 30 segundos
        maxConnections: parseInt(process.env.MAX_CONNECTIONS) || 1000,
        bufferSize: parseInt(process.env.BUFFER_SIZE) || 4096

    },

     // Configuración de WebSocket
    websocket: {
        port: parseInt(process.env.WS_PORT) || 3001,
        path: '/socket.io',
        cors: {
            origin: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : ['http://localhost:3000'],
            methods: ['GET', 'POST']
        }
    },
    
    // Configuración de base de datos
    database: {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT) || 3306,
        database: process.env.DB_NAME || 'gps_tracking',
        username: process.env.DB_USER || 'test',
        password: process.env.DB_PASSWORD || 'test',
        dialect: 'mysql',
        logging: process.env.NODE_ENV === 'development' ? console.log : false,
        pool: {
            max: parseInt(process.env.DB_POOL_MAX) || 10,
            min: parseInt(process.env.DB_POOL_MIN) || 0,
            acquire: parseInt(process.env.DB_POOL_ACQUIRE) || 30000,
            idle: parseInt(process.env.DB_POOL_IDLE) || 10000
        }
    },
}


module.exports = config;