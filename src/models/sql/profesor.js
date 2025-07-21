const profesor = (sequelize, type) => {
    return sequelize.define('profesores', {
        idProfesor: {
            type: type.INTEGER,
            primaryKey: true,
        },
        especialidad: type.STRING,
        nombre: type.STRING,
        apellido: type.STRING,
        gmail: type.STRING,
        telefono: type.STRING,
        stateProfesor: type.STRING,
        createProfesor:type.STRING,
        updateProfesor: type.STRING
    }, {
        timestamps: false,
        comment: 'Tabla de Profesores'
    });
};

module.exports = profesor;
