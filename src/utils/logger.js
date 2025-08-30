const winston = require('winston');
const path = require('path');

//de4fino el directorio de logs
const fs = require('fs');
const logDirectory = path.join(__dirname, '../../logs');
if (!fs.existsSync(logDirectory)){
    fs.mkdirSync(logDirectory, { recursive: true});

}

//configuro winston

const logger  = winston.createLogger({
    //level: process.env.LOG_LEVEL || 'info',
   

     format: winston.format.combine(
        winston.format.timestamp({
            format: 'YYYY-MM-DD HH:mm:ss'
        }),
        winston.format.errors({ stack: true }),
        winston.format.json()
    ),
    transports: [
         // Archivo para errores
        new winston.transports.File({
            filename: path.join(logDirectory, 'error.log'),
            level: 'error',
            maxsize: 5242880, // 5MB
            maxFiles: 5,
            tailable: true
        }),

           new winston.transports.File({
            filename: path.join(logDirectory, 'packet.log'),
            level: 'warn',
            maxsize: 5242880, // 5MB
            maxFiles: 5,
            tailable: true
        }),

          
    
        
        // Archivo para todos los logs
        new winston.transports.File({
            filename: path.join(logDirectory, 'app.log'),
            maxsize: 5242880, // 5MB
            maxFiles: 5,
            tailable: true
        })

    ]
      
});

// En desarrollo, también mostrar en consola
if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
        )
    }));
}

module.exports = logger;