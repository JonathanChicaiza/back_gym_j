const cliente = (sequelize, type) => {
    return sequelize.define('clientes', {
        idCliente: {
            type: type.INTEGER,
            primaryKey: true,
        },
        telefono: type.STRING,
        direccion: type.STRING, 
        stateCliente: type.STRING,
        createCliente: type.STRING,
        updateCliente: type.STRING
    }, {
        timestamps: false, 
        comment: 'Tabla de Clientes'
    });
};

module.exports = cliente;
