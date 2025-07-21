const asistencia = (sequelize, type) => {
    return sequelize.define('asistencias', {
        idAsistencia: {
            type: type.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        estado: type.STRING,
        stateAsistencia: type.STRING,
        createAsistencia: type.STRING,
        updateAsistencia: type.STRING
    }, {
        timestamps: false,
        comment: 'Tabla de Asistencias'
    });
};

module.exports = asistencia;