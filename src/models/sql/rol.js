const rol = (sequelize, type) =>{
    return sequelize.define('roles', {
        idRol: {
            type: type.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            unique: true
        },
        nameRol: type.STRING,
        stateRol: type.STRING,
        createRol: type.STRING,
        updateRol: type.STRING,
    }, {
        timestamps: false,
        comment: 'Tabla de Roles'
    })
}

module.exports = rol;