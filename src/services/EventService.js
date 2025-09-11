const EventRepository = require('../database/repositories/EventRepository');
const EventBus = require('../core/EventBus');

class EventService {
    async createEvent(deviceId, type, data) {
        const event = await EventRepository.create({ deviceId, type, data });

        // Notificar en tiempo real
        EventBus.emit('event:new', event);

        return event;
    }

    async getEventsByDevice(deviceId, from, to) {
        return EventRepository.findByDevice(deviceId, from, to);
    }
}

module.exports = new EventService();
