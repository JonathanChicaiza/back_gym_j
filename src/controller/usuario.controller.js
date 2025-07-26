// src/controller/usuario.controller.js

const bcrypt = require('bcryptjs');
// Importar passport y generateToken desde tu archivo passport.js
const { passport, generateToken } = require('../lib/passport'); 
const sql = require('../Database/dataBase.sql'); 
const orm = require('../Database/dataBase.orm'); 
// ELIMINADO: const mongo = require('../Database/dataBaseMongose'); // No se usa MongoDB

// Asegúrate de que las dependencias para guardarYSubirArchivo estén disponibles
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');

// Objeto controlador para agrupar las funciones
const usuarioCtl = {};

// Función para guardar y subir archivos (se mantiene aquí si es usada por la estrategia Passport)
const guardarYSubirArchivo = async (archivo, filePath, columnName, idUser, url, req) => {
    const validaciones = {
        imagen: [".PNG", ".JPG", ".JPEG", ".GIF", ".TIF", ".png", ".jpg", ".jpeg", ".gif", ".tif", ".ico", ".ICO", ".webp", ".WEBP"],
        pdf: [".pdf", ".PDF"]
    };
    const tipoArchivo = (columnName.includes('photo')) ? 'imagen' : 'pdf';
    const validacion = path.extname(archivo.name);

    if (!validaciones[tipoArchivo].includes(validacion)) {
        throw new Error('Archivo no compatible.');
    }

    return new Promise((resolve, reject) => {
        archivo.mv(filePath, async (err) => {
            if (err) {
                return reject(new Error('Error al guardar el archivo.'));
            } else {
                try {
                    // Actualizar el campo del archivo en la tabla usuarios
                    await sql.promise().query(`UPDATE usuarios SET ${columnName} = ? WHERE idUsuario = ?`, [archivo.name, idUser]);

                    const formData = new FormData();
                    formData.append('image', fs.createReadStream(filePath), {
                        filename: archivo.name,
                        contentType: archivo.mimetype,
                    });

                    // Mantener el token CSRF en la petición
                    const response = await axios.post(url, formData, {
                        headers: {
                            ...formData.getHeaders(),
                            'X-CSRF-Token': req.csrfToken(),
                            'Cookie': req.headers.cookie
                        },
                    });

                    if (response.status !== 200) {
                        throw new Error('Error al subir archivo al servidor externo.');
                    }

                    resolve();
                } catch (uploadError) {
                    console.error('Error al subir archivo al servidor externo:', uploadError.message);
                    reject(new Error('Error al subir archivo al servidor externo.'));
                }
            }
        });
    });
};


// Controlador para crear un nuevo usuario y generar un token JWT
usuarioCtl.crearUsuario = async (req, res, next) => {
    passport.authenticate('local.usuarioSignup', (err, user, info) => {
        if (err) {
            console.error('Error en autenticación de registro (controlador crearUsuario):', err);
            const customError = new Error('Error interno del servidor durante el registro.');
            customError.statusCode = 500;
            return next(customError);
        }
        if (!user) {
            const errorMessage = info && info.message ? info.message : 'Error en el registro.';
            const customError = new Error(errorMessage);
            customError.statusCode = 400;
            return next(customError);
        }

        req.logIn(user, async (err) => {
            if (err) {
                console.error('Error al iniciar sesión después del registro (controlador crearUsuario):', err);
                const customError = new Error('Error interno del servidor al iniciar sesión.');
                customError.statusCode = 500;
                return next(customError);
            }

            const token = generateToken(user); 
            
            // ELIMINADO: Lógica de creación de usuario en MongoDB

            return res.status(201).json({ 
                message: 'Usuario registrado y sesión iniciada exitosamente.', 
                user: {
                    idUsuario: user.idUsuario,
                    nombre: user.nombre,
                    correo: user.correo,
                    type: user.type
                },
                token: token // Envía el token al cliente
            });
        });
    })(req, res, next);
};


// Obtener todos los usuarios
usuarioCtl.obtenerUsuarios = async (req, res, next) => {
    try {
        const [listaUsuarios] = await sql.promise().query(`SELECT * FROM usuarios`);
        
        // ELIMINADO: Búsqueda y combinación con MongoDB
        
        return res.status(200).json({
            success: true,
            message: 'Usuarios obtenidos exitosamente',
            data: listaUsuarios // Solo devuelve los usuarios de SQL
        });
    } catch (error) {
        console.error('Error al obtener usuarios:', error);
        const customError = new Error('Error interno del servidor al obtener usuarios.');
        customError.statusCode = 500;
        next(customError);
    }
};

