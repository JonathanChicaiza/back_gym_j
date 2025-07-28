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
const sql = require('../Database/dataBase.sql'); // Mantener si sql.promise().query se usa directamente (ej. para búsqueda)

// Clave secreta para firmar los tokens JWT
// ¡IMPORTANTE!: En un entorno de producción, esta clave debe ser una variable de entorno,
// por ejemplo, cargándola desde un archivo .env
const JWT_SECRET = process.env.JWT_SECRET || 'tu_clave_secreta_super_segura_por_defecto'; 

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
// NOTA: Esta función intenta actualizar la base de datos (UPDATE usuarios SET columnName = ?),
// pero tu modelo actual de 'usuarios' NO incluye 'photoUsuario' ni 'documentUsuario'.
// La llamada a `sql.promise().query` fallaría si estas columnas no existen.
// Si necesitas almacenar estas rutas, DEBES AÑADIR photoUsuario y documentUsuario a tu modelo de DB.
// Por ahora, solo se maneja el guardado local y subida, pero la actualización de la DB se ha eliminado.
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
                    // Cuidado: Tu modelo de DB 'usuarios' NO incluye 'photoUsuario' ni 'documentUsuario'.
                    // Esta línea intentaría actualizar una columna que no existe y causaría un error.
                    // Si necesitas almacenar la ruta del archivo en la DB, debes añadir estas columnas a tu modelo.
                    // Se ha eliminado la línea: await sql.promise().query(`UPDATE usuarios SET ${columnName} = ? WHERE idUsuario = ?`, [archivo.name, idUser]);

                    const formData = new FormData();
                    formData.append('image', fs.createReadStream(filePath), {
                        filename: archivo.name,
                        contentType: archivo.mimetype,
                    });

                    // Mantener el token CSRF en la petición
                    // Nota: 'req.csrfToken()' y 'req.headers.cookie' dependen de que el middleware CSRF y cookie-parser estén configurados.
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
            passwordField: 'password', 
            passReqToCallback: true,
        },
        async (req, correo, password, done) => { 
            try {
                // Verificar si ya existe un usuario con ese correo
                const [existingUsers] = await sql.promise().query('SELECT correo FROM usuarios WHERE correo = ?', [correo]);
                
                if (existingUsers.length > 0) {
                    return done(null, false, { message: 'El correo ya está registrado.' });
                }

                // Hashear la contraseña antes de guardar
                const hashedPassword = await bcrypt.hash(password, 10); 

                // Extraer solo los campos que existen en tu modelo de DB 'usuarios'
                // Se eliminan 'apellido', 'preferencias_notificacion', ya que no están en el modelo.
                const { nombre, telefono } = req.body; 

                // Validar campos requeridos (basados en tu modelo de DB)
                // Se eliminan 'apellido' y 'estado' de la validación.
                if (!nombre || !correo || !password || !telefono) {
                    return done(null, false, { message: 'Faltan campos requeridos (nombre, correo, password, telefono).' });
                }

                const currentTime = new Date().toLocaleString();

                // Crear el usuario en SQL usando ORM
                const datosSql = {
                    nombre,
                    correo,
                    contraseña: hashedPassword, // Contraseña hasheada
                    telefono,
                    // Se eliminan 'apellido', 'estado', 'preferencias_notificacion', 'ultima_actividad'
                    // porque no están en el modelo de DB.
                    createUsuario: currentTime, // Campo de fecha de creación en SQL
                    updateUsuario: currentTime, // Inicialmente igual a create
                };
                
                const nuevoUsuarioSql = await orm.usuario.create(datosSql);
                const idUsuario = nuevoUsuarioSql.idUsuario; // Obtener el ID generado por SQL

                // Manejo de archivos: La lógica de guardar y subir se mantiene,
                // pero la actualización de la DB (dentro de guardarYSubirArchivo) no se ejecutará.
                // Si necesitas guardar estas rutas en DB, actualiza tu modelo 'usuarios'.
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
                // Se incluyen solo los campos del modelo de DB para la sesión inicial
                const userForSession = {
                    idUsuario: idUsuario,
                    nombre: nombre,
                    correo: correo,
                    telefono: telefono,
                    createUsuario: currentTime,
                    updateUsuario: currentTime,
                    // Se eliminan 'apellido', 'estado', 'preferencias_notificacion', 'ultima_actividad'
                    // porque no están en el modelo.
                    type: 'usuario' // Identificador de tipo de usuario
                };

                return done(null, userForSession, { message: '¡Registro exitoso! Bienvenido ' + nombre + '.' });
            } catch (error) {
                console.error('Error en estrategia usuarioSignup:', error);
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
            passwordField: 'password', 
            passReqToCallback: true,
        },
        async (req, correo, password, done) => { 
            try {
                // Buscar usuario por correo
                const [users] = await sql.promise().query('SELECT * FROM usuarios WHERE correo = ?', [correo]);
                const user = users[0];

                if (!user) {
                    return done(null, false, { message: 'Correo no registrado.' });
                }

                // Comparar la contraseña hasheada
                const validPassword = await bcrypt.compare(password, user.contraseña); 

                if (!validPassword) {
                    return done(null, false, { message: 'Contraseña incorrecta.' });
                }

                // Se elimina la validación del campo 'estado' porque no está en tu modelo de DB 'usuarios'.
                // if (user.estado !== 'activo') {
                //     return done(null, false, { message: 'Tu cuenta está inactiva. Por favor, contacta al soporte.' });
                // }

                // Se elimina la actualización del campo 'ultima_actividad' porque no está en tu modelo de DB 'usuarios'.
                // const currentTime = new Date().toLocaleString();
                // await sql.promise().query('UPDATE usuarios SET ultima_actividad = ? WHERE idUsuario = ?', [currentTime, user.idUsuario]);

                // Usuario autenticado exitosamente
                // Se incluyen solo los campos del modelo de DB para la sesión
                const userForSession = {
                    idUsuario: user.idUsuario,
                    nombre: user.nombre,
                    correo: user.correo,
                    telefono: user.telefono,
                    createUsuario: user.createUsuario,
                    updateUsuario: user.updateUsuario,
                    // Se eliminan 'apellido', 'estado', 'preferencias_notificacion', 'ultima_actividad',
                    // 'photoUsuario', 'documentUsuario' porque no están en el modelo.
                    type: 'usuario' // Identificador de tipo de usuario
                };

                return done(null, userForSession, { message: 'Bienvenido de nuevo, ' + user.nombre + '!' });
            } catch (error) {
                console.error('Error en estrategia usuarioSignin:', error);
                return done(error);
            }
        }
    )
);


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

        // Crear el objeto usuario con **solo** los datos que existen en tu modelo de DB
        const user = {
            idUsuario: usuario[0].idUsuario,
            nombre: usuario[0].nombre,
            correo: usuario[0].correo,
            contraseña: usuario[0].contraseña, 
            telefono: usuario[0].telefono,
            createUsuario: usuario[0].createUsuario,
            updateUsuario: usuario[0].updateUsuario,
            // Se eliminan 'apellido', 'estado', 'preferencias_notificacion', 'ultima_actividad',
            // 'photoUsuario', 'documentUsuario' porque no están en tu modelo de DB 'usuarios'.
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