const empleado = (sequelize, type) => {
    return sequelize.define('empleados', {
        idEmpleado: {
            type: type.INTEGER,
            primaryKey: true,
        },
        cargo: type.STRING,
        salario: type.STRING, 
        telefono: type.STRING,
        gmail: type.STRING,
        stateEvaluacion: type.STRING,
        createEvaluacion: type.STRING,
        updateEvaluacion: type.STRING
    }, {
        timestamps: false,
        comment: 'Tabla de Empleados'
    });
};

module.exports = empleado;