// Obtener un usuario por ID
usuarioCtl.obtenerUsuario = async (req, res, next) => {
    try {
        const { id } = req.params;
        const [usuario] = await sql.promise().query(`SELECT * FROM usuarios WHERE idUsuario = ?`, [id]);

        if (usuario.length === 0) {
            const customError = new Error('Usuario no encontrado.');
            customError.statusCode = 404;
            return next(customError);
        }

        // ELIMINADO: Búsqueda y combinación con MongoDB
        
        return res.status(200).json({
            success: true,
            message: 'Usuario obtenido exitosamente',
            data: usuario[0] // Solo devuelve el usuario de SQL
        });
    } catch (error) {
        console.error('Error al obtener usuario:', error);
        const customError = new Error('Error interno del servidor al obtener el usuario.');
        customError.statusCode = 500;
        next(customError);
    }
};

// Actualizar usuario
usuarioCtl.actualizarUsuario = async (req, res, next) => {
    try {
        const { id } = req.params;
        // ELIMINADO: fecha_registro_mongo, ultima_actividad (si solo son de Mongo)
        const { nombre, apellido, correo, telefono, estado, preferencias_notificacion } = req.body; 

        const [usuarioExistenteSql] = await sql.promise().query(`SELECT * FROM usuarios WHERE idUsuario = ?`, [id]);

        if (usuarioExistenteSql.length === 0) {
            const customError = new Error('Usuario no encontrado.');
            customError.statusCode = 404;
            return next(customError);
        }

        const currentTime = new Date().toLocaleString();

        const datosActualizacionSql = {
            nombre: nombre !== undefined ? nombre : usuarioExistenteSql[0].nombre,
            apellido: apellido !== undefined ? apellido : usuarioExistenteSql[0].apellido,
            correo: correo !== undefined ? correo : usuarioExistenteSql[0].correo,
            telefono: telefono !== undefined ? telefono : usuarioExistenteSql[0].telefono,
            estado: estado !== undefined ? estado : usuarioExistenteSql[0].estado,
            updateUsuario: currentTime,
            preferencias_notificacion: preferencias_notificacion !== undefined ? preferencias_notificacion : usuarioExistenteSql[0].preferencias_notificacion
        };
        
        await orm.usuario.update(datosActualizacionSql, {
            where: { idUsuario: id }
        });

        // ELIMINADO: Actualización en MongoDB

        return res.status(200).json({
            success: true,
            message: 'Usuario actualizado exitosamente.',
            data: { idUsuario: id }
        });
    } catch (error) {
        console.error('Error al actualizar usuario:', error);
        const customError = new Error('Error interno del servidor al actualizar el usuario.');
        customError.statusCode = 500;
        next(customError);
    }
};

// Eliminar usuario
usuarioCtl.eliminarUsuario = async (req, res, next) => {
    try {
        const { id } = req.params;
        const [usuarioExistenteSql] = await sql.promise().query(`SELECT * FROM usuarios WHERE idUsuario = ?`, [id]);

        if (usuarioExistenteSql.length === 0) {
            const customError = new Error('Usuario no encontrado.');
            customError.statusCode = 404;
            return next(customError);
        }

        await orm.usuario.destroy({
            where: { idUsuario: id }
        });

        // ELIMINADO: Eliminación en MongoDB

        return res.status(200).json({
            success: true,
            message: 'Usuario eliminado exitosamente.',
            data: null
        });
    } catch (error) {
        console.error('Error al eliminar usuario:', error);
        const customError = new Error('Error interno del servidor al eliminar el usuario.');
        customError.statusCode = 500;
        next(customError);
    }
};

// Cambiar contraseña de usuario
usuarioCtl.cambiarPassword = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { oldPassword, newPassword } = req.body; 

        if (!newPassword) {
            const customError = new Error('Se requiere la nueva contraseña para actualizar.');
            customError.statusCode = 400;
            return next(customError);
        }

        const [usuarioExistenteSql] = await sql.promise().query(`SELECT contraseña FROM usuarios WHERE idUsuario = ?`, [id]);

        if (usuarioExistenteSql.length === 0) {
            const customError = new Error('Usuario no encontrado.');
            customError.statusCode = 404;
            return next(customError);
        }

        const user = usuarioExistenteSql[0];
        const validPassword = await bcrypt.compare(oldPassword, user.contraseña);

        if (!validPassword) {
            const customError = new Error('Contraseña actual incorrecta.');
            customError.statusCode = 400;
            return next(customError);
        }

        const currentTime = new Date().toLocaleString();
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        const datosActualizacionSql = {
            contraseña: hashedPassword, 
            updateUsuario: currentTime
        };

        await orm.usuario.update(datosActualizacionSql, {
            where: { idUsuario: id }
        });
        
        return res.status(200).json({
            success: true,
            message: 'Contraseña actualizada exitosamente.',
            data: { idUsuario: id }
        });
    } catch (error) {
        console.error('Error al cambiar la contraseña:', error);
        const customError = new Error('Error interno del servidor al cambiar la contraseña.');
        customError.statusCode = 500;
        next(customError);
    }
};

// Exportar el objeto controlador
module.exports = usuarioCtl;
