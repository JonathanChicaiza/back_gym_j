const membresia = (sequelize, type) => {
    return sequelize.define('membresias', {
        idMembresia: {
            type: type.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        nombre: type.STRING,
        precio: type.STRING,
        duracionDias: type.STRING,
        stateMembresia: type.STRING,
        createMembresia:type.STRING,
        updateMembresia: type.STRING
    }, {
        timestamps: false,
        comment: 'Tabla de Membresías'
    })
};

module.exports = membresia;
