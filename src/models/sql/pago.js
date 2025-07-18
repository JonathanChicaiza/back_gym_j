const pago = (sequelize, DataTypes) => {
    return sequelize.define('pagos', {
        idPago: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        monto: DataTypes.DECIMAL(10, 2),
        fechaPago: DataTypes.STRING,
        metodoPago: DataTypes.STRING,
        clienteId: DataTypes.INTEGER,
        statePago: DataTypes.STRING,
        createPago: DataTypes.STRING,
        updatePago: DataTypes.STRING
    }, {
        timestamps: false,
        comment: 'Tabla de Pagos'
    });
};

module.exports = pago;