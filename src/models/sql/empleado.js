const empleado = (sequelize, DataTypes) => {
    return sequelize.define('empleados', {
        idEmpleado: {
            type: DataTypes.INTEGER,
            // autoIncrement: true, // ¡ESTA LÍNEA DEBE ESTAR ELIMINADA O COMENTADA!
            primaryKey: true,
        },
        cargo: DataTypes.STRING,
        salario: DataTypes.DECIMAL(10, 2), // Coincide con NUMERIC(10,2) en SQL
        // Si tienes campos como stateEmpleado, createEmpleado, updateEmpleado en tu modelo Sequelize
        // y NO están en tu script SQL de CREATE TABLE, coméntalos o elimínalos aquí también.
        // stateEmpleado: DataTypes.STRING,
        // createEmpleado: DataTypes.STRING,
        // updateEmpleado: DataTypes.STRING
    }, {
        timestamps: false, // Mantén esto si tus tablas SQL no tienen createdAt/updatedAt
        comment: 'Tabla de Empleados'
    });
};

module.exports = empleado;
