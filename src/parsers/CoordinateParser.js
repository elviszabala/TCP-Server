class CoordinateParser {
    // Parsear fecha/hora desde formato GT06 (6 bytes)
    static parseDateTime(buffer) {
        if (buffer.length < 6) {
            throw new Error('DateTime buffer too short');
        }

        const year = 2000 + buffer[0];
        const month = buffer[1] - 1; // JavaScript months are 0-based
        const day = buffer[2];
        const hour = buffer[3];
        const minute = buffer[4];
        const second = buffer[5];

        return new Date(year, month, day, hour, minute, second);
    }

    // Parsear coordenadas desde formato GT06
    static parseCoordinate(value, isLongitude) {
        // Las coordenadas vienen en formato: grados * 1800000
        let coordinate = value / 1800000.0;
        //console.log('Coordenada recibida: ', coordinate);
        //console.log('Coordenada: ', value, ' a ', coordinate);
        // Verificar rangos válidos
        if (isLongitude) {
            //console.log('Coordenada: ', value, ' a ', value - 0x100000000);
            const adjusted = (value - 0x100000000) / 1800000.0;
            // si es válido, actualizamos
            coordinate = adjusted;
            //console.log('Coordenada ajustada: ', coordinate);
            if (coordinate < -180 || coordinate > 180) {
                throw new Error(`Invalid longitude: ${coordinate}`);
            }
        } else {
            if (coordinate < -90 || coordinate > 90) {
                throw new Error(`Invalid latitude: ${coordinate}`);
            }
        }
        //console.log('Coordenada enviada: ', coordinate);
        return coordinate;
    }

    // Convertir coordenadas a formato DMS (Degrees, Minutes, Seconds)
    static toDMS(coordinate, isLongitude) {
        const abs = Math.abs(coordinate);
        const degrees = Math.floor(abs);
        const minutes = Math.floor((abs - degrees) * 60);
        const seconds = ((abs - degrees) * 60 - minutes) * 60;
        
        let direction;
        if (isLongitude) {
            direction = coordinate >= 0 ? 'E' : 'W';
        } else {
            direction = coordinate >= 0 ? 'N' : 'S';
        }
        
        return `${degrees}°${minutes}'${seconds.toFixed(2)}"${direction}`;
    }

    // Validar coordenadas GPS
    static isValidCoordinate(lat, lng) {
        return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
    }

    // Calcular distancia entre dos puntos (Haversine formula)
    static calculateDistance(lat1, lng1, lat2, lng2) {
        const R = 6371000; // Radio de la Tierra en metros
        const φ1 = lat1 * Math.PI / 180;
        const φ2 = lat2 * Math.PI / 180;
        const Δφ = (lat2 - lat1) * Math.PI / 180;
        const Δλ = (lng2 - lng1) * Math.PI / 180;

        const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
                  Math.cos(φ1) * Math.cos(φ2) *
                  Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c; // Distancia en metros
    }

    // Calcular bearing entre dos puntos
    static calculateBearing(lat1, lng1, lat2, lng2) {
        const φ1 = lat1 * Math.PI / 180;
        const φ2 = lat2 * Math.PI / 180;
        const Δλ = (lng2 - lng1) * Math.PI / 180;

        const y = Math.sin(Δλ) * Math.cos(φ2);
        const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);

        const bearing = Math.atan2(y, x) * 180 / Math.PI;
        return (bearing + 360) % 360; // Normalizar a 0-360
    }
}

module.exports = CoordinateParser;