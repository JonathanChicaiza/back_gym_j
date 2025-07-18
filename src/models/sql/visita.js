const visita = (sequelize, DataTypes) => {
    return sequelize.define('visitas', {
        idVisita: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            unique: true
        },
        clienteId: DataTypes.INTEGER,
        stateVisita: DataTypes.STRING,
        createVisita: DataTypes.STRING,
        updateVisita: DataTypes.STRING
    }, {
        timestamps: false,
        comment: 'Tabla de Visitas'
    });
};

module.exports = visita;