const orm = require('../Database/dataBase.orm');
const sql = require('../Database/dataBase.sql');
const mongo = require('../Database/dataBaseMongose');

const rutinaCtl = {};

// Obtener todas las rutinas
rutinaCtl.obtenerRutinas = async (req, res) => {
    try {
        // Consultar todas las rutinas desde la base de datos SQL
        const [listaRutinas] = await sql.promise().query(`
            SELECT * FROM rutinas
        `);

        // Para cada rutina SQL, buscar su contraparte en MongoDB
        const rutinasCompletas = await Promise.all(
            listaRutinas.map(async (rutina) => {
                // Asumiendo que idRutina en SQL se mapea a id_rutinaSql en MongoDB
                const rutinaMongo = await mongo.Rutina.findOne({ 
                    id_rutinaSql: rutina.idRutina.toString() // Convertir a string para coincidir con el tipo en Mongo
                });
                return {
                    ...rutina,
                    detallesMongo: rutinaMongo
                };
            })
        );

        // Establecer mensaje flash de éxito y enviar respuesta API
        res.flash('success', 'Rutinas obtenidas exitosamente');
        return res.apiResponse(rutinasCompletas, 200, 'Rutinas obtenidas exitosamente');
    } catch (error) {
        // Capturar y registrar errores, establecer mensaje flash de error y enviar respuesta API de error
        console.error('Error al obtener rutinas:', error);
        res.flash('error', 'Error al obtener rutinas');
        return res.apiError('Error interno del servidor al obtener rutinas', 500);
    }
};

// Obtener una rutina por ID
rutinaCtl.obtenerRutina = async (req, res) => {
    try {
        const { id } = req.params;

        // Consultar la rutina por ID desde la base de datos SQL
        const [rutina] = await sql.promise().query(`
            SELECT * FROM rutinas WHERE idRutina = ?
        `, [id]);

        // Si no se encuentra la rutina en SQL, enviar error 404
        if (rutina.length === 0) {
            res.flash('error', 'Rutina no encontrada');
            return res.apiError('Rutina no encontrada', 404);
        }

        // Buscar la rutina correspondiente en MongoDB
        const rutinaMongo = await mongo.Rutina.findOne({ 
            id_rutinaSql: id.toString() // Asegurarse de que el ID sea string para la búsqueda en Mongo
        });

        // Combinar los datos de SQL y MongoDB
        const rutinaCompleta = {
            ...rutina[0],
            detallesMongo: rutinaMongo
        };

        // Establecer mensaje flash de éxito y enviar respuesta API
        res.flash('success', 'Rutina obtenida exitosamente');
        return res.apiResponse(rutinaCompleta, 200, 'Rutina obtenida exitosamente');
    } catch (error) {
        // Capturar y registrar errores, establecer mensaje flash de error y enviar respuesta API de error
        console.error('Error al obtener rutina:', error);
        res.flash('error', 'Error al obtener rutina');
        return res.apiError('Error interno del servidor al obtener la rutina', 500);
    }
};

// Crear nueva rutina
rutinaCtl.crearRutina = async (req, res) => {
    try {
        const { nombre, duracionSemanas, estado, descripcion, fecha_asignacion, ejercicios, nivel_dificultad, progreso_actual } = req.body;

        // Validar campos requeridos para la creación de la rutina en SQL
        if (!nombre || !duracionSemanas || !estado) {
            res.flash('error', 'Faltan campos requeridos para crear la rutina SQL (nombre, duracionSemanas, estado).');
            return res.apiError('Faltan campos requeridos para crear la rutina SQL.', 400);
        }

        const currentTime = new Date().toLocaleString();

        // Crear la rutina en SQL
        const datosSql = {
            nombre,
            duracionSemanas,
            estado,
            stateRutina: 'activa', // Estado por defecto para la rutina
            createRutina: currentTime, // Campo de fecha de creación en SQL
            updateRutina: currentTime // Inicialmente igual a create
        };
        
        const nuevaRutinaSql = await orm.rutina.create(datosSql);
        const idRutina = nuevaRutinaSql.idRutina; // Obtener el ID generado por SQL

        // Crear la rutina en MongoDB, vinculándola con el ID de SQL
        const datosMongo = {
            id_rutinaSql: idRutina.toString(), // Convertir a string para el ID de Mongo
            descripcion: descripcion || '',
            fecha_asignacion: fecha_asignacion || currentTime, // Usar fecha_asignacion del body o la actual
            ejercicios: ejercicios || '',
            nivel_dificultad: nivel_dificultad || '',
            progreso_actual: progreso_actual || '0%' // Progreso inicial
        };
        
        await mongo.Rutina.create(datosMongo);

        // Establecer mensaje flash de éxito y enviar respuesta API
        res.flash('success', 'Rutina creada exitosamente');
        return res.apiResponse(
            { idRutina }, 
            201, 
            'Rutina creada exitosamente'
        );
    } catch (error) {
        // Capturar y registrar errores, establecer mensaje flash de error y enviar respuesta API de error
        console.error('Error al crear rutina:', error);
        res.flash('error', 'Error al crear la rutina');
        return res.apiError('Error interno del servidor al crear la rutina', 500);
    }
};

