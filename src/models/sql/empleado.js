const empleado = (sequelize, DataTypes) => {
    return sequelize.define('empleados', {
        idEmpleado: {
            type: DataTypes.INTEGER,
            // autoIncrement: true, // ¡ESTA LÍNEA DEBE ESTAR ELIMINADA O COMENTADA!
            primaryKey: true,
        },
        cargo: DataTypes.STRING,
        salario: DataTypes.DECIMAL(10, 2), 
    }, {
        timestamps: false, // Mantén esto si tus tablas SQL no tienen createdAt/updatedAt
        comment: 'Tabla de Empleados'
    });
};

module.exports = empleado;
