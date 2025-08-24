const App = require('./App');
const config = require('../config');


//console.log(`Chargin port... ${config.gps.port}`);

async function startServer() {
    try {

       const app = new App(config);
       console.log('Creamos la instancia de App');
       await app.initializate();
       console.log('Ahora esperamos la promesa app.initializate');
       await app.start();
       console.log('Ahora esperamos la promesa app.start');

      
       process.on('SIGTERM', async () => {
            //logger.info('SIGTERM received, shutting down gracefully');
            await app.shutdown();
            process.exit(0);
        });
        
        process.on('SIGINT', async () => {
            //logger.info('SIGINT received, shutting down gracefully');
            await app.shutdown();
            process.exit(0);
        });
        





        
        
    } catch (error) {
        console.error('Error starting server:', error);
        process.exit(1);
        
    }
    
}

startServer();