// Actualizar rutina
rutinaCtl.actualizarRutina = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, duracionSemanas, estado, stateRutina, descripcion, fecha_asignacion, ejercicios, nivel_dificultad, progreso_actual } = req.body;

        // Verificar la existencia de la rutina en SQL
        const [rutinaExistenteSql] = await sql.promise().query(`
            SELECT * FROM rutinas WHERE idRutina = ?
        `, [id]);

        if (rutinaExistenteSql.length === 0) {
            res.flash('error', 'Rutina no encontrada');
            return res.apiError('Rutina no encontrada', 404);
        }

        const currentTime = new Date().toLocaleString();

        // Actualizar en SQL
        const datosActualizacionSql = {
            nombre: nombre !== undefined ? nombre : rutinaExistenteSql[0].nombre,
            duracionSemanas: duracionSemanas !== undefined ? duracionSemanas : rutinaExistenteSql[0].duracionSemanas,
            estado: estado !== undefined ? estado : rutinaExistenteSql[0].estado,
            stateRutina: stateRutina !== undefined ? stateRutina : rutinaExistenteSql[0].stateRutina,
            updateRutina: currentTime // Campo de fecha de actualización en SQL
        };
        
        await orm.rutina.update(datosActualizacionSql, {
            where: { idRutina: id }
        });

        // Actualizar en MongoDB
        const datosMongoActualizacion = {};
        if (descripcion !== undefined) datosMongoActualizacion.descripcion = descripcion;
        if (fecha_asignacion !== undefined) datosMongoActualizacion.fecha_asignacion = fecha_asignacion;
        if (ejercicios !== undefined) datosMongoActualizacion.ejercicios = ejercicios;
        if (nivel_dificultad !== undefined) datosMongoActualizacion.nivel_dificultad = nivel_dificultad;
        if (progreso_actual !== undefined) datosMongoActualizacion.progreso_actual = progreso_actual;

        await mongo.Rutina.findOneAndUpdate(
            { id_rutinaSql: id.toString() }, // Asegurarse de que el ID sea string para la búsqueda en Mongo
            datosMongoActualizacion,
            { new: true } // Para devolver el documento actualizado
        );

        // Establecer mensaje flash de éxito y enviar respuesta API
        res.flash('success', 'Rutina actualizada exitosamente');
        return res.apiResponse(
            { idRutina: id }, 
            200, 
            'Rutina actualizada exitosamente'
        );
    } catch (error) {
        // Capturar y registrar errores, establecer mensaje flash de error y enviar respuesta API de error
        console.error('Error al actualizar rutina:', error);
        res.flash('error', 'Error al actualizar la rutina');
        return res.apiError('Error interno del servidor al actualizar la rutina', 500);
    }
};

// Eliminar rutina
rutinaCtl.eliminarRutina = async (req, res) => {
    try {
        const { id } = req.params;

        // Verificar la existencia de la rutina en SQL
        const [rutinaExistenteSql] = await sql.promise().query(`
            SELECT * FROM rutinas WHERE idRutina = ?
        `, [id]);

        if (rutinaExistenteSql.length === 0) {
            res.flash('error', 'Rutina no encontrada');
            return res.apiError('Rutina no encontrada', 404);
        }

        // Eliminar en SQL
        await orm.rutina.destroy({
            where: { idRutina: id }
        });

        // Eliminar en MongoDB
        await mongo.Rutina.findOneAndDelete({ id_rutinaSql: id.toString() }); // Asegurarse de que el ID sea string para la búsqueda en Mongo

        // Establecer mensaje flash de éxito y enviar respuesta API
        res.flash('success', 'Rutina eliminada exitosamente');
        return res.apiResponse(
            null, 
            200, 
            'Rutina eliminada exitosamente'
        );
    } catch (error) {
        // Capturar y registrar errores, establecer mensaje flash de error y enviar respuesta API de error
        console.error('Error al eliminar rutina:', error);
        res.flash('error', 'Error al eliminar la rutina');
        return res.apiError('Error interno del servidor al eliminar la rutina', 500);
    }
};

module.exports = rutinaCtl;
