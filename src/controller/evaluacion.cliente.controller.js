const orm = require('../Database/dataBase.orm');
const sql = require('../Database/dataBase.sql');
const mongo = require('../Database/dataBaseMongose');

const evaluacionClienteCtl = {};

// Obtener todas las evaluaciones de clientes
evaluacionClienteCtl.obtenerEvaluaciones = async (req, res) => {
    try {
        // Consultar todas las evaluaciones desde la base de datos SQL
        const [listaEvaluaciones] = await sql.promise().query(`
            SELECT * FROM evaluaciones_clientes
        `);

        // Para cada evaluación SQL, buscar su contraparte en MongoDB
        const evaluacionesCompletas = await Promise.all(
            listaEvaluaciones.map(async (evaluacion) => {
                // Asumiendo que idEvaluacion en SQL se mapea a id_evaluacionSql en MongoDB
                const evaluacionMongo = await mongo.EvaluacionCliente.findOne({ 
                    id_evaluacionSql: evaluacion.idEvaluacion 
                });
                return {
                    ...evaluacion,
                    detallesMongo: evaluacionMongo
                };
            })
        );

        // Establecer mensaje flash de éxito y enviar respuesta API
        res.flash('success', 'Evaluaciones obtenidas exitosamente');
        return res.apiResponse(evaluacionesCompletas, 200, 'Evaluaciones obtenidas exitosamente');
    } catch (error) {
        // Capturar y registrar errores, establecer mensaje flash de error y enviar respuesta API de error
        console.error('Error al obtener evaluaciones:', error);
        res.flash('error', 'Error al obtener evaluaciones');
        return res.apiError('Error interno del servidor al obtener evaluaciones', 500);
    }
};

// Obtener una evaluación de cliente por ID
evaluacionClienteCtl.obtenerEvaluacion = async (req, res) => {
    try {
        const { id } = req.params;

        // Consultar la evaluación por ID desde la base de datos SQL
        const [evaluacion] = await sql.promise().query(`
            SELECT * FROM evaluaciones_clientes WHERE idEvaluacion = ?
        `, [id]);

        // Si no se encuentra la evaluación en SQL, enviar error 404
        if (evaluacion.length === 0) {
            res.flash('error', 'Evaluación no encontrada');
            return res.apiError('Evaluación no encontrada', 404);
        }

        // Buscar la evaluación correspondiente en MongoDB
        const evaluacionMongo = await mongo.EvaluacionCliente.findOne({ 
            id_evaluacionSql: parseInt(id) 
        });

        // Combinar los datos de SQL y MongoDB
        const evaluacionCompleta = {
            ...evaluacion[0],
            detallesMongo: evaluacionMongo
        };

        // Establecer mensaje flash de éxito y enviar respuesta API
        res.flash('success', 'Evaluación obtenida exitosamente');
        return res.apiResponse(evaluacionCompleta, 200, 'Evaluación obtenida exitosamente');
    } catch (error) {
        // Capturar y registrar errores, establecer mensaje flash de error y enviar respuesta API de error
        console.error('Error al obtener evaluación:', error);
        res.flash('error', 'Error al obtener evaluación');
        return res.apiError('Error interno del servidor al obtener la evaluación', 500);
    }
};

// Crear nueva evaluación de cliente
evaluacionClienteCtl.crearEvaluacion = async (req, res) => {
    try {
        const { puntuacion, comentario, tipo_evaluacion, fecha_evaluacion, calificacion, ubicacion } = req.body;

        // Validar campos requeridos para la creación de la evaluación en SQL
        if (!puntuacion) {
            res.flash('error', 'Faltan campos requeridos para crear la evaluación SQL (puntuacion).');
            return res.apiError('Faltan campos requeridos para crear la evaluación SQL.', 400);
        }

        const currentTime = new Date().toLocaleString();

        // Crear la evaluación en SQL
        const datosSql = {
            puntuacion,
            stateEvaluacion: 'activa', // Estado por defecto
            createEvaluacion: currentTime, // Campo de fecha de creación en SQL
            updateEvaluacion: currentTime // Inicialmente igual a create
        };
        
        const nuevaEvaluacionSql = await orm.evaluacionCliente.create(datosSql);
        const idEvaluacion = nuevaEvaluacionSql.idEvaluacion; // Obtener el ID generado por SQL

        // Crear la evaluación en MongoDB, vinculándola con el ID de SQL
        const datosMongo = {
            id_evaluacionSql: idEvaluacion,
            comentario: comentario || '',
            tipo_evaluacion: tipo_evaluacion || '',
            fecha_evaluacion: fecha_evaluacion || currentTime, // Usar fecha_evaluacion del body o la actual
            calificacion: calificacion || '',
            ubicacion: ubicacion || ''
        };
        
        await mongo.EvaluacionCliente.create(datosMongo);

        // Establecer mensaje flash de éxito y enviar respuesta API
        res.flash('success', 'Evaluación creada exitosamente');
        return res.apiResponse(
            { idEvaluacion }, 
            201, 
            'Evaluación creada exitosamente'
        );
    } catch (error) {
        // Capturar y registrar errores, establecer mensaje flash de error y enviar respuesta API de error
        console.error('Error al crear evaluación:', error);
        res.flash('error', 'Error al crear la evaluación');
        return res.apiError('Error interno del servidor al crear la evaluación', 500);
    }
};

