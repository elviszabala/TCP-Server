const PositionRepository = require('../database/repositories/PositionRepository');

class ReportService {
    async generateTripReport(deviceId, from, to) {
        const positions = await PositionRepository.findBetween(deviceId, from, to);

        // Procesar distancia, velocidad promedio, duración, etc.
        const totalDistance = this.calculateDistance(positions);
        
        return {
            deviceId,
            from,
            to,
            totalDistance,
            positions
        };
    }

    calculateDistance(positions) {
        let distance = 0;
        for (let i = 1; i < positions.length; i++) {
            distance += this.haversine(positions[i - 1], positions[i]);
        }
        return distance;
    }

    haversine(p1, p2) {
        // Fórmula Haversine (puedes usar geoUtils)
        const R = 6371; // km
        const dLat = (p2.lat - p1.lat) * Math.PI / 180;
        const dLon = (p2.lon - p1.lon) * Math.PI / 180;
        const a = 
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(p1.lat * Math.PI/180) * Math.cos(p2.lat * Math.PI/180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    }
}

module.exports = new ReportService();
