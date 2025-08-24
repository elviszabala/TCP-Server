const GPSServer = require('./core/GPSServer');




class App {
    constructor(config) {
        this.config = config;
        this.gpsServer = null;
        console.log('Constructor app');
        
    }

    async initializate(){
        //inicializamos la BBDD
        console.log('Inicializando');



        //inicializamos el servidor
        this.gpsServer = new GPSServer(this.config.gps);

    }

    async start(){
        await this.gpsServer.start();
        console.log('Se inicia el servidor en App file esperando la promesa await this.gpsServer.start');
    }

    async shutdown(){
        if (this.gpsServer) await this.gpsServer.stop();
    }


}

module.exports = App;