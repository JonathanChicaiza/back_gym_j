const reserva = (sequelize, type) => {
    return sequelize.define('reservas', {
        idReserva: {
            type: type.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        estado: type.STRING,
        stateReserva: type.STRING,
        createReserva: type.STRING,
        updateReserva: type.STRING
    }, {
        timestamps: false,
        comment: 'Tabla de Reservas'
    });
};

module.exports = reserva;
