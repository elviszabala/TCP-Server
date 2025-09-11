const DeviceRoom = require("./rooms/DeviceRoom");
const UserRoom = require("./rooms/UserRoom");
const positionHandler = require("./handlers/positionHandler");
const eventHandler = require("./handlers/eventHandler");
const logger = require("../utils/logger");

class SocketManager {
  constructor(wss) {
    this.wss = wss;
    this.clients = new Map(); // clientId → ws
  }

  handleConnection(ws, req) {
    console.log('EMpezamos a manejar la conexion');
    const params = new URLSearchParams(req.url.replace("/", ""));
    const clientType = params.get("type"); // "device" | "user"
    const clientId = params.get("id");

    if (!clientType || !clientId) {
      ws.close(1008, "Missing auth params");
      return;
    }

    this.clients.set(clientId, ws);
    logger.info(`Cliente ${clientType}:${clientId} conectado`);

    if (clientType === "device") {
      DeviceRoom.join(clientId, ws);
    } else if (clientType === "user") {
      UserRoom.join(clientId, ws);
    }

    ws.on("message", (msg) => {
        console.log('Mensaje recibido:', msg);
      try {
        const data = JSON.parse(msg);
        this.handleMessage(clientId, clientType, data);
      } catch (err) {
        logger.error("Mensaje inválido recibido:", err);
      }
    });

    ws.on("close", () => {
      logger.info(`Cliente ${clientId} desconectado`);
      this.clients.delete(clientId);
      DeviceRoom.leave(clientId);
      UserRoom.leave(clientId);
    });
  }

  handleMessage(clientId, clientType, data) {
    switch (data.type) {
      case "position":
        positionHandler.handle(clientId, data.payload);
        break;
      case "event":
        eventHandler.handle(clientId, data.payload);
        break;
      default:
        logger.warn(`Tipo de mensaje no reconocido: ${data.type}`);
    }
  }
}

module.exports = SocketManager;
