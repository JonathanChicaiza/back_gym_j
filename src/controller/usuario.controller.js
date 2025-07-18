const usuarioCtl = {};
const orm = require('../Database/dataBase.orm');
const sql = require('../Database/dataBase.sql');
const mongo = require('../Database/dataBaseMongose'); // Asegúrate de que este archivo exporta mongoose.model('Usuario') como 'Usuario'
const { cifrarDatos, descifrarDatos } = require('../lib/encrypDates');
const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs'); // Necesitas instalarlo: npm install bcryptjs

// Función auxiliar para descifrar datos de forma segura
function safeDecrypt(data) {
    try {
        if (data === null || data === undefined) return '';
        return descifrarDatos(data);
    } catch (error) {
        console.error('Error al descifrar datos:', error.message);
        return ''; // Devolver cadena vacía en caso de error
    }
}

// --- Operaciones CRUD para Usuarios ---

// Mostrar todos los usuarios (solo datos SQL, con campos descifrados para la respuesta)
usuarioCtl.mostrarUsuarios = async (req, res) => {
    try {
        const [users] = await sql.promise().query('SELECT idUsuario, nombre, apellido, correo, rolId, estado, createUsuario, updateUsuario FROM usuarios');
        
        // Descifrar los campos sensibles antes de enviarlos en la respuesta
        const decryptedUsers = users.map(user => ({
            ...user,
            nombre: safeDecrypt(user.nombre),
            apellido: safeDecrypt(user.apellido),
            correo: safeDecrypt(user.correo),
            // No descifrar la contraseña aquí
        }));

        res.json(decryptedUsers);
    } catch (error) {
        console.error('Error al obtener usuarios:', error);
        res.status(500).json({ message: 'Error interno del servidor al obtener usuarios.' });
    }
};

// Mostrar un usuario por ID (SQL y MongoDB)
usuarioCtl.mostrarUsuarioPorId = async (req, res) => {
    const { id } = req.params; // id se refiere a idUsuario de SQL

    try {
        const [sqlUserRows] = await sql.promise().query('SELECT * FROM usuarios WHERE idUsuario = ?', [id]);

        if (sqlUserRows.length === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado.' });
        }

        const sqlUser = sqlUserRows[0];

        // Descifrar campos sensibles
        const decryptedUser = {
            ...sqlUser,
            nombre: safeDecrypt(sqlUser.nombre),
            apellido: safeDecrypt(sqlUser.apellido),
            correo: safeDecrypt(sqlUser.correo),
            // La contraseña hasheada no se expone aquí
            contraseña: undefined 
        };

        // Buscar el registro relacionado en MongoDB
        const mongoUser = await mongo.Usuario.findOne({ id_usuario: sqlUser.idUsuario });

        const userData = {
            sqlData: decryptedUser,
            mongoData: mongoUser || null // Puede que no todos los usuarios tengan un registro en Mongo
        };

        res.json(userData);
    } catch (error) {
        console.error('Error al obtener usuario por ID:', error);
        res.status(500).json({ message: 'Error interno del servidor al obtener el usuario.' });
    }
};

