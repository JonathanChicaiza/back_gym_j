const rutina = (sequelize, type) => {
    return sequelize.define('rutinas', {
        idRutina: {
            type: type.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            
        },
        nombre: type.STRING,
        duracionSemanas: type.INTEGER,
        estado: type.STRING,
        stateRutina: type.STRING,
        createRutina: type.STRING,
        updateRutina: type.STRING
    }, {
        timestamps: false,
        comment: 'Tabla de Rutinas'
    });
};

module.exports = rutina;