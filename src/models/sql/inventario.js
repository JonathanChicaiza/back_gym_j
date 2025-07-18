const inventario = (sequelize, DataTypes) => {
    return sequelize.define('inventarios', {
        idInventario: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            unique: true
        },
        productoId: DataTypes.INTEGER,
        cantidad: DataTypes.INTEGER,
        stateInventario: DataTypes.STRING,
        createInventario: DataTypes.STRING,
        updateInventario: DataTypes.STRING
    }, {
        timestamps: false,
        comment: 'Tabla de Inventario'
    });
};

module.exports = inventario;