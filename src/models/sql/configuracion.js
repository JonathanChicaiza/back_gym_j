const configuracion = (sequelize, type) => {
    return sequelize.define('configuraciones', {
        idConfiguracion: {
            type: type.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        nombreConfiguracion: type.STRING,
        tipo: type.STRING,
        descripcion: type.TEXT,
        estado: type.STRING,
        createConfiguracion: type.STRING,
        updateConfiguracion: type.STRING
    }, {
        timestamps: false,
        comment: 'Tabla de Configuraciones'
    });
};

module.exports = configuracion;