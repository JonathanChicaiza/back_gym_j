const notificacion = (sequelize, type) => {
    return sequelize.define('notificaciones', {
        idNotificacion: {
            type: type.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        mensaje: type.STRING,
        stateNotificacion: type.STRING,
        createNotificacion: type.STRING,
        updateNotificacion: type.STRING
    }, {
        timestamps: false,
        comment: 'Tabla de Notificaciones'
    });
};

module.exports = notificacion;
