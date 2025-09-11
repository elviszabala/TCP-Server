const UserRoom = require("../rooms/UserRoom");
const EventService = require("../../services/EventService");
const logger = require("../../utils/logger");

module.exports = {
  async handle(clientId, eventData) {
    try {
      // Guardar evento en la base de datos
      await EventService.saveEvent(clientId, eventData);

      // Notificar en tiempo real a usuarios
      UserRoom.broadcastEvent(eventData);

      logger.info(`Evento procesado para cliente ${clientId}`);
    } catch (err) {
      logger.error("Error procesando evento:", err);
    }
  },
};
