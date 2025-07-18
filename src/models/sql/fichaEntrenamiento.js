const fichaEntrenamiento = (sequelize, DataTypes) => {
    return sequelize.define('fichas_entrenamiento', {
        idFicha: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            unique: true
        },
        clienteId: DataTypes.INTEGER,
        profesorId: DataTypes.INTEGER,
        stateFicha: DataTypes.STRING,
        createFicha: DataTypes.STRING,
        updateFicha: DataTypes.STRING
    }, {
        timestamps: false,
        comment: 'Tabla de Fichas de Entrenamiento'
    });
};

module.exports = fichaEntrenamiento;