// models/visita.model.js
module.exports = (sequelize, type) => {
    const Visita = sequelize.define('Visita', {
        idVisita: {
            type: type.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        nombre: {
            type: type.STRING,
            allowNull: false
        },
        tipodocumento: {
            type: type.STRING,
            allowNull: false,
            defaultValue: 'DNI'
        },
        numerodocumento: {
            type: type.STRING,
            allowNull: false
        },
        tipovisita: {
            type: type.STRING,
            allowNull: false,
            defaultValue: 'Diaria'
        },
        observacion: {
            type: type.STRING,
            defaultValue: ''
        },
        fecha: {
            type: type.DATEONLY, // Changed from DATE to DATEONLY for only date
            allowNull: false
        },
        stateVisita: {
            type: type.STRING,
            defaultValue: 'activa'
        },
        createVisita: {
            type: type.DATE,
            defaultValue: type.NOW
        },
        updateVisita: {
            type: type.DATE,
            defaultValue: type.NOW
        }
    }, {
        timestamps: false, // Set to true if you want Sequelize to manage createdAt/updatedAt
        tableName: 'visitas', // Ensure this matches your actual table name
        hooks: {
            beforeUpdate: (visita) => {
                visita.updateVisita = new Date();
            }
        }
    });
    return Visita;
};