const usuario = (sequelize,type) => {
    return sequelize.define('usuarios', {
        idUsuario: {
            type: type.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        nombre: type.STRING,
        apellido: type.STRING,
        correo: type.STRING,
        contraseña: type.STRING,
        telefono: type.STRING,
        estado: type.STRING,
        createUsuario: type.STRING,
        updateUsuario: type.STRING
    }, {
        timestamps: false,
        comment: 'Tabla de Usuarios'
    });
};

module.exports = usuario;