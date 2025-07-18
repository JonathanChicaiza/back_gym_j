const rutina = (sequelize, DataTypes) => {
    return sequelize.define('rutinas', {
        idRutina: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            unique: true
            
        },
        clienteId: DataTypes.INTEGER,
        profesorId: DataTypes.INTEGER,
        nombre: DataTypes.STRING,
        duracionSemanas: DataTypes.INTEGER,
        estado: DataTypes.STRING,
        stateRutina: DataTypes.STRING,
        createRutina: DataTypes.STRING,
        updateRutina: DataTypes.STRING
    }, {
        timestamps: false,
        comment: 'Tabla de Rutinas'
    });
};

module.exports = rutina;