// Crear un nuevo usuario (SQL y MongoDB)
usuarioCtl.crearUsuario = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { nombre, apellido, correo, password, rolId, estado, fecha_registro_mongo } = req.body;

    try {
        // 1. Hashear la contraseña
        const hashedPassword = await bcrypt.hash(password, 10); // 10 es el costo de salting, un buen valor.

        // 2. Cifrar datos sensibles antes de guardar en SQL
        const cifredNombre = cifrarDatos(nombre);
        const cifredApellido = cifrarDatos(apellido);
        const cifredCorreo = cifrarDatos(correo);

        const newSqlUser = {
            nombre: cifredNombre,
            apellido: cifredApellido,
            correo: cifredCorreo,
            contraseña: hashedPassword, // Guardar la contraseña hasheada
            rolId: rolId || 2, // Por defecto rol 2 si no se especifica
            estado: estado || 'activo', // Por defecto activo
            createUsuario: new Date().toISOString(), // Formato ISO 8601
            updateUsuario: new Date().toISOString()
        };

        // Guardar en SQL
        const resultSql = await orm.usuario.create(newSqlUser);
        const idUsuarioSql = resultSql.idUsuario || resultSql.insertId; // Asumo que el ORM devuelve el ID insertado

        // Guardar en MongoDB
        const newMongoUser = {
            id_usuario: idUsuarioSql, // Vinculamos con el ID de SQL
            fecha_registro: fecha_registro_mongo ? new Date(fecha_registro_mongo) : new Date(),
        };
        await mongo.Usuario.create(newMongoUser);

        res.status(201).json({
            message: 'Usuario creado con éxito.',
            idUsuario: idUsuarioSql,
            nombre: nombre, // Devuelve el nombre original para confirmación
            correo: correo
        });
    } catch (error) {
        console.error('Error al crear usuario:', error);
        // Manejo específico para errores de unique constraints
        if (error.name === 'SequelizeUniqueConstraintError' || (error.parent && error.parent.code === 'ER_DUP_ENTRY')) {
            return res.status(409).json({ message: 'El correo o el ID de usuario ya existen.' });
        }
        res.status(500).json({ message: 'Error interno del servidor al crear el usuario.' });
    }
};

// Actualizar un usuario existente (SQL y MongoDB)
usuarioCtl.actualizarUsuario = async (req, res) => {
    const { id } = req.params; // id se refiere a idUsuario de SQL
    const { nombre, apellido, correo, password, rolId, estado, fecha_registro_mongo } = req.body;

    try {
        const [sqlUserRows] = await sql.promise().query('SELECT * FROM usuarios WHERE idUsuario = ?', [id]);

        if (sqlUserRows.length === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado.' });
        }

        const existingUser = sqlUserRows[0];
        let updatedSqlFields = {};

        if (nombre !== undefined) updatedSqlFields.nombre = cifrarDatos(nombre);
        if (apellido !== undefined) updatedSqlFields.apellido = cifrarDatos(apellido);
        if (correo !== undefined) updatedSqlFields.correo = cifrarDatos(correo);
        if (rolId !== undefined) updatedSqlFields.rolId = rolId;
        if (estado !== undefined) updatedSqlFields.estado = estado;
        if (password !== undefined) {
            updatedSqlFields.contraseña = await bcrypt.hash(password, 10); // Hashear nueva contraseña
        }
        updatedSqlFields.updateUsuario = new Date().toISOString();

        // Actualizar en SQL
        await orm.usuario.update(updatedSqlFields, {
            where: { idUsuario: id }
        });

        // Actualizar o crear en MongoDB (si fecha_registro_mongo se envía o si no existe el documento)
        if (fecha_registro_mongo !== undefined) {
            await mongo.Usuario.updateOne(
                { id_usuario: id },
                { fecha_registro: new Date(fecha_registro_mongo) },
                { upsert: true } // Crea el documento si no existe, o lo actualiza
            );
        }

        res.json({ message: 'Usuario actualizado con éxito.' });
    } catch (error) {
        console.error('Error al actualizar usuario:', error);
        if (error.name === 'SequelizeUniqueConstraintError' || (error.parent && error.parent.code === 'ER_DUP_ENTRY')) {
            return res.status(409).json({ message: 'El correo ya existe para otro usuario.' });
        }
        res.status(500).json({ message: 'Error interno del servidor al actualizar el usuario.' });
    }
};

// Eliminar un usuario (SQL y MongoDB)
usuarioCtl.eliminarUsuario = async (req, res) => {
    const { id } = req.params; // id se refiere a idUsuario de SQL

    try {
        const [sqlUserRows] = await sql.promise().query('SELECT idUsuario FROM usuarios WHERE idUsuario = ?', [id]);

        if (sqlUserRows.length === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado.' });
        }

        // Eliminar de SQL
        await orm.usuario.destroy({
            where: { idUsuario: id }
        });

        // Eliminar de MongoDB
        await mongo.Usuario.deleteOne({ id_usuario: id });

        res.json({ message: 'Usuario eliminado con éxito.' });
    } catch (error) {
        console.error('Error al eliminar usuario:', error);
        res.status(500).json({ message: 'Error interno del servidor al eliminar el usuario.' });
    }
};

module.exports = usuarioCtl;