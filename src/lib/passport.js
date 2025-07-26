const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');
const jwt = require('jsonwebtoken'); // Importar jsonwebtoken

// Archivos de conexión a la base de datos
const orm = require('../Database/dataBase.orm');
const sql = require('../Database/dataBase.sql');

// Clave secreta para firmar los tokens JWT
// ¡IMPORTANTE!: En un entorno de producción, esta clave debe ser una variable de entorno
const JWT_SECRET = process.env.JWT_SECRET || 'tu_clave_secreta_super_segura'; 

// Función para generar un token JWT
const generateToken = (user) => {
    // Define la información que quieres incluir en el token (payload)
    const payload = {
        id: user.idUsuario,
        correo: user.correo,
        type: user.type // 'usuario'
    };
    // Firma el token con la clave secreta y establece una expiración (ej. 1 hora)
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
};

// Función para guardar y subir archivos con token CSRF
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

// --- ESTRATEGIAS PARA USUARIOS (modelo 'usuarios' - Solo SQL) ---

// Estrategia de Registro para Usuarios
passport.use(
    'local.usuarioSignup',
    new LocalStrategy(
        {
            usernameField: 'correo', // Usaremos el correo como campo de usuario para el registro
            passwordField: 'contraseña',
            passReqToCallback: true,
        },
        async (req, correo, contraseña, done) => {
            try {
                // Verificar si ya existe un usuario con ese correo
                const [existingUsers] = await sql.promise().query('SELECT correo FROM usuarios WHERE correo = ?', [correo]);
                
                if (existingUsers.length > 0) {
                    // Pasar el mensaje de error directamente en el tercer argumento
                    return done(null, false, { message: 'El correo ya está registrado.' });
                }

                // Hashear la contraseña antes de guardar
                const hashedPassword = await bcrypt.hash(contraseña, 10);

                const { nombre, apellido, telefono, preferencias_notificacion } = req.body;

                // Validar campos requeridos
                if (!nombre || !apellido || !correo || !contraseña || !telefono) {
                    // Pasar el mensaje de error directamente en el tercer argumento
                    return done(null, false, { message: 'Faltan campos requeridos (nombre, apellido, correo, contraseña, telefono).' });
                }

                const currentTime = new Date().toLocaleString();

                // Crear el usuario en SQL usando ORM
                const datosSql = {
                    nombre,
                    apellido,
                    correo,
                    contraseña: hashedPassword, // Contraseña hasheada
                    telefono,
                    estado: 'activo', // Estado por defecto para el usuario
                    createUsuario: currentTime, // Campo de fecha de creación en SQL
                    updateUsuario: currentTime, // Inicialmente igual a create
                    preferencias_notificacion: preferencias_notificacion || 'email', // Agregar preferencias si tu tabla lo incluye
                    ultima_actividad: currentTime // Agregar ultima actividad si tu tabla lo incluye
                };
                
                const nuevoUsuarioSql = await orm.usuario.create(datosSql);
                const idUsuario = nuevoUsuarioSql.idUsuario; // Obtener el ID generado por SQL

                // Manejo de archivos si existen (usando la función con token CSRF)
                if (req.files) {
                    const { photoUsuario, documentUsuario } = req.files;

                    if (photoUsuario) {
                        const photoFilePath = path.join(__dirname, '/../public/img/usuario/', photoUsuario.name);
                        await guardarYSubirArchivo(photoUsuario, photoFilePath, 'photoUsuario', idUsuario, 'https://www.central.profego-edu.com/imagenUsuario', req);
                    }
                    if (documentUsuario) {
                        const docFilePath = path.join(__dirname, '/../public/docs/usuario/', documentUsuario.name);
                        await guardarYSubirArchivo(documentUsuario, docFilePath, 'documentUsuario', idUsuario, 'https://www.central.profego-edu.com/documentoUsuario', req);
                    }
                }

                // El usuario creado se devuelve a Passport para iniciar sesión
                const userForSession = {
                    idUsuario: idUsuario,
                    nombre: nombre,
                    apellido: apellido,
                    correo: correo,
                    telefono: telefono,
                    estado: 'activo',
                    createUsuario: currentTime,
                    updateUsuario: currentTime,
                    preferencias_notificacion: preferencias_notificacion || 'email',
                    ultima_actividad: currentTime,
                    type: 'usuario' // Identificador de tipo de usuario
                };

                // Pasar el mensaje de éxito directamente en el tercer argumento
                return done(null, userForSession, { message: '¡Registro exitoso! Bienvenido ' + nombre + '.' });
            } catch (error) {
                console.error('Error en estrategia usuarioSignup:', error);
                // Pasar el error directamente
                return done(error);
            }
        }
    )
);

