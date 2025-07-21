const producto = (sequelize, type) => {
    return sequelize.define('productos', {
        idProducto: {
            type: type.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        nombre: type.STRING,
        precio: type.STRING,
        categoria: type.STRING,
        stateProducto: type.STRING,
        createProducto: type.STRING,
        updateProducto: type.STRING
    }, {
        timestamps: false,
        comment: 'Tabla de Productos'
    });
};

module.exports = producto;
