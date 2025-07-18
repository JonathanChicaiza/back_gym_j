const producto = (sequelize, DataTypes) => {
    return sequelize.define('productos', {
        idProducto: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            unique: true
        },
        nombre: DataTypes.STRING,
        precio: DataTypes.DECIMAL(10, 2),
        categoria: DataTypes.STRING,
        stateProducto: DataTypes.STRING,
        createProducto: DataTypes.STRING,
        updateProducto: DataTypes.STRING
    }, {
        timestamps: false,
        comment: 'Tabla de Productos'
    });
};

module.exports = producto;