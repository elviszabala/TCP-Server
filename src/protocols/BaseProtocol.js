class BaseProtocol {
    constructor(name) {
        this.name = name;
    }

    parse(data) {
        throw new Error('parse method must be implemented');
    }

    createResponse(parsedData) {
        // Opcional: no todos los protocolos requieren respuesta
        return null;
    }

    validateChecksum(data) {
        // Implementación por defecto, puede ser sobrescrita
        return true;
    }

    calculateChecksum(data) {
        // Implementación por defecto, puede ser sobrescrita
        return 0;
    }
}

module.exports = BaseProtocol;