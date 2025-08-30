const App = require('./App');
const config = require('../config');
const logger = require('./utils/logger');


//console.log(`Chargin port... ${config.gps.port}`);

async function startServer() {
    try {

       const app = new App(config);
       await app.initializate();
       await app.start();
       logger.info(`GPS Tracking Server started on port ${config.gps.port}`);
      
       process.on('SIGTERM', async () => {
            logger.info('SIGTERM received, shutting down gracefully');
            console.log('SIGTERM received, shutting down gracefully');
            await app.shutdown();
            process.exit(0);
        });
        
        process.on('SIGINT', async () => {
            logger.info('SIGINT received, shutting down gracefully');
            console.log('SIGINT received, shutting down gracefully');
            await app.shutdown();
            process.exit(0);
        });
        





        
        
    } catch (error) {
        console.error('Error starting server:', error);
        process.exit(1);
        
    }
    
}

startServer();