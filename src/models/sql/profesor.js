const profesor = (sequelize, DataTypes) => {
    return sequelize.define('profesores', {
        idProfesor: {
            type: DataTypes.INTEGER,
            // autoIncrement: true, // ¡ESTA LÍNEA DEBE ESTAR ELIMINADA O COMENTADA!
            primaryKey: true,
        },
        especialidad: DataTypes.STRING,
    }, {
        timestamps: false, // Mantén esto si tus tablas SQL no tienen createdAt/updatedAt
        comment: 'Tabla de Profesores'
    });
};

module.exports = profesor;
