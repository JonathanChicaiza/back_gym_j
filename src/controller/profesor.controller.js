const orm = require('../Database/dataBase.orm');
const sql = require('../Database/dataBase.sql');
const mongo = require('../Database/dataBaseMongose'); // Asegúrate de que este archivo exporta 'Profesor'

// Definición del modelo de Mongoose para Profesor (asumiendo corrección del esquema proporcionado)
// Esto debería estar en tu archivo dataBaseMongose.js o un modelo separado para Profesor en MongoDB
// Para propósitos de este controlador, asumimos que mongo.Profesor está disponible.
// Si no lo está, necesitarías definirlo similar a esto en tu archivo de modelos de Mongoose:
/*
const mongoose = require('mongoose');
const ProfesorSchema = new mongoose.Schema({
    id_profesorSql: String,
    biografia: String,
    fecha_ingreso: String,
    certificaciones: String,
}, {
    collection: 'profesores',
    timestamps: false
});
const Profesor = mongoose.model('Profesor', ProfesorSchema);
module.exports = Profesor; // Y luego importarlo en dataBaseMongose.js para que sea accesible
*/

const profesorCtl = {};

// Obtener todos los profesores
profesorCtl.obtenerProfesores = async (req, res) => {
    try {
        // Consultar todos los profesores desde la base de datos SQL
        const [listaProfesores] = await sql.promise().query(`
            SELECT * FROM profesores
        `);

        // Para cada profesor SQL, buscar su contraparte en MongoDB
        const profesoresCompletos = await Promise.all(
            listaProfesores.map(async (profesor) => {
                // Asumiendo que idProfesor en SQL se mapea a id_profesorSql en MongoDB
                const profesorMongo = await mongo.Profesor.findOne({ 
                    id_profesorSql: profesor.idProfesor 
                });
                return {
                    ...profesor,
                    detallesMongo: profesorMongo
                };
            })
        );

        // Establecer mensaje flash de éxito y enviar respuesta API
        res.flash('success', 'Profesores obtenidos exitosamente');
        return res.apiResponse(profesoresCompletos, 200, 'Profesores obtenidos exitosamente');
    } catch (error) {
        // Capturar y registrar errores, establecer mensaje flash de error y enviar respuesta API de error
        console.error('Error al obtener profesores:', error);
        res.flash('error', 'Error al obtener profesores');
        return res.apiError('Error interno del servidor al obtener profesores', 500);
    }
};

// Obtener un profesor por ID
profesorCtl.obtenerProfesor = async (req, res) => {
    try {
        const { id } = req.params;

        // Consultar el profesor por ID desde la base de datos SQL
        const [profesor] = await sql.promise().query(`
            SELECT * FROM profesores WHERE idProfesor = ?
        `, [id]);

        // Si no se encuentra el profesor en SQL, enviar error 404
        if (profesor.length === 0) {
            res.flash('error', 'Profesor no encontrado');
            return res.apiError('Profesor no encontrado', 404);
        }

        // Buscar el profesor correspondiente en MongoDB
        const profesorMongo = await mongo.Profesor.findOne({ 
            id_profesorSql: parseInt(id) 
        });

        // Combinar los datos de SQL y MongoDB
        const profesorCompleto = {
            ...profesor[0],
            detallesMongo: profesorMongo
        };

        // Establecer mensaje flash de éxito y enviar respuesta API
        res.flash('success', 'Profesor obtenido exitosamente');
        return res.apiResponse(profesorCompleto, 200, 'Profesor obtenido exitosamente');
    } catch (error) {
        // Capturar y registrar errores, establecer mensaje flash de error y enviar respuesta API de error
        console.error('Error al obtener profesor:', error);
        res.flash('error', 'Error al obtener profesor');
        return res.apiError('Error interno del servidor al obtener el profesor', 500);
    }
};

// Crear nuevo profesor
profesorCtl.crearProfesor = async (req, res) => {
    try {
        const { especialidad, nombre, apellido, gmail, telefono, biografia, fecha_ingreso, certificaciones } = req.body;

        // Validar campos requeridos para la creación del profesor en SQL
        if (!especialidad || !nombre || !apellido || !gmail || !telefono) {
            res.flash('error', 'Faltan campos requeridos para crear el profesor SQL (especialidad, nombre, apellido, gmail, telefono).');
            return res.apiError('Faltan campos requeridos para crear el profesor SQL.', 400);
        }

        const currentTime = new Date().toLocaleString();

        // Crear el profesor en SQL
        const datosSql = {
            especialidad,
            nombre,
            apellido,
            gmail,
            telefono,
            stateProfesor: 'activo', // Estado por defecto
            createProfesor: currentTime, // Campo de fecha de creación en SQL
            updateProfesor: currentTime // Inicialmente igual a create
        };
        
        const nuevoProfesorSql = await orm.profesor.create(datosSql);
        const idProfesor = nuevoProfesorSql.idProfesor; // Obtener el ID generado por SQL

        // Crear el profesor en MongoDB, vinculándolo con el ID de SQL
        const datosMongo = {
            id_profesorSql: idProfesor,
            biografia: biografia || '',
            fecha_ingreso: fecha_ingreso || currentTime, // Usar fecha_ingreso del body o la actual
            certificaciones: certificaciones || ''
        };
        
        await mongo.Profesor.create(datosMongo);

        // Establecer mensaje flash de éxito y enviar respuesta API
        res.flash('success', 'Profesor creado exitosamente');
        return res.apiResponse(
            { idProfesor }, 
            201, 
            'Profesor creado exitosamente'
        );
    } catch (error) {
        // Capturar y registrar errores, establecer mensaje flash de error y enviar respuesta API de error
        console.error('Error al crear profesor:', error);
        res.flash('error', 'Error al crear el profesor');
        return res.apiError('Error interno del servidor al crear el profesor', 500);
    }
};

