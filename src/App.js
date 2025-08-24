const GPSServer = require('./core/GPSServer');




class App {
    constructor(config) {
        this.config = config;
        this.gpsServer = null;
        
        
    }

    async initializate(){
        //inicializamos la BBDD
      



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