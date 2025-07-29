const visita = (sequelize, type) => {
    return sequelize.define('visitas', {
        idVisita: {
            type: type.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        nombre: type.STRING,
        tipodocumento: type.STRING,
        numerodocumento: type.STRING,
        tipovisita: type.STRING,
        observacion: type.STRING,
        fecha: type.DATE, 
        stateVisita: type.STRING,
        createVisita: type.DATE, 
        updateVisita: type.DATE  
    }, {
        timestamps: false,
        comment: 'Tabla de Visitas'
    });
};

module.exports = visita;