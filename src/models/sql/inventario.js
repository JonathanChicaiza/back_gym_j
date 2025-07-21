const inventario = (sequelize, type) => {
    return sequelize.define('inventarios', {
        idInventario: {
            type: type.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        cantidad: type.STRING,
        stateInventario: type.STRING,
        createInventario: type.STRING,
        updateInventario: type.STRING
    }, {
        timestamps: false,
        comment: 'Tabla de Inventario'
    });
};

module.exports = inventario;
