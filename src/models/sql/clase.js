const clase = (sequelize, DataTypes) => {
    return sequelize.define('clases', {
        idClase: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        nombre: DataTypes.STRING,
        capacidadMaxima: DataTypes.INTEGER,
        horario: DataTypes.STRING,
        profesorId: DataTypes.INTEGER,
        stateClase: DataTypes.STRING,
        createClase: DataTypes.STRING,
        updateClase: DataTypes.STRING
    }, {
        timestamps: false,
        comment: 'Tabla de Clases'
    });
};

module.exports = clase;