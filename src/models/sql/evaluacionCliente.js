const evaluacionCliente = (sequelize, type) => {
    return sequelize.define('evaluaciones_clientes', {
        idEvaluacion: {
            type: type.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        puntuacion: type.STRING,
        stateEvaluacion: type.STRING,
        createEvaluacion: type.STRING,
        updateEvaluacion: type.STRING
    }, {
        timestamps: false,
        comment: 'Tabla de Evaluaciones de Clientes'
    });
};

module.exports = evaluacionCliente;
