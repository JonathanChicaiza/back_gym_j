const historialpago = (sequelize, type) => {
    return sequelize.define('historial_pagos', {
        idHistorial: {
            type: type.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        fechaRegistro: type.STRING,
        stateHistorial: type.STRING,
        createHistorial: type.STRING,
        updateHistorial: type.STRING
    }, {
        timestamps: false,
        comment: 'Tabla de Historial de Pagos'
    });
};

module.exports = historialpago;
