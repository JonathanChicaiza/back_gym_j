const actividad = (sequelize, type) => {
    return sequelize.define('actividades', {
        idLog: {
            type: type.INTEGER,
            primaryKey: true,
        },
        accion: type.STRING,
        tablaAfectada: type.STRING,
        ciudad: type.STRING,
        pais: type.STRING,
        stateLog: type.STRING,
        createLog: type.STRING,
        updateLog: type.STRING
    }, {
        timestamps: false,
        comment: 'Tabla de Actividades'
    });
};

module.exports = actividad;
