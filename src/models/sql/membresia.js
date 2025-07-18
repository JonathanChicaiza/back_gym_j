const membresia = (sequelize, DataTypes) => {
    return sequelize.define('membresias', {
        idMembresia: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        nombre: DataTypes.STRING,
        precio: DataTypes.DECIMAL(10, 2),
        duracionDias: DataTypes.INTEGER,
        stateMembresia: DataTypes.STRING,
        createMembresia: DataTypes.STRING,
        updateMembresia: DataTypes.STRING
    }, {
        timestamps: false,
        comment: 'Tabla de Membresías'
    })
};

module.exports = membresia;