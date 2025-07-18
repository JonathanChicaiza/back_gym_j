const notificacion = (sequelize, DataTypes) => {
    return sequelize.define('notificaciones', {
        idNotificacion: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        usuarioId: DataTypes.INTEGER,
        mensaje: DataTypes.TEXT,
        stateNotificacion: DataTypes.STRING,
        createNotificacion: DataTypes.STRING,
        updateNotificacion: DataTypes.STRING
    }, {
        timestamps: false,
        comment: 'Tabla de Notificaciones'
    });
};

module.exports = notificacion;