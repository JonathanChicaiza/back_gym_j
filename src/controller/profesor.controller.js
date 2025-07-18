const profesorCtl = {};
const orm = require('../Database/dataBase.orm');
const sql = require('../Database/dataBase.sql');
const mongo = require('../Database/dataBaseMongose'); // Asegúrate de tener el modelo MongoDB definido
const { cifrarDatos, descifrarDatos } = require('../lib/encrypDates');

function safeDecrypt(data) {
    try {
        return descifrarDatos(data);
    } catch (error) {
        console.error('Error al descifrar datos:', error.message);
        return '';
    }
}

// Mostrar un profesor desde MySQL y datos adicionales desde MongoDB
profesorCtl.mostrarProfesor = async (req, res) => {
    try {
        // Obtener todos los profesores desde MySQL
        const [listaProfesores] = await sql.promise().query('SELECT * FROM profesores');

        if (listaProfesores.length === 0) {
            return { error: 'No hay profesores registrados' };
        }

        // Tomar el primer profesor (puedes adaptar esto para buscar por ID si lo deseas)
        const profesorSql = listaProfesores[0];

        // Buscar datos adicionales en MongoDB usando el idProfesor
        const profesorMongo = await mongo.profesorModel.findOne({
            where: { idProfesorSql: profesorSql.idProfesor }
        });

        const data = {
            profesorSql,
            profesorMongo
        };

        return data;
    } catch (error) {
        console.error('Error al obtener profesor:', error.message);
        return { error: 'Error al obtener datos del profesor' };
    }
};

// Crear un profesor en MySQL y guardar datos adicionales en MongoDB
profesorCtl.crearProfesor = async (req, res) => {
    const id = req.user.idUser; // Suponiendo que usas autenticación y tienes req.user
    try {
        const {
            especialidad,
            horarioTrabajo,
            // Datos adicionales para MongoDB
            datosAdicionales,
            observaciones,
            estadoProfesor
        } = req.body;

        // Datos a guardar en MySQL
        const envioSQL = {
            especialidad,
            horarioTrabajo,
            createProfesor: new Date().toLocaleString(),
        };

        // Crear profesor en MySQL
        const envioProfesor = await orm.profesor.create(envioSQL);
        const idProfesor = envioProfesor.idProfesor;

        // Datos a guardar en MongoDB
        const envioMongo = {
            datosAdicionales,
            observaciones,
            estadoProfesor,
            idProfesorSql: idProfesor,
            fechaCreacionMongo: new Date().toLocaleString()
        };

        // Guardar en MongoDB
        await mongo.profesorModel.create(envioMongo);

        return { message: 'Profesor creado con éxito' };

    } catch (error) {
        console.error('Error al crear profesor:', error.message);
        return { error: 'Error al crear profesor' };
    }
};

module.exports = profesorCtl;