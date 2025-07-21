const pago = (sequelize, type) => {
    return sequelize.define('pagos', {
        idPago: {
            type: type.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        monto: type.STRING,
        fechaPago: type.STRING,
        metodoPago: type.STRING,
        statePago: type.STRING,
        createPago: type.STRING,
        updatePago: type.STRING
    }, {
        timestamps: false,
        comment: 'Tabla de Pagos'
    });
};

module.exports = pago;
