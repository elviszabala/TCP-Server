const Geofence = require('../models/Geofence');
const geoUtils = require('../utils/geoUtils');
const EventService = require('./EventService');

class GeofenceService {
    async checkGeofence(deviceId, position, userGeofences) {
        for (const geofence of userGeofences) {
            const inside = geoUtils.isPointInsidePolygon(position, geofence.area);
            
            if (inside) {
                await EventService.createEvent(deviceId, 'geofence:enter', { geofenceId: geofence.id });
            } else {
                await EventService.createEvent(deviceId, 'geofence:exit', { geofenceId: geofence.id });
            }
        }
    }
}

module.exports = new GeofenceService();
