class Connection{
    constructor(id, socket) {
        this.id = id;
        this.socket = socket;
        this.deviceId = null;
        this.protocol = null;
        this.createdAt = new Date();
        this.lastActivity = new Date();
        this.isAuthenticated = false;
    }

    setDeviceId(deviceId) {
        this.deviceId = deviceId;
        this.isAuthenticated = true;
    }

    setProtocol(protocol) {
        this.protocol = protocol;
    }

    updateActivity() {
        this.lastActivity = new Date();
    }

    getInactiveTime() {
        return new Date() - this.lastActivity;
    }

    isActive() {
        return this.socket && !this.socket.destroyed && this.socket.writable;
    }
}


class ConnectionManager {
    constructor(gpsServer){
        this.gpsServer = gpsServer;
        this.connections = new Map(); // Map to hold active connections
        this.deviceConnections = new Map();

        // Monitoreo periódico de conexiones
        this.monitoringInterval = setInterval(() => {
            this.monitorConnections();
        }, 5000); // cada 5 segundos

    }

    addConnection(clientID, socket) {

        const connection = new Connection(clientID, socket);
        this.connections.set(clientID, connection);

        //console.log(`Connection added: ${clientID}. Total connections: ${this.connections.size}`);
        return connection;

    }
    removeConnection(clientId) {
        const connection = this.connections.get(clientId);
        if (connection) {
            // Remover mapeo de dispositivo
            if (connection.deviceId) {
                this.deviceConnections.delete(connection.deviceId);
            }
            
            this.connections.delete(clientId);
            //logger.debug(`Connection removed: ${clientId} (Total: ${this.connections.size})`);
            console.log(`Connection removed: ${clientId} (Total: ${this.connections.size})`)
        }
    }

     getConnection(clientId) {
        return this.connections.get(clientId);
    }

    getConnectionByDeviceId(deviceId) {
        const clientId = this.deviceConnections.get(deviceId);
        return clientId ? this.connections.get(clientId) : null;
    }

    mapDeviceConnection(deviceId, clientId) {
        this.deviceConnections.set(deviceId, clientId);
    }

    getActiveConnectionsCount() {
        return Array.from(this.connections.values()).filter(conn => conn.isActive()).length;
    }

    getAuthenticatedConnectionsCount() {
        return Array.from(this.connections.values()).filter(conn => conn.isAuthenticated).length;
    }

    messageTest(clientId){
        //console.log('Para remover: ', this.connections.get(clientId));
        
    }

   monitorConnections(){
        const now = new Date();
        const timeout = 300000; // 5 minutos
        //const timeout = 6000; // 5 minutos
        const inactiveConnections = [];
        //console.log(`Total connections: ${this.connections.size}`);

        for (const [clientId, connection] of this.connections){
            //console.log(connection.id, connection.createdAt, connection.isActive(), connection.lastActivity);
             if (!connection.isActive()){
                inactiveConnections.push(clientId);
            } else if(connection.getInactiveTime() > timeout){

                

                inactiveConnections.push(clientId);


            }
        }

        inactiveConnections.forEach(clientId =>{
            this.removeConnection(clientId);
        });

        // Log de estadísticas
        if (this.connections.size > 0) {
            //logger.debug(`Connections: ${this.connections.size} total, ${this.getActiveConnectionsCount()} active, ${this.getAuthenticatedConnectionsCount()} authenticated`);
        }
        

    }

    closeAllConnections() {

        //logger.info('Closing all connections...');
        
        for (const [clientId, connection] of this.connections) {
            if (connection.isActive()) {
                connection.socket.destroy();
            }
        }
        
        this.connections.clear();
        this.deviceConnections.clear();
        
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
        }

    }
}

module.exports = ConnectionManager;