/**
 * Device.js - Modelo Sequelize de Dispositivo para sistema GPS
 * Define la estructura de dispositivos GPS en la base de datos
 */

//import { DataTypes } from 'sequelize';

const { DataTypes } = require('sequelize');




//export default function DeviceModel(sequelize) {
 module.exports = (sequelize) => {

    const Device = sequelize.define('Device', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
            allowNull: false
        },
        
        // Información básica del dispositivo
        name: {
            type: DataTypes.STRING(100),
            allowNull: false,
            validate: {
                len: [1, 100]
            }
        },
        
        imei: {
            type: DataTypes.STRING(15),
            allowNull: false,
            unique: true,
            validate: {
                len: [15, 15],
                isNumeric: true
            }
        },
        
        phoneNumber: {
            type: DataTypes.STRING(20),
            allowNull: true,
            validate: {
                is: /^[\+]?[1-9][\d]{0,15}$/
            }
        },
        
        // Tipo y modelo
        type: {
            type: DataTypes.ENUM(
                'vehicle_tracker', 
                'personal_tracker', 
                'asset_tracker', 
                'smartphone', 
                'obd_device',
                'dash_cam'
            ),
            allowNull: false,
            defaultValue: 'vehicle_tracker'
        },
        
        model: {
            type: DataTypes.STRING(100),
            allowNull: true
        },
        
        manufacturer: {
            type: DataTypes.STRING(100),
            allowNull: true
        },
        
        firmwareVersion: {
            type: DataTypes.STRING(50),
            allowNull: true
        },
        
        // Estado del dispositivo
        status: {
            type: DataTypes.ENUM('active', 'inactive', 'maintenance', 'offline', 'expired'),
            defaultValue: 'active',
            allowNull: false
        },
        
        isOnline: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            allowNull: false
        },
        
        // Fechas importantes 
        lastCommunication: {
            type: DataTypes.DATE,
            allowNull: true
        },
        
        activatedAt: {
            type: DataTypes.DATE,
            allowNull: true
        },
        
        expiresAt: {
            type: DataTypes.DATE,
            allowNull: true
        },
        
        // Configuración del dispositivo
        configuration: {
            type: DataTypes.JSON,
            allowNull: false,
            defaultValue: {
                // Configuración de reportes
                reporting: {
                    interval: 60, // segundos
                    distanceThreshold: 100, // metros
                    angleThreshold: 45, // grados
                    speedThreshold: 5 // km/h
                },
                
                // Configuración de alertas
                alerts: {
                    speedLimit: 120, // km/h
                    idleTimeout: 300, // segundos
                    panicButton: true,
                    lowBattery: 20, // porcentaje
                    geofence: true
                },
                
                // Configuración de energía
                power: {
                    sleepMode: false,
                    deepSleep: false,
                    batteryMonitoring: true,
                    externalPowerAlert: true
                },
                
                // Configuración de conectividad
                connectivity: {
                    gprs: true,
                    wifi: false,
                    bluetooth: false,
                    roaming: false
                }
            }
        },
        
        // Información del vehículo/activo asociado
        vehicleInfo: {
            type: DataTypes.JSON,
            allowNull: true,
            defaultValue: null
            // Estructura:
            // {
            //   plate: "ABC-1234",
            //   brand: "Toyota",
            //   model: "Corolla",
            //   year: 2020,
            //   color: "Blanco",
            //   vin: "1234567890",
            //   type: "sedan",
            //   fuelType: "gasoline"
            // }
        },
        
        // Información técnica
        batteryLevel: {
            type: DataTypes.INTEGER,
            allowNull: true,
            validate: {
                min: 0,
                max: 100
            }
        },
        
        signalStrength: {
            type: DataTypes.INTEGER,
            allowNull: true,
            validate: {
                min: 0,
                max: 100
            }
        },
        
        // Odómetro
        odometer: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true,
            defaultValue: 0.00
        },
        
        // Coordenadas de la última posición conocida
        lastLatitude: {
            type: DataTypes.DECIMAL(10, 8),
            allowNull: true,
            validate: {
                min: -90,
                max: 90
            }
        },
        
        lastLongitude: {
            type: DataTypes.DECIMAL(11, 8),
            allowNull: true,
            validate: {
                min: -180,
                max: 180
            }
        },
        
        lastSpeed: {
            type: DataTypes.DECIMAL(5, 2),
            allowNull: true,
            defaultValue: 0.00
        },
        
        lastCourse: {
            type: DataTypes.INTEGER,
            allowNull: true,
            validate: {
                min: 0,
                max: 359
            }
        },
        
        lastAddress: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        
        // Propietario del dispositivo
        userId: {
            type: DataTypes.UUID,
            allowNull: true,
            /* references: {
                model: 'users',
                key: 'id'
            } */

        },
        
        // Grupos/categorías
        groupId: {
            type: DataTypes.UUID,
            allowNull: true
        },
        
        tags: {
            type: DataTypes.JSON,
            allowNull: false,
            defaultValue: []
        },
        
        // Notas y descripción
        description: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        
        // Configuración de notificaciones
        notificationSettings: {
            type: DataTypes.JSON,
            allowNull: false,
            defaultValue: {
                email: true,
                sms: false,
                push: true,
                webhook: false
            }
        }
    }, {
        tableName: 'devices',
        timestamps: true,
        paranoid: true, // Soft delete
        
        indexes: [
            {
                unique: true,
                fields: ['imei']
            },
            /* {
                fields: ['userId']
            }, */
            {
                fields: ['status']
            },
            {
                fields: ['type']
            },
            {
                fields: ['is_online']
            },
            {
                fields: ['last_communication']
            },
            {
                fields: ['last_latitude', 'last_longitude']
            }
        ],
        
        hooks: {
            beforeUpdate: (device) => {
                // Si cambia la posición, actualizar timestamp de comunicación
                if (device.changed('lastLatitude') || device.changed('lastLongitude')) {
                    device.lastCommunication = new Date();
                }
            }
        },
        
        scopes: {
            // Dispositivos activos
            active: {
                where: {
                    status: 'active'
                }
            },
            
            // Dispositivos online
            online: {
                where: {
                    isOnline: true
                }
            },
            
            // Dispositivos con batería baja
            lowBattery: {
                where: {
                    batteryLevel: {
                        [sequelize.Sequelize.Op.lt]: 20
                    }
                }
            },
            
            // Dispositivos por tipo
            vehicles: {
                where: {
                    type: 'vehicle_tracker'
                }
            },
            
            // Dispositivos con comunicación reciente
            recentCommunication: {
                where: {
                    lastCommunication: {
                        [sequelize.Sequelize.Op.gte]: new Date(Date.now() - 24 * 60 * 60 * 1000) // Últimas 24 horas
                    }
                }
            }
        }
    });
    
    // Métodos de instancia
    Device.prototype.updatePosition = async function(positionData) {
        this.lastLatitude = positionData.latitude;
        this.lastLongitude = positionData.longitude;
        this.lastSpeed = positionData.speed || 0;
        this.lastCourse = positionData.course || null;
        this.lastAddress = positionData.address || null;
        this.lastCommunication = new Date();
        this.isOnline = true;
        
        if (positionData.batteryLevel !== undefined) {
            this.batteryLevel = positionData.batteryLevel;
        }
        
        if (positionData.signalStrength !== undefined) {
            this.signalStrength = positionData.signalStrength;
        }
        
        await this.save();
    };
    
    Device.prototype.updateConfiguration = async function(newConfig) {
        this.configuration = {
            ...this.configuration,
            ...newConfig
        };
        
        await this.save();
        return this.configuration;
    };
    
    Device.prototype.isExpired = function() {
        return this.expiresAt && new Date() > this.expiresAt;
    };
    
    Device.prototype.getDaysSinceLastCommunication = function() {
        if (!this.lastCommunication) return Infinity;
        
        const now = new Date();
        const diffTime = Math.abs(now - this.lastCommunication);
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };
    
    Device.prototype.setOffline = async function() {
        this.isOnline = false;
        this.status = this.status === 'active' ? 'offline' : this.status;
        await this.save();
    };
    
    Device.prototype.activate = async function() {
        this.status = 'active';
        this.activatedAt = new Date();
        await this.save();
    };
    
    Device.prototype.deactivate = async function() {
        this.status = 'inactive';
        this.isOnline = false;
        await this.save();
    };
    
    Device.prototype.getLastKnownLocation = function() {
        if (!this.lastLatitude || !this.lastLongitude) return null;
        
        return {
            latitude: parseFloat(this.lastLatitude),
            longitude: parseFloat(this.lastLongitude),
            speed: parseFloat(this.lastSpeed || 0),
            course: this.lastCourse,
            address: this.lastAddress,
            timestamp: this.lastCommunication
        };
    };
    
    Device.prototype.hasLowBattery = function() {
        return this.batteryLevel !== null && this.batteryLevel < 20;
    };
    
    Device.prototype.needsMaintenance = function() {
        return this.status === 'maintenance' || 
               this.getDaysSinceLastCommunication() > 7 ||
               this.hasLowBattery();
    };
    
    // Métodos estáticos
    Device.findByImei = async function(imei) {
        return this.findOne({
            where: { imei }
        });
    };
    
    Device.findOnlineDevices = async function() {
        return this.scope('online').findAll({
            include: ['user']
        });
    };
    
    Device.findExpiredDevices = async function() {
        return this.findAll({
            where: {
                expiresAt: {
                    [sequelize.Sequelize.Op.lt]: new Date()
                },
                status: {
                    [sequelize.Sequelize.Op.ne]: 'expired'
                }
            }
        });
    };
    
    Device.getDeviceStatistics = async function() {
        const total = await this.count();
        const active = await this.count({ where: { status: 'active' } });
        const online = await this.count({ where: { isOnline: true } });
        const lowBattery = await this.scope('lowBattery').count();
        
        return {
            total,
            active,
            online,
            offline: active - online,
            lowBattery,
            activePercentage: total > 0 ? ((active / total) * 100).toFixed(2) : 0
        };
    };
    
    // Asociaciones
    /* Device.associate = function(models) {
        // Pertenece a un usuario
        Device.belongsTo(models.User, {
            foreignKey: 'userId',
            as: 'user',
            onDelete: 'SET NULL'
        });
        
        // Tiene múltiples posiciones
        Device.hasMany(models.Position, {
            foreignKey: 'deviceId',
            as: 'positions',
            onDelete: 'CASCADE'
        });
        
        // Tiene múltiples eventos
        Device.hasMany(models.Event, {
            foreignKey: 'deviceId',
            as: 'events',
            onDelete: 'CASCADE'
        });
        
        // Relación con geofences (muchos a muchos)
        Device.belongsToMany(models.Geofence, {
            through: 'DeviceGeofences',
            as: 'geofences',
            foreignKey: 'deviceId',
            otherKey: 'geofenceId'
        });
    }; */
    
    return Device;
}