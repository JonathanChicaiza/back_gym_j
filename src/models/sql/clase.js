const clase = (sequelize, type) => {
    return sequelize.define('clases', {
        idClase: {
            type: type.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        nombre: type.STRING,
        instructor: type.STRING,
        fecha: type.STRING,
        duracion: type.STRING,
        capacidadMaxima: type.STRING,
        horario: type.STRING,
        descripcion: type.STRING,
        stateClase: type.STRING,
        createClase: type.STRING,
        updateClase: type.STRING
    }, {
        timestamps: false,
        comment: 'Tabla de Clases'
    });
};

module.exports = clase;