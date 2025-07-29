const asistencia = (sequelize, type) => {
    return sequelize.define('asistencias', {
        idAsistencia: {
            type: type.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        tiporeporte: type.STRING,
        desde: type.DATE,
        hasta: type.DATE, 
        formato: type.STRING, 
        estado: type.STRING,
        stateAsistencia: type.STRING,
        createAsistencia: type.DATE, 
        updateAsistencia: type.DATE 
    }, {
        timestamps: false,
        comment: 'Tabla de Asistencias'
    });
};

module.exports = asistencia;