// Actualizar profesor
profesorCtl.actualizarProfesor = async (req, res) => {
    try {
        const { id } = req.params;
        const { especialidad, nombre, apellido, gmail, telefono, stateProfesor, biografia, fecha_ingreso, certificaciones } = req.body;

        // Verificar la existencia del profesor en SQL
        const [profesorExistenteSql] = await sql.promise().query(`
            SELECT * FROM profesores WHERE idProfesor = ?
        `, [id]);

        if (profesorExistenteSql.length === 0) {
            res.flash('error', 'Profesor no encontrado');
            return res.apiError('Profesor no encontrado', 404);
        }

        const currentTime = new Date().toLocaleString();

        // Actualizar en SQL
        const datosActualizacionSql = {
            especialidad: especialidad !== undefined ? especialidad : profesorExistenteSql[0].especialidad,
            nombre: nombre !== undefined ? nombre : profesorExistenteSql[0].nombre,
            apellido: apellido !== undefined ? apellido : profesorExistenteSql[0].apellido,
            gmail: gmail !== undefined ? gmail : profesorExistenteSql[0].gmail,
            telefono: telefono !== undefined ? telefono : profesorExistenteSql[0].telefono,
            stateProfesor: stateProfesor !== undefined ? stateProfesor : profesorExistenteSql[0].stateProfesor,
            updateProfesor: currentTime // Campo de fecha de actualización en SQL
        };
        
        await orm.profesor.update(datosActualizacionSql, {
            where: { idProfesor: id }
        });

        // Actualizar en MongoDB
        const datosMongoActualizacion = {};
        if (biografia !== undefined) datosMongoActualizacion.biografia = biografia;
        if (fecha_ingreso !== undefined) datosMongoActualizacion.fecha_ingreso = fecha_ingreso;
        if (certificaciones !== undefined) datosMongoActualizacion.certificaciones = certificaciones;

        await mongo.Profesor.findOneAndUpdate(
            { id_profesorSql: parseInt(id) },
            datosMongoActualizacion,
            { new: true } // Para devolver el documento actualizado
        );

        // Establecer mensaje flash de éxito y enviar respuesta API
        res.flash('success', 'Profesor actualizado exitosamente');
        return res.apiResponse(
            { idProfesor: id }, 
            200, 
            'Profesor actualizado exitosamente'
        );
    } catch (error) {
        // Capturar y registrar errores, establecer mensaje flash de error y enviar respuesta API de error
        console.error('Error al actualizar profesor:', error);
        res.flash('error', 'Error al actualizar el profesor');
        return res.apiError('Error interno del servidor al actualizar el profesor', 500);
    }
};

// Eliminar profesor
profesorCtl.eliminarProfesor = async (req, res) => {
    try {
        const { id } = req.params;

        // Verificar la existencia del profesor en SQL
        const [profesorExistenteSql] = await sql.promise().query(`
            SELECT * FROM profesores WHERE idProfesor = ?
        `, [id]);

        if (profesorExistenteSql.length === 0) {
            res.flash('error', 'Profesor no encontrado');
            return res.apiError('Profesor no encontrado', 404);
        }

        // Eliminar en SQL
        await orm.profesor.destroy({
            where: { idProfesor: id }
        });

        // Eliminar en MongoDB
        await mongo.Profesor.findOneAndDelete({ id_profesorSql: parseInt(id) });

        // Establecer mensaje flash de éxito y enviar respuesta API
        res.flash('success', 'Profesor eliminado exitosamente');
        return res.apiResponse(
            null, 
            200, 
            'Profesor eliminado exitosamente'
        );
    } catch (error) {
        // Capturar y registrar errores, establecer mensaje flash de error y enviar respuesta API de error
        console.error('Error al eliminar profesor:', error);
        res.flash('error', 'Error al eliminar el profesor');
        return res.apiError('Error interno del servidor al eliminar el profesor', 500);
    }
};

module.exports = profesorCtl;
