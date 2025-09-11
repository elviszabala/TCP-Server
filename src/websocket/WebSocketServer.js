const WebSocket = require("ws");
const SocketManager = require("./SocketManager");
const logger = require("../utils/logger");


class WebSocketServer {
    constructor(config){
        this.config = config;
        this.wss = null;
        this.socketManager = null;
    }

    async start() {
    return new Promise((resolve, reject) => {
      try {
        this.wss = new WebSocket.Server({ port: this.config.port });
        this.socketManager = new SocketManager(this.wss);

        this.wss.on("connection", (ws, req) => {
          logger.info("Nuevo cliente conectado a WebSocket");
          this.socketManager.handleConnection(ws, req);
        });

        this.wss.on("listening", () => {
          logger.info(`WebSocketServer escuchando en puerto ${this.config.port}`);
          resolve();
        });

        this.wss.on("error", (err) => {
          logger.error("Error en WebSocketServer:", err);
          reject(err);
        });
      } catch (err) {
        reject(err);
      }
    });
  }

    async stop() {
        if (this.wss) {
            this.wss.close();
            logger.info("WebSocketServer detenido");
        }
    }

    broadcast(type, payload) {

        console.log('Entro al broadcast');
        if (!this.wss) return;
        const message = JSON.stringify({ type, payload });
        

        this.wss.clients.forEach((client) => {
            console.log('Si entro a esto');
            if (client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        }); 
    }





}

module.exports = WebSocketServer;