// Actualizar evaluación de cliente
evaluacionClienteCtl.actualizarEvaluacion = async (req, res) => {
    try {
        const { id } = req.params;
        const { puntuacion, comentario, tipo_evaluacion, fecha_evaluacion, calificacion, ubicacion } = req.body;

        // Verificar la existencia de la evaluación en SQL
        const [evaluacionExistenteSql] = await sql.promise().query(`
            SELECT * FROM evaluaciones_clientes WHERE idEvaluacion = ?
        `, [id]);

        if (evaluacionExistenteSql.length === 0) {
            res.flash('error', 'Evaluación no encontrada');
            return res.apiError('Evaluación no encontrada', 404);
        }

        const currentTime = new Date().toLocaleString();

        // Actualizar en SQL
        const datosActualizacionSql = {
            puntuacion: puntuacion !== undefined ? puntuacion : evaluacionExistenteSql[0].puntuacion,
            updateEvaluacion: currentTime // Campo de fecha de actualización en SQL
        };
        
        await orm.evaluacionCliente.update(datosActualizacionSql, {
            where: { idEvaluacion: id }
        });

        // Actualizar en MongoDB
        const datosMongoActualizacion = {};
        if (comentario !== undefined) datosMongoActualizacion.comentario = comentario;
        if (tipo_evaluacion !== undefined) datosMongoActualizacion.tipo_evaluacion = tipo_evaluacion;
        if (fecha_evaluacion !== undefined) datosMongoActualizacion.fecha_evaluacion = fecha_evaluacion;
        if (calificacion !== undefined) datosMongoActualizacion.calificacion = calificacion;
        if (ubicacion !== undefined) datosMongoActualizacion.ubicacion = ubicacion;

        await mongo.EvaluacionCliente.findOneAndUpdate(
            { id_evaluacionSql: parseInt(id) },
            datosMongoActualizacion,
            { new: true } // Para devolver el documento actualizado
        );

        // Establecer mensaje flash de éxito y enviar respuesta API
        res.flash('success', 'Evaluación actualizada exitosamente');
        return res.apiResponse(
            { idEvaluacion: id }, 
            200, 
            'Evaluación actualizada exitosamente'
        );
    } catch (error) {
        // Capturar y registrar errores, establecer mensaje flash de error y enviar respuesta API de error
        console.error('Error al actualizar evaluación:', error);
        res.flash('error', 'Error al actualizar la evaluación');
        return res.apiError('Error interno del servidor al actualizar la evaluación', 500);
    }
};

// Eliminar evaluación de cliente
evaluacionClienteCtl.eliminarEvaluacion = async (req, res) => {
    try {
        const { id } = req.params;

        // Verificar la existencia de la evaluación en SQL
        const [evaluacionExistenteSql] = await sql.promise().query(`
            SELECT * FROM evaluaciones_clientes WHERE idEvaluacion = ?
        `, [id]);

        if (evaluacionExistenteSql.length === 0) {
            res.flash('error', 'Evaluación no encontrada');
            return res.apiError('Evaluación no encontrada', 404);
        }

        // Eliminar en SQL
        await orm.evaluacionCliente.destroy({
            where: { idEvaluacion: id }
        });

        // Eliminar en MongoDB
        await mongo.EvaluacionCliente.findOneAndDelete({ id_evaluacionSql: parseInt(id) });

        // Establecer mensaje flash de éxito y enviar respuesta API
        res.flash('success', 'Evaluación eliminada exitosamente');
        return res.apiResponse(
            null, 
            200, 
            'Evaluación eliminada exitosamente'
        );
    } catch (error) {
        // Capturar y registrar errores, establecer mensaje flash de error y enviar respuesta API de error
        console.error('Error al eliminar evaluación:', error);
        res.flash('error', 'Error al eliminar la evaluación');
        return res.apiError('Error interno del servidor al eliminar la evaluación', 500);
    }
};

module.exports = evaluacionClienteCtl;
