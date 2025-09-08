const GPSServer = require('./core/GPSServer');
const Database = require('./database/connection');
const WebSocketServer = require('./websocket/WebSocketServer');




class App {
    constructor(config) {
        this.config = config;
        this.gpsServer = null;
        this.database = null;
        this.wsServer =null;
        
        
    }

    async initializate(){
        //inicializamos la BBDD
        this.database = new Database(this.config.database);
        await this.database.connect();
      



        //inicializamos el servidores
        this.gpsServer = new GPSServer(this.config.gps);
        this.wsServer = new WebSocketServer(this.config.websocket);

        this.setupEventHandlers();

    }

     setupEventHandlers() {
        // GPS Server -> WebSocket (posiciones en tiempo real)

            this.gpsServer.on('position', (data) => {
                this.wsServer.broadcast('position', data);
                //console.log('Position event for:', data);
            });

            // GPS Server -> API (eventos de dispositivos)
            this.gpsServer.on('device-connected', (deviceId) => {
                this.wsServer.broadcast('device-status', { deviceId, status: 'online' });
            });

            this.gpsServer.on('device-disconnected', (deviceId) => {
                this.wsServer.broadcast('device-status', { deviceId, status: 'offline' });
            });
     }

    async start(){
        await this.gpsServer.start();
         await this.wsServer.start();
       
    }

    async shutdown(){
        if (this.gpsServer) await this.gpsServer.stop();
         if (this.wsServer) await this.wsServer.stop();
    }


}

module.exports = App;