const logger = require("../../utils/logger");

class DeviceRoom {
  static devices = new Map(); // deviceId → ws

  static join(deviceId, ws) {
    this.devices.set(deviceId, ws);
    logger.info(`Dispositivo ${deviceId} unido a DeviceRoom`);
  }

  static leave(deviceId) {
    if (this.devices.has(deviceId)) {
      this.devices.delete(deviceId);
      logger.info(`Dispositivo ${deviceId} salió de DeviceRoom`);
    }
  }

  static broadcastPosition(deviceId, position) {
    // Podrías también notificar a usuarios suscritos
    logger.debug(`Broadcast de posición de ${deviceId}:`, position);
  }
}

module.exports = DeviceRoom;
