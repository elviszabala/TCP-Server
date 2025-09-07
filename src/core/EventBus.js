const EventEmitter = require('events');
const logger = require('../utils/logger');

class EventBus extends EventEmitter {
    emitEvent(event, payload) {
        logger.info(`Event emitted: ${event}`, payload);
        //this.emit(event, payload);
    }

    onEvent(event, listener) {
        //this.on(event, listener);
    }

    offEvent(event, listener) {
        //this.off(event, listener);
    }
}

module.exports = new EventBus(); // singleton global