const visita = (sequelize, type) => {
    return sequelize.define('visitas', {
        idVisita: {
            type: type.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        stateVisita: type.STRING,
        createVisita: type.STRING,
        updateVisita: type.STRING
    }, {
        timestamps: false,
        comment: 'Tabla de Visitas'
    });
};

module.exports = visita;