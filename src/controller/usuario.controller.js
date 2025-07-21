const orm = require('../Database/dataBase.orm');
const sql = require('../Database/dataBase.sql');
const mongo = require('../Database/dataBaseMongose'); // Asegúrate de que este archivo exporta 'Usuario'
const usuarioCtl = {};

// Obtener todos los usuarios
usuarioCtl.obtenerUsuarios = async (req, res) => {
    try {
        // Consultar todos los usuarios desde la base de datos SQL
        const [listaUsuarios] = await sql.promise().query(`
            SELECT * FROM usuarios
        `);

        // Para cada usuario SQL, buscar su contraparte en MongoDB
        const usuariosCompletos = await Promise.all(
            listaUsuarios.map(async (usuario) => {
                // Asumiendo que idUsuario en SQL se mapea a id_usuarioSql en MongoDB
                const usuarioMongo = await mongo.Usuario.findOne({ 
                    id_usuarioSql: usuario.idUsuario.toString() // Convertir a string para coincidir con el tipo en Mongo
                });
                return {
                    ...usuario,
                    detallesMongo: usuarioMongo
                };
            })
        );

        // Establecer mensaje flash de éxito y enviar respuesta API
        res.flash('success', 'Usuarios obtenidos exitosamente');
        return res.apiResponse(usuariosCompletos, 200, 'Usuarios obtenidos exitosamente');
    } catch (error) {
        // Capturar y registrar errores, establecer mensaje flash de error y enviar respuesta API de error
        console.error('Error al obtener usuarios:', error);
        res.flash('error', 'Error al obtener usuarios');
        return res.apiError('Error interno del servidor al obtener usuarios', 500);
    }
};

// Obtener un usuario por ID
usuarioCtl.obtenerUsuario = async (req, res) => {
    try {
        const { id } = req.params;

        // Consultar el usuario por ID desde la base de datos SQL
        const [usuario] = await sql.promise().query(`
            SELECT * FROM usuarios WHERE idUsuario = ?
        `, [id]);

        // Si no se encuentra el usuario en SQL, enviar error 404
        if (usuario.length === 0) {
            res.flash('error', 'Usuario no encontrado');
            return res.apiError('Usuario no encontrado', 404);
        }

        // Buscar el usuario correspondiente en MongoDB
        const usuarioMongo = await mongo.Usuario.findOne({ 
            id_usuarioSql: id.toString() // Asegurarse de que el ID sea string para la búsqueda en Mongo
        });

        // Combinar los datos de SQL y MongoDB
        const usuarioCompleto = {
            ...usuario[0],
            detallesMongo: usuarioMongo
        };

        // Establecer mensaje flash de éxito y enviar respuesta API
        res.flash('success', 'Usuario obtenido exitosamente');
        return res.apiResponse(usuarioCompleto, 200, 'Usuario obtenido exitosamente');
    } catch (error) {
        // Capturar y registrar errores, establecer mensaje flash de error y enviar respuesta API de error
        console.error('Error al obtener usuario:', error);
        res.flash('error', 'Error al obtener usuario');
        return res.apiError('Error interno del servidor al obtener el usuario', 500);
    }
};

// Crear nuevo usuario
usuarioCtl.crearUsuario = async (req, res) => {
    try {
        const { nombre, apellido, correo, contraseña, telefono, fecha_registro_mongo, preferencias_notificacion } = req.body;

        // Validar campos requeridos para la creación del usuario en SQL
        if (!nombre || !apellido || !correo || !contraseña || !telefono) {
            res.flash('error', 'Faltan campos requeridos para crear el usuario SQL (nombre, apellido, correo, contraseña, telefono).');
            return res.apiError('Faltan campos requeridos para crear el usuario SQL.', 400);
        }

        const currentTime = new Date().toLocaleString();

        // Crear el usuario en SQL
        const datosSql = {
            nombre,
            apellido,
            correo,
            contraseña, // En un entorno real, la contraseña debe ser hasheada antes de guardar
            telefono,
            estado: 'activo', // Estado por defecto para el usuario
            createUsuario: currentTime, // Campo de fecha de creación en SQL
            updateUsuario: currentTime // Inicialmente igual a create
        };
        
        const nuevoUsuarioSql = await orm.usuario.create(datosSql);
        const idUsuario = nuevoUsuarioSql.idUsuario; // Obtener el ID generado por SQL

        // Crear el usuario en MongoDB, vinculándolo con el ID de SQL
        const datosMongo = {
            id_usuarioSql: idUsuario.toString(), // Convertir a string para el ID de Mongo
            fecha_registro_mongo: fecha_registro_mongo || currentTime,
            ultima_actividad: currentTime,
            preferencias_notificacion: preferencias_notificacion || 'email' // Preferencia por defecto
        };
        
        await mongo.Usuario.create(datosMongo);

        // Establecer mensaje flash de éxito y enviar respuesta API
        res.flash('success', 'Usuario creado exitosamente');
        return res.apiResponse(
            { idUsuario }, 
            201, 
            'Usuario creado exitosamente'
        );
    } catch (error) {
        // Capturar y registrar errores, establecer mensaje flash de error y enviar respuesta API de error
        console.error('Error al crear usuario:', error);
        res.flash('error', 'Error al crear el usuario');
        return res.apiError('Error interno del servidor al crear el usuario', 500);
    }
};

