const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs'); // ¡Importante! Necesitas instalarlo: npm install bcryptjs
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');

const { cifrarDatos, descifrarDatos } = require('./encrypDates');

// Archivos de conexión a la base de datos
const orm = require('../Database/dataBase.orm');
const sql = require('../Database/dataBase.sql');
const mongo = require('../Database/dataBaseMongose'); // Asegúrate de que este archivo exporta mongoose.model('Usuario') como 'Usuario'

// Función auxiliar para descifrar datos de forma segura
function safeDecrypt(data) {
    try {
        if (data === null || data === undefined) return ''; // Manejar nulos o indefinidos
        return descifrarDatos(data);
    } catch (error) {
        console.error('Error al descifrar datos:', error.message);
        return ''; // Devolver una cadena vacía si ocurre un error
    }
}

// Función para guardar y subir archivos (mantenida de tu código original)
const guardarYSubirArchivo = async (archivo, filePath, columnName, idUser, url, req) => {
    const validaciones = {
        imagen: [".PNG", ".JPG", ".JPEG", ".GIF", ".TIF", ".png", ".jpg", ".jpeg", ".gif", ".tif", ".ico", ".ICO", ".webp", ".WEBP"],
        pdf: [".pdf", ".PDF"]
    };
    // Ajuste: Determinar el tipo de archivo basado en la columna o en el contexto
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
                    let tableName = '';
                    let idColumnName = '';
                    if (columnName.includes('Estudent')) {
                        tableName = 'students';
                        idColumnName = 'idEstudent';
                    } else if (columnName.includes('Profesor')) {
                        tableName = 'profesores';
                        idColumnName = 'idProfesor';
                    } else {
                        throw new Error('Tipo de usuario no reconocido para subir archivo.');
                    }

                    await sql.promise().query(`UPDATE ${tableName} SET ${columnName} = ? WHERE ${idColumnName} = ?`, [archivo.name, idUser]);

                    const formData = new FormData();
                    formData.append('image', fs.createReadStream(filePath), {
                        filename: archivo.name,
                        contentType: archivo.mimetype,
                    });

                    const response = await axios.post(url, formData, {
                        headers: {
                            'Content-Type': 'multipart/form-data',
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


// --- Estrategias de Passport ---

// Estrategia de inicio de sesión para Profesores
passport.use(
    'local.profesorSignin',
    new LocalStrategy(
        {
            usernameField: 'username', // Asumo que 'username' es usernameProfesor
            passwordField: 'password',
            passReqToCallback: true,
        },
        async (req, username, password, done) => {
            try {
                const [users] = await sql.promise().query('SELECT * FROM profesores WHERE usernameProfesor = ?', [username]);
                const user = users[0];

                if (!user) {
                    return done(null, false, req.flash("message", "El nombre de usuario del profesor no existe."));
                }

                // Comparar la contraseña hasheada
                const validPassword = await bcrypt.compare(password, user.passwordProfesor);

                if (!validPassword) {
                    return done(null, false, req.flash("message", "Contraseña incorrecta."));
                }

                // Si el usuario está inactivo, no permitir el inicio de sesión
                if (user.stateProfesor !== 'activo') { // Asumiendo que 'activo' es el estado deseado
                    return done(null, false, req.flash('message', 'Tu cuenta de profesor está inactiva.'));
                }

                // Descifrar datos para la sesión
                const profesorForSession = {
                    idProfesor: user.idProfesor,
                    usernameProfesor: user.usernameProfesor,
                    completeNmeProfesor: safeDecrypt(user.completeNmeProfesor),
                    emailProfesor: safeDecrypt(user.emailProfesor),
                    phoneProfesor: safeDecrypt(user.phoneProfesor),
                    rolProfesor: user.rolProfesor,
                    stateProfesor: user.stateProfesor,
                    type: 'profesor' // Identificador de tipo de usuario
                };

                return done(null, profesorForSession, req.flash("success", "Bienvenido Profesor " + profesorForSession.completeNmeProfesor));
            } catch (error) {
                console.error('Error en estrategia profesorSignin:', error);
                return done(error);
            }
        }
    )
);

// Estrategia de inicio de sesión para Estudiantes
passport.use(
    'local.studentSignin',
    new LocalStrategy(
        {
            usernameField: 'username', // Asumo que 'username' es usernameEstudent
            passwordField: 'password',
            passReqToCallback: true,
        },
        async (req, username, password, done) => {
            try {
                const [users] = await sql.promise().query('SELECT * FROM students WHERE usernameEstudent = ?', [username]);
                const user = users[0];

                if (!user) {
                    return done(null, false, req.flash("message", "El nombre de usuario del estudiante no existe."));
                }

                // Comparar la contraseña hasheada
                const validPassword = await bcrypt.compare(password, user.passwordEstudent);

                if (!validPassword) {
                    return done(null, false, req.flash("message", "Contraseña incorrecta."));
                }

                // Si el usuario está inactivo, no permitir el inicio de sesión
                if (user.stateEstudent !== 'Activar') { // Asumiendo 'Activar' es el estado deseado
                    return done(null, false, req.flash('message', 'Tu cuenta de estudiante está inactiva.'));
                }

                // Descifrar datos para la sesión
                const studentForSession = {
                    idEstudent: user.idEstudent,
                    usernameEstudent: user.usernameEstudent,
                    completeNameEstudent: safeDecrypt(user.completeNameEstudent),
                    emailEstudent: safeDecrypt(user.emailEstudent),
                    celularEstudent: safeDecrypt(user.celularEstudent),
                    ubicationStudent: user.ubicationStudent,
                    rolStudent: user.rolStudent,
                    stateEstudent: user.stateEstudent,
                    type: 'student' // Identificador de tipo de usuario
                };

                return done(null, studentForSession, req.flash("success", "Bienvenido Estudiante " + studentForSession.completeNameEstudent));
            } catch (error) {
                console.error('Error en estrategia studentSignin:', error);
                return done(error);
            }
        }
    )
);

// Estrategia de Registro para Estudiantes
passport.use(
    'local.studentSignup',
    new LocalStrategy(
        {
            usernameField: 'username', // Asumo que 'username' es la cédula/identificación
            passwordField: 'password',
            passReqToCallback: true,
        },
        async (req, username, password, done) => {
            try {
                // Buscar si ya existe un estudiante con ese username (cédula)
                const [existingStudents] = await sql.promise().query('SELECT usernameEstudent FROM students WHERE usernameEstudent = ?', [username]);
                if (existingStudents.length > 0) {
                    return done(null, false, req.flash('message', 'La cédula del estudiante ya existe.'));
                }

                // Hashear la contraseña
                const hashedPassword = await bcrypt.hash(password, 10);

                const {
                    idEstudent, // Si idEstudent se genera automáticamente, no lo pases en el body
                    completeNameEstudent,
                    emailEstudent,
                    celularEstudent,
                    ubicacion,
                } = req.body;

                let newStudent = {
                    idEstudent: idEstudent, // Si es autoincrementable, no lo incluyas aquí
                    identificationCardStudent: cifrarDatos(username), // Cifrar la identificación
                    celularEstudent: cifrarDatos(celularEstudent),
                    emailEstudent: cifrarDatos(emailEstudent),
                    completeNameEstudent: cifrarDatos(completeNameEstudent),
                    usernameEstudent: username, // El username (cédula) se guarda sin cifrar para búsquedas directas
                    passwordEstudent: hashedPassword, // Contraseña hasheada
                    ubicationStudent: ubicacion,
                    rolStudent: 'student',
                    stateEstudent: 'Activar',
                    createStudent: new Date().toISOString() // Usar formato ISO 8601
                };

                const result = await orm.student.create(newStudent);
                const studentId = result.idEstudent || result.insertId; // Obtener el ID insertado

                // Manejo de archivos si existen
                if (req.files) {
                    const { photoEstudent, documentEstudent } = req.files;

                    if (photoEstudent) {
                        const photoFilePath = path.join(__dirname, '/../public/img/usuario/', photoEstudent.name);
                        await guardarYSubirArchivo(photoEstudent, photoFilePath, 'photoEstudent', studentId, 'https://www.central.profego-edu.com/imagenEstudiante', req);
                    }
                    if (documentEstudent) {
                        const docFilePath = path.join(__dirname, '/../public/docs/estudiante/', documentEstudent.name);
                        await guardarYSubirArchivo(documentEstudent, docFilePath, 'documentEstudent', studentId, 'https://www.central.profego-edu.com/documentoEstudiante', req);
                    }
                }

                // Preparar usuario para la sesión
                const studentForSession = {
                    idEstudent: studentId,
                    usernameEstudent: username,
                    completeNameEstudent: completeNameEstudent,
                    rolStudent: 'student',
                    type: 'student' // Identificador de tipo de usuario
                };

                return done(null, studentForSession, req.flash('success', 'Registro de estudiante exitoso.'));
            } catch (error) {
                console.error('Error en estrategia studentSignup:', error);
                return done(error);
            }
        }
    )
);

// Estrategia de Registro para Profesores
passport.use(
    'local.profesorSignup',
    new LocalStrategy(
        {
            usernameField: 'username', // Asumo que 'username' es la cédula/identificación
            passwordField: 'password',
            passReqToCallback: true,
        },
        async (req, username, password, done) => {
            try {
                // Buscar si ya existe un profesor con esa identificación (cifrada)
                const [existingProfesores] = await sql.promise().query('SELECT identificationCardProfesor FROM profesores WHERE identificationCardProfesor = ?', [cifrarDatos(username)]);
                if (existingProfesores.length > 0) {
                    return done(null, false, req.flash('message', 'La cédula del profesor ya existe.'));
                }

                // Hashear la contraseña
                const hashedPassword = await bcrypt.hash(password, 10);

                const {
                    idProfesor,
                    completeNmeProfesor,
                    emailProfesor,
                    phoneProfesor
                } = req.body;

                let newProfesor = {
                    idProfesor: idProfesor, // Si es autoincrementable, no lo incluyas aquí
                    identificationCardProfesor: cifrarDatos(username), // Cifrar la identificación
                    phoneProfesor: cifrarDatos(phoneProfesor),
                    emailProfesor: cifrarDatos(emailProfesor),
                    completeNmeProfesor: cifrarDatos(completeNmeProfesor),
                    usernameProfesor: username, // El username (cédula) se guarda sin cifrar para búsquedas directas
                    passwordProfesor: hashedPassword, // Contraseña hasheada
                    rolProfesor: 'profesor',
                    stateProfesor: 'pendiente',
                    createProfesor: new Date().toISOString()
                };

                const result = await orm.profesor.create(newProfesor);
                const profesorId = result.idProfesor || result.insertId; // Obtener el ID insertado

                // Preparar usuario para la sesión
                const profesorForSession = {
                    idProfesor: profesorId,
                    usernameProfesor: username,
                    completeNmeProfesor: completeNmeProfesor,
                    rolProfesor: 'profesor',
                    type: 'profesor' // Identificador de tipo de usuario
                };

                return done(null, profesorForSession, req.flash('success', 'Registro de profesor exitoso.'));
            } catch (error) {
                console.error('Error en estrategia profesorSignup:', error);
                return done(error);
            }
        }
    )
);

// --- ESTRATEGIAS PARA USUARIOS GENERALES (modelo 'usuarios') ---

// Estrategia de Registro para Usuarios Generales
passport.use(
    'local.signup', // Nombre de la estrategia para registro de usuarios generales
    new LocalStrategy(
        {
            usernameField: 'correo', // Usaremos el correo como campo de usuario para el registro
            passwordField: 'password',
            passReqToCallback: true,
        },
        async (req, correo, password, done) => {
            try {
                // Buscar si ya existe un usuario con ese correo (descifrado)
                const [existingUsers] = await sql.promise().query('SELECT correo FROM usuarios');
                const userExists = existingUsers.find(user => safeDecrypt(user.correo) === correo);

                if (userExists) {
                    return done(null, false, req.flash('message', 'El correo ya está registrado.'));
                }

                // Hashear la contraseña antes de guardar
                const hashedPassword = await bcrypt.hash(password, 10);

                const { nombre, apellido, rolId, estado } = req.body;

                // Cifrar datos sensibles antes de guardar en SQL
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
                    createUsuario: new Date().toISOString(),
                    updateUsuario: new Date().toISOString()
                };

                const resultSql = await orm.usuario.create(newSqlUser);
                const idUsuarioSql = resultSql.idUsuario || resultSql.insertId; // Obtener el ID insertado

                // Crear entrada en MongoDB
                const newMongoUser = {
                    id_usuario: idUsuarioSql, // Vinculamos con el ID de SQL
                    fecha_registro: new Date(),
                };
                await mongo.Usuario.create(newMongoUser);

                // El usuario creado se devuelve a Passport para iniciar sesión
                const userForSession = {
                    idUsuario: idUsuarioSql,
                    nombre: nombre, // Se pasa el original para la sesión
                    correo: correo,
                    rolId: rolId || 2,
                    estado: estado || 'activo',
                    type: 'usuario' // Identificador de tipo de usuario
                };

                return done(null, userForSession, req.flash('success', '¡Registro exitoso! Bienvenido.'));
            } catch (error) {
                console.error('Error en estrategia local.signup:', error);
                return done(error);
            }
        }
    )
);

// Estrategia de Inicio de Sesión para Usuarios Generales
passport.use(
    'local.signin', // Nombre de la estrategia para inicio de sesión de usuarios generales
    new LocalStrategy(
        {
            usernameField: 'correo', // Usaremos el correo para iniciar sesión
            passwordField: 'password',
            passReqToCallback: true,
        },
        async (req, correo, password, done) => {
            try {
                const [users] = await sql.promise().query('SELECT * FROM usuarios');
                const user = users.find(u => safeDecrypt(u.correo) === correo);

                if (!user) {
                    return done(null, false, req.flash('message', 'Correo no registrado.'));
                }

                // Comparar la contraseña hasheada
                const validPassword = await bcrypt.compare(password, user.contraseña);

                if (!validPassword) {
                    return done(null, false, req.flash('message', 'Contraseña incorrecta.'));
                }

                // Si el usuario está inactivo, no permitir el inicio de sesión
                if (user.estado !== 'activo') {
                    return done(null, false, req.flash('message', 'Tu cuenta está inactiva. Por favor, contacta al soporte.'));
                }

                // Usuario autenticado exitosamente
                const userForSession = {
                    idUsuario: user.idUsuario,
                    nombre: safeDecrypt(user.nombre),
                    apellido: safeDecrypt(user.apellido),
                    correo: safeDecrypt(user.correo),
                    rolId: user.rolId,
                    estado: user.estado,
                    type: 'usuario' // Identificador de tipo de usuario
                };

                return done(null, userForSession, req.flash('success', 'Bienvenido de nuevo, ' + userForSession.nombre + '!'));
            } catch (error) {
                console.error('Error en estrategia local.signin:', error);
                return done(error);
            }
        }
    )
);

// --- Serialización y Deserialización de Usuarios ---

// Serializa el usuario para almacenar en la sesión
passport.serializeUser((user, done) => {
    // Almacenamos un objeto mínimo en la sesión para identificar al usuario y su tipo
    let sessionData = {};
    if (user.idUsuario) {
        sessionData = { id: user.idUsuario, type: 'usuario', rol: user.rolId };
    } else if (user.idProfesor) {
        sessionData = { id: user.idProfesor, type: 'profesor', rol: user.rolProfesor };
    } else if (user.idEstudent) {
        sessionData = { id: user.idEstudent, type: 'student', rol: user.rolStudent };
    }
    done(null, sessionData);
});

// Deserializa el usuario para recuperarlo de la sesión en cada request
passport.deserializeUser(async (sessionData, done) => {
    try {
        let user = null;
        if (sessionData.type === 'usuario') {
            const [users] = await sql.promise().query('SELECT * FROM usuarios WHERE idUsuario = ?', [sessionData.id]);
            user = users[0];
            if (user) {
                user = {
                    idUsuario: user.idUsuario,
                    nombre: safeDecrypt(user.nombre),
                    apellido: safeDecrypt(user.apellido),
                    correo: safeDecrypt(user.correo),
                    rolId: user.rolId,
                    estado: user.estado,
                    type: 'usuario'
                };
            }
        } else if (sessionData.type === 'profesor') {
            const [profesores] = await sql.promise().query('SELECT * FROM profesores WHERE idProfesor = ?', [sessionData.id]);
            user = profesores[0];
            if (user) {
                user = {
                    idProfesor: user.idProfesor,
                    usernameProfesor: user.usernameProfesor,
                    completeNmeProfesor: safeDecrypt(user.completeNmeProfesor),
                    emailProfesor: safeDecrypt(user.emailProfesor),
                    phoneProfesor: safeDecrypt(user.phoneProfesor),
                    rolProfesor: user.rolProfesor,
                    stateProfesor: user.stateProfesor,
                    type: 'profesor'
                };
            }
        } else if (sessionData.type === 'student') {
            const [students] = await sql.promise().query('SELECT * FROM students WHERE idEstudent = ?', [sessionData.id]);
            user = students[0];
            if (user) {
                user = {
                    idEstudent: user.idEstudent,
                    usernameEstudent: user.usernameEstudent,
                    completeNameEstudent: safeDecrypt(user.completeNameEstudent),
                    emailEstudent: safeDecrypt(user.emailEstudent),
                    celularEstudent: safeDecrypt(user.celularEstudent),
                    ubicacion: user.ubicationStudent,
                    rolStudent: user.rolStudent,
                    stateEstudent: user.stateEstudent,
                    type: 'student'
                };
            }
        }

        if (user) {
            done(null, user);
        } else {
            done(new Error('Usuario no encontrado durante la deserialización.'));
        }
    } catch (error) {
        console.error('Error en la deserialización del usuario:', error);
        done(error);
    }
});

module.exports = passport;
