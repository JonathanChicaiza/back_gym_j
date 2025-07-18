const reserva = (sequelize, DataTypes) => {
    return sequelize.define('reservas', {
        idReserva: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        estado: DataTypes.STRING,
        clienteId: DataTypes.INTEGER,
        claseId: DataTypes.INTEGER,
        stateReserva: DataTypes.STRING,
        createReserva: DataTypes.STRING,
        updateReserva: DataTypes.STRING
    }, {
        timestamps: false,
        comment: 'Tabla de Reservas'
    });
};

module.exports = reserva;