// Actualizar usuario
usuarioCtl.actualizarUsuario = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, apellido, correo, telefono, estado, fecha_registro_mongo, ultima_actividad, preferencias_notificacion } = req.body;

        // Verificar la existencia del usuario en SQL
        const [usuarioExistenteSql] = await sql.promise().query(`
            SELECT * FROM usuarios WHERE idUsuario = ?
        `, [id]);

        if (usuarioExistenteSql.length === 0) {
            res.flash('error', 'Usuario no encontrado');
            return res.apiError('Usuario no encontrado', 404);
        }

        const currentTime = new Date().toLocaleString();

        // Actualizar en SQL
        const datosActualizacionSql = {
            nombre: nombre !== undefined ? nombre : usuarioExistenteSql[0].nombre,
            apellido: apellido !== undefined ? apellido : usuarioExistenteSql[0].apellido,
            correo: correo !== undefined ? correo : usuarioExistenteSql[0].correo,
            telefono: telefono !== undefined ? telefono : usuarioExistenteSql[0].telefono,
            estado: estado !== undefined ? estado : usuarioExistenteSql[0].estado,
            updateUsuario: currentTime // Campo de fecha de actualización en SQL
        };
        
        await orm.usuario.update(datosActualizacionSql, {
            where: { idUsuario: id }
        });

        // Actualizar en MongoDB
        const datosMongoActualizacion = {
            ultima_actividad: currentTime // Actualizar la fecha de última actividad
        };
        if (fecha_registro_mongo !== undefined) datosMongoActualizacion.fecha_registro_mongo = fecha_registro_mongo;
        if (preferencias_notificacion !== undefined) datosMongoActualizacion.preferencias_notificacion = preferencias_notificacion;

        await mongo.Usuario.findOneAndUpdate(
            { id_usuarioSql: id.toString() }, // Asegurarse de que el ID sea string para la búsqueda en Mongo
            datosMongoActualizacion,
            { new: true } // Para devolver el documento actualizado
        );

        // Establecer mensaje flash de éxito y enviar respuesta API
        res.flash('success', 'Usuario actualizado exitosamente');
        return res.apiResponse(
            { idUsuario: id }, 
            200, 
            'Usuario actualizado exitosamente'
        );
    } catch (error) {
        // Capturar y registrar errores, establecer mensaje flash de error y enviar respuesta API de error
        console.error('Error al actualizar usuario:', error);
        res.flash('error', 'Error al actualizar el usuario');
        return res.apiError('Error interno del servidor al actualizar el usuario', 500);
    }
};

// Eliminar usuario
usuarioCtl.eliminarUsuario = async (req, res) => {
    try {
        const { id } = req.params;

        // Verificar la existencia del usuario en SQL
        const [usuarioExistenteSql] = await sql.promise().query(`
            SELECT * FROM usuarios WHERE idUsuario = ?
        `, [id]);

        if (usuarioExistenteSql.length === 0) {
            res.flash('error', 'Usuario no encontrado');
            return res.apiError('Usuario no encontrado', 404);
        }

        // Eliminar en SQL
        await orm.usuario.destroy({
            where: { idUsuario: id }
        });

        // Eliminar en MongoDB
        await mongo.Usuario.findOneAndDelete({ id_usuarioSql: id.toString() }); // Asegurarse de que el ID sea string para la búsqueda en Mongo

        // Establecer mensaje flash de éxito y enviar respuesta API
        res.flash('success', 'Usuario eliminado exitosamente');
        return res.apiResponse(
            null, 
            200, 
            'Usuario eliminado exitosamente'
        );
    } catch (error) {
        // Capturar y registrar errores, establecer mensaje flash de error y enviar respuesta API de error
        console.error('Error al eliminar usuario:', error);
        res.flash('error', 'Error al eliminar el usuario');
        return res.apiError('Error interno del servidor al eliminar el usuario', 500);
    }
};

// Cambiar contraseña de usuario
usuarioCtl.cambiarPassword = async (req, res) => {
    try {
        const { id } = req.params;
        const { nuevaContraseña } = req.body; // Asumimos que se envía la nueva contraseña

        // Validar que se haya proporcionado una nueva contraseña
        if (!nuevaContraseña) {
            res.flash('error', 'Se requiere la nueva contraseña para actualizar.');
            return res.apiError('Se requiere la nueva contraseña para actualizar.', 400);
        }

        // Verificar la existencia del usuario en SQL
        const [usuarioExistenteSql] = await sql.promise().query(`
            SELECT * FROM usuarios WHERE idUsuario = ?
        `, [id]);

        if (usuarioExistenteSql.length === 0) {
            res.flash('error', 'Usuario no encontrado');
            return res.apiError('Usuario no encontrado', 404);
        }

        const currentTime = new Date().toLocaleString();

        // Actualizar la contraseña en SQL
        // En un entorno real, la nuevaContraseña debe ser hasheada antes de guardar
        const datosActualizacionSql = {
            contraseña: nuevaContraseña, // Aquí se debería usar un hash de la contraseña
            updateUsuario: currentTime
        };

        await orm.usuario.update(datosActualizacionSql, {
            where: { idUsuario: id }
        });
        res.flash('success', 'Contraseña actualizada exitosamente');
        return res.apiResponse(
            { idUsuario: id }, 
            200, 
            'Contraseña actualizada exitosamente'
        );
    } catch (error) {
        console.error('Error al cambiar la contraseña:', error);
        res.flash('error', 'Error al cambiar la contraseña');
        return res.apiError('Error interno del servidor al cambiar la contraseña', 500);
    }
};

module.exports = usuarioCtl;
