const net = require('net');
const EventEmitter = require('events');
const ConnectionManager = require('./ConnectionManager');
const logger = require('../utils/logger');
const BufferManager = require('./BufferManager');
const protocolManager = require('../protocols/ProtocolManager');


class GPSServer extends EventEmitter {
    constructor(config){
        super();
        this.config = config;
        this.connectionManager = new ConnectionManager(this);
        this.bufferManager = new BufferManager();
        this.protocolManager = new protocolManager();
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

            this.isRunning = false;
            this.connectionManager.closeAllConnections();

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
            this.emit('mi-evento', connection.deviceId);
        });

        socket.on('end', () => {
            //console.log(`❌ Cliente desconectado: ${socket.remoteAddress}:${socket.remotePort}`);
            this.connectionManager.removeConnection(clientId);
        });

        socket.on('close', () => {
            //console.log(`🔒 Socket cerrado: ${socket.remoteAddress}:${socket.remotePort}`);
            this.connectionManager.removeConnection(clientId);
            this.emit('device-disconnected', connection.deviceId);
        });

        socket.on('error', (err) => {
            //console.error(`⚠️ Error con ${socket.remoteAddress}:${socket.remotePort} - ${err.message}`);
        });

        socket.on('timeout', () => {
            //logger.warn(`Socket timeout for ${clientId}`);
            console.log(`Socket timeout for ${clientId}`);
            socket.destroy();

        });

        



        




    }

    handleData(connection, data){

        

        try {
            // Actualizar última actividad
            connection.updateActivity();
            
            // Agregar datos al buffer
            this.bufferManager.addData(connection.id, data);
            
            // Procesar paquetes completos
            this.processPackets(connection);
            
        } catch (error) {
            logger.error(`Error processing data from ${connection.id}:`, error);
        }
      
      
      
      
      
      
      
        /*   logger.warn(data);
        //logger.info('packet', data);
        //console.log('aqui entro a manejar la data recibida', data);
        connection.updateActivity();
       // logger.debug(`Data received from ${connection.id}: ${data.toString().trim()}`);
        logger.info(`Data received from ${connection.id}: ${data.toString().trim()}`); */

        
       
    }

      processPackets(connection) {
        const packets = this.bufferManager.extractPackets(connection.id);
        
        for (const packet of packets) {
            console.log('Packet', packet);
            this.processPacket(connection, packet);
           
        }
    }

      async processPacket(connection, packet) {
        try {
            //console.log('Entramos a procesar el packet y definir el procotolo: ', connection.protocol);
            console.log('Packet raw:', packet, ' tamano del packet: ', packet.length);
            // Detectar protocolo si no está definido
            if (!connection.protocol) {
                const detectedProtocol = this.protocolManager.detectProtocol(packet);
                
                if (detectedProtocol) {
                    connection.setProtocol(detectedProtocol);
                    logger.warn(`Protocol detected for ${connection.id}: ${detectedProtocol}`);
                } else {
                    logger.warn(`Unknown protocol for ${connection.id}`);
                    return;
                }
            }

            // Parsear paquete
            const parsedData = this.protocolManager.parsePacket(connection.protocol, packet);
            
            if (!parsedData) {
                logger.warn(`Failed to parse packet from ${connection.id}`);
                return;
            }
            console.log('Parsed Data:', parsedData);


            // Procesar según tipo de datos
           // await this.handleParsedData(connection, parsedData);
            
            // Enviar respuesta si es necesaria
            const response = this.protocolManager.createResponse(connection.protocol, parsedData);
            if (response) {
                //connection.socket.write(response);
                //console.log(`Sending response to ${connection.id}:`, response);
            }

        } catch (error) {
            logger.error(`Error processing packet from ${connection.id}:`, error);
        }
    }
}

module.exports = GPSServer;