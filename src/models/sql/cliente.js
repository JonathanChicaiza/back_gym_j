const cliente = (sequelize, DataTypes) => {
    return sequelize.define('clientes', {
        idCliente: {
            type: DataTypes.INTEGER,
            // autoIncrement: true, // ¡ESTA LÍNEA DEBE ESTAR ELIMINADA O COMENTADA!
            primaryKey: true,
            unique: true
        },
        telefono: DataTypes.STRING,
        direccion: DataTypes.TEXT, // Coincide con TEXT en SQL
        fechaNacimiento: DataTypes.DATE, // Coincide con DATE en SQL
        membresiaId: DataTypes.INTEGER,
        // Si tienes campos como stateCliente, createCliente, updateCliente en tu modelo Sequelize
        // y NO están en tu script SQL de CREATE TABLE, coméntalos o elimínalos aquí también.
        // stateCliente: DataTypes.STRING,
        // createCliente: DataTypes.STRING,
        // updateCliente: DataTypes.STRING
    }, {
        timestamps: false, // Mantén esto si tus tablas SQL no tienen createdAt/updatedAt
        comment: 'Tabla de Clientes'
    });
};

module.exports = cliente;
