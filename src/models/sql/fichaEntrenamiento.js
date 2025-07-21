const fichaEntrenamiento = (sequelize, type) => {
    return sequelize.define('fichas_entrenamiento', {
        idFicha: {
            type: type.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        stateFicha: type.STRING,
        createFicha: type.STRING,
        updateFicha: type.STRING
    }, {
        timestamps: false,
        comment: 'Tabla de Fichas de Entrenamiento'
    });
};

module.exports = fichaEntrenamiento;
