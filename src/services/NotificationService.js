const EventBus = require('../core/EventBus');
const logger = require('../utils/logger');

class NotificationService {
    constructor() {
        EventBus.on('event:new', (event) => {
            this.sendNotification(event);
        });
    }

    async sendNotification(event) {
        // Ejemplo: integración con Firebase, correo, SMS, etc.
        logger.info(`[NOTIFICATION] ${event.type} for device ${event.deviceId}`);
    }
}

module.exports = new NotificationService();
