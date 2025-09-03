const GPSServer = require('./core/GPSServer');
const Database = require('./database/connection');




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
      



        //inicializamos el servidor
        this.gpsServer = new GPSServer(this.config.gps);

    }

    async start(){
        await this.gpsServer.start();
       
    }

    async shutdown(){
        if (this.gpsServer) await this.gpsServer.stop();
    }


}

module.exports = App;