const ventaProducto = (sequelize, DataTypes) => {
    return sequelize.define('ventas_productos', {
        idVenta: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        clienteId: DataTypes.INTEGER,
        productoId: DataTypes.INTEGER,
        cantidad: DataTypes.INTEGER,
        total: DataTypes.DECIMAL(10, 2),
        stateVenta: DataTypes.STRING,
        createVenta: DataTypes.STRING,
        updateVenta: DataTypes.STRING
    }, {
        timestamps: false,
        comment: 'Tabla de Ventas de Productos'
    });
};

module.exports = ventaProducto;