const ventaProducto = (sequelize, type) => {
    return sequelize.define('ventas_productos', {
        idVenta: {
            type: type.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        cantidad: type.STRING,
        total: type.STRING,
        stateVenta: type.STRING,
        createVenta: type.STRING,
        updateVenta:type.STRING
    }, {
        timestamps: false,
        comment: 'Tabla de Ventas de Productos'
    });
};

module.exports = ventaProducto;