// Estrategia de Inicio de Sesión para Usuarios
passport.use(
    'local.usuarioSignin',
    new LocalStrategy(
        {
            usernameField: 'correo', // Usaremos el correo para iniciar sesión
            passwordField: 'contraseña',
            passReqToCallback: true,
        },
        async (req, correo, contraseña, done) => {
            try {
                // Buscar usuario por correo
                const [users] = await sql.promise().query('SELECT * FROM usuarios WHERE correo = ?', [correo]);
                const user = users[0];

                if (!user) {
                    // Pasar el mensaje de error directamente en el tercer argumento
                    return done(null, false, { message: 'Correo no registrado.' });
                }

                // Comparar la contraseña hasheada
                const validPassword = await bcrypt.compare(contraseña, user.contraseña);

                if (!validPassword) {
                    // Pasar el mensaje de error directamente en el tercer argumento
                    return done(null, false, { message: 'Contraseña incorrecta.' });
                }

                // Si el usuario está inactivo, no permitir el inicio de sesión
                if (user.estado !== 'activo') {
                    // Pasar el mensaje de error directamente en el tercer argumento
                    return done(null, false, { message: 'Tu cuenta está inactiva. Por favor, contacta al soporte.' });
                }

                // Actualizar la última actividad del usuario
                const currentTime = new Date().toLocaleString();
                await sql.promise().query('UPDATE usuarios SET ultima_actividad = ? WHERE idUsuario = ?', [currentTime, user.idUsuario]);

                // Usuario autenticado exitosamente
                const userForSession = {
                    idUsuario: user.idUsuario,
                    nombre: user.nombre,
                    apellido: user.apellido,
                    correo: user.correo,
                    telefono: user.telefono,
                    estado: user.estado,
                    createUsuario: user.createUsuario,
                    updateUsuario: user.updateUsuario,
                    preferencias_notificacion: user.preferencias_notificacion,
                    ultima_actividad: currentTime,
                    photoUsuario: user.photoUsuario,
                    documentUsuario: user.documentUsuario,
                    type: 'usuario' // Identificador de tipo de usuario
                };

                // Pasar el mensaje de éxito directamente en el tercer argumento
                return done(null, userForSession, { message: 'Bienvenido de nuevo, ' + user.nombre + '!' });
            } catch (error) {
                console.error('Error en estrategia usuarioSignin:', error);
                // Pasar el error directamente
                return done(error);
            }
        }
    )
);

// --- Serialización y Deserialización de Usuarios ---

// Serializa el usuario para almacenar en la sesión
passport.serializeUser((user, done) => {
    // Solo almacenamos el ID y tipo de usuario en la sesión
    const sessionData = { 
        id: user.idUsuario, 
        type: 'usuario' 
    };
    done(null, sessionData);
});

// Deserializa el usuario para recuperarlo de la sesión en cada request
passport.deserializeUser(async (sessionData, done) => {
    try {
        // Consultar el usuario por ID desde la base de datos SQL
        const [usuario] = await sql.promise().query('SELECT * FROM usuarios WHERE idUsuario = ?', [sessionData.id]);
        
        if (usuario.length === 0) {
            return done(new Error('Usuario no encontrado durante la deserialización.'));
        }

        // Crear el objeto usuario con todos los datos de SQL
        const user = {
            idUsuario: usuario[0].idUsuario,
            nombre: usuario[0].nombre,
            apellido: usuario[0].apellido,
            correo: usuario[0].correo,
            contraseña: usuario[0].contraseña, // Incluir para mantener consistencia
            telefono: usuario[0].telefono,
            estado: usuario[0].estado,
            createUsuario: usuario[0].createUsuario,
            updateUsuario: usuario[0].updateUsuario,
            preferencias_notificacion: usuario[0].preferencias_notificacion,
            ultima_actividad: usuario[0].ultima_actividad,
            photoUsuario: usuario[0].photoUsuario,
            documentUsuario: usuario[0].documentUsuario,
            type: 'usuario'
        };

        done(null, user);
    } catch (error) {
        console.error('Error en la deserialización del usuario:', error);
        done(error);
    }
});

module.exports = {
    passport,
    generateToken // Exportar la función para generar el token
};
