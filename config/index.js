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
}


module.exports = config;