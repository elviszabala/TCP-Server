const net = require('net');
const EventEmitter = require('events');


class GPSServer extends EventEmitter {
    constructor(config){
        super();
        this.config = config;
        this.server = null;
        this.isRunning = false;
    }

    async start(){
        return new Promise((resolve, reject) =>{
            console.log('inicio de la promesa');

            this.server = net.createServer();

            this.server.on('connection', (socket) =>{
                //this.emit('connection', socket);
                console.log('New GPS connection established', socket.address);
            });

             this.server.on('error', (socket) =>{
                //this.emit('connection', socket);
                console.log('New GPS connection established in error', socket);
            });

            this.server.listen(this.config.port, this.config.host, ()=>{
                this.isRunning = true;
                console.log(`GPS Server listening on ${this.config.host}:${this.config.port}`);
                resolve();
            });



        });

    }

    async stop(){
        return new Promise((resolve) =>{
            if(!this.isRunning){
                resolve();
                return;
            }

            this.server.close(() =>{
                this.isRunning = false;
                resolve();
            });
        });
    }
}

module.exports = GPSServer;