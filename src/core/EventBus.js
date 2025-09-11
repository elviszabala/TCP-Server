const EventEmitter = require('events');
const logger = require('../utils/logger');

class EventBus extends EventEmitter {
    emitEvent(event, payload) {
        logger.info(`Event emitted: ${event}`, payload);
         console.log('Listener registered for event:', event);
        //this.emit(event, payload);
    }

    onEvent(event, listener) {
        //this.on(event, listener);
        console.log('Listener registered for event:', event);
    }

    offEvent(event, listener) {
        //this.off(event, listener);
         console.log('Listener registered for event:', event);
    }
}

module.exports = new EventBus(); // singleton global