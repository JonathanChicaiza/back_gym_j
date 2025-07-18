const historialpago = (sequelize, DataTypes) => {
    return sequelize.define('historial_pagos', {
        idHistorial: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        pagoId: DataTypes.INTEGER,
        fechaRegistro: DataTypes.STRING,
        stateHistorial: DataTypes.STRING,
        createHistorial: DataTypes.STRING,
        updateHistorial: DataTypes.STRING
    }, {
        timestamps: false,
        comment: 'Tabla de Historial de Pagos'
    });
};

module.exports = historialpago;