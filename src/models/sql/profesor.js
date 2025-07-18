const profesor = (sequelize, DataTypes) => {
    return sequelize.define('profesores', {
        idProfesor: {
            type: DataTypes.INTEGER,
            // autoIncrement: true, // ¡ESTA LÍNEA DEBE ESTAR ELIMINADA O COMENTADA!
            primaryKey: true,
        },
        especialidad: DataTypes.STRING,
        // Si tienes campos como stateProfesor, createProfesor, updateProfesor en tu modelo Sequelize
        // y NO están en tu script SQL de CREATE TABLE, coméntalos o elimínalos aquí también.
        // stateProfesor: DataTypes.STRING,
        // createProfesor: DataTypes.STRING,
        // updateProfesor: DataTypes.STRING
    }, {
        timestamps: false, // Mantén esto si tus tablas SQL no tienen createdAt/updatedAt
        comment: 'Tabla de Profesores'
    });
};

module.exports = profesor;
