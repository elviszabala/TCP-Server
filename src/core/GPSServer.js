const net = require('net');
const EventEmitter = require('events');
const ConnectionManager = require('./ConnectionManager');


class GPSServer extends EventEmitter {
    constructor(config){
        super();
        this.config = config;
        this.connectionManager = new ConnectionManager(this);

        this.server = null;
        this.isRunning = false;
    }

    async start(){
        return new Promise((resolve, reject) =>{
            

            this.server = net.createServer();

            this.server.on('connection', (socket) =>{
                //this.emit('connection', socket);
                console.log('New GPS connection established', socket.remoteAddress);
                this.handleNewConnection(socket);
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

    handleNewConnection(socket){
        
        const clientId = `${socket.remoteAddress}:${socket.remotePort}`;

        socket.setTimeout(this.config.timeout);
        socket.setKeepAlive(true, this.config.keepAliveInterval);
        socket.setNoDelay(true);

        const connection = this.connectionManager.addConnection(clientId, socket);

         socket.on('data', (data) => {
            //console.log(`📨 Mensaje recibido de ${socket.remoteAddress}:${socket.remotePort} -> ${data}`);
            //this.connectionManager.message();
            this.handleData(connection, data);
            this.connectionManager.messageTest(clientId);
        });

        socket.on('end', () => {
            console.log(`❌ Cliente desconectado: ${socket.remoteAddress}:${socket.remotePort}`);
            //this.connectionManager.removeConnection(clientId);
        });

        socket.on('close', () => {
            console.log(`🔒 Socket cerrado: ${socket.remoteAddress}:${socket.remotePort}`);
        });

        socket.on('error', (err) => {
            console.error(`⚠️ Error con ${socket.remoteAddress}:${socket.remotePort} - ${err.message}`);
        });

        socket.on('timeout', () => {
            //logger.warn(`Socket timeout for ${clientId}`);
            console.log(`Socket timeout for ${clientId}`);
            socket.destroy();

        });

        



        




    }

    handleData(connection, data){
       console.log('aqui entro a manejar la data recibida', data);
        connection.updateActivity();
        
       
    }
}

module.exports = GPSServer;