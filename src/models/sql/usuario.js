const usuario = (sequelize, DataTypes) => {
    return sequelize.define('usuarios', {
        idUsuario: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            unique: true
        },
        nombre: DataTypes.STRING,
        apellido: DataTypes.STRING,
        correo: {
            type: DataTypes.STRING,
            unique: true
        },
        contraseña: DataTypes.STRING,
        rolId: DataTypes.INTEGER,
        estado: DataTypes.STRING,
        createUsuario: DataTypes.STRING,
        updateUsuario: DataTypes.STRING
    }, {
        timestamps: false,
        comment: 'Tabla de Usuarios'
    });
};

module.exports = usuario;