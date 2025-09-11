const DeviceRoom = require("../rooms/DeviceRoom");
const UserRoom = require("../rooms/UserRoom");
const PositionService = require("../../services/PositionService");
const logger = require("../../utils/logger");

module.exports = {
  async handle(deviceId, positionData) {
    try {
      // Guardar posición en la base de datos
      await PositionService.savePosition(deviceId, positionData);

      // Broadcast a usuarios suscritos
      DeviceRoom.broadcastPosition(deviceId, positionData);

      logger.info(`Posición procesada para dispositivo ${deviceId}`);
    } catch (err) {
      logger.error("Error procesando posición:", err);
    }
  },
};
