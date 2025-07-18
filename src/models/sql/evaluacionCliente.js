const evaluacionCliente = (sequelize, DataTypes) => {
    return sequelize.define('evaluaciones_clientes', {
        idEvaluacion: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        clienteId: DataTypes.INTEGER,
        claseId: DataTypes.INTEGER,
        puntuacion: DataTypes.INTEGER,
        stateEvaluacion: DataTypes.STRING,
        createEvaluacion: DataTypes.STRING,
        updateEvaluacion: DataTypes.STRING
    }, {
        timestamps: false,
        comment: 'Tabla de Evaluaciones de Clientes'
    });
};

module.exports = evaluacionCliente;