const actividad = (sequelize, DataTypes) => {
    return sequelize.define('actividades', {
        idLog: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            unique: true
        },
        usuarioId: DataTypes.INTEGER,
        accion: DataTypes.STRING,
        tablaAfectada: DataTypes.STRING,
        stateLog: DataTypes.STRING,
        createLog: DataTypes.STRING,
        updateLog: DataTypes.STRING
    }, {
        timestamps: false,
        comment: 'Tabla de Actividades'
    });
};

module.exports = actividad;