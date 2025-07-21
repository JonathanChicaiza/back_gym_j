const orm = require('../Database/dataBase.orm');
const sql = require('../Database/dataBase.sql');
const mongo = require('../Database/dataBaseMongose');

const notificacionCtl = {};

// Obtener todas las notificaciones
notificacionCtl.obtenerNotificaciones = async (req, res) => {
    try {
        // Consultar todas las notificaciones desde la base de datos SQL
        const [listaNotificaciones] = await sql.promise().query(`
            SELECT * FROM notificaciones
        `);

        // Para cada notificación SQL, buscar su contraparte en MongoDB
        const notificacionesCompletas = await Promise.all(
            listaNotificaciones.map(async (notificacion) => {
                // Asumiendo que idNotificacion en SQL se mapea a id_notificacionSql en MongoDB
                const notificacionMongo = await mongo.Notificacion.findOne({ 
                    id_notificacionSql: notificacion.idNotificacion 
                });
                return {
                    ...notificacion,
                    detallesMongo: notificacionMongo
                };
            })
        );

        // Establecer mensaje flash de éxito y enviar respuesta API
        res.flash('success', 'Notificaciones obtenidas exitosamente');
        return res.apiResponse(notificacionesCompletas, 200, 'Notificaciones obtenidas exitosamente');
    } catch (error) {
        // Capturar y registrar errores, establecer mensaje flash de error y enviar respuesta API de error
        console.error('Error al obtener notificaciones:', error);
        res.flash('error', 'Error al obtener notificaciones');
        return res.apiError('Error interno del servidor al obtener notificaciones', 500);
    }
};

// Obtener una notificación por ID
notificacionCtl.obtenerNotificacion = async (req, res) => {
    try {
        const { id } = req.params;

        // Consultar la notificación por ID desde la base de datos SQL
        const [notificacion] = await sql.promise().query(`
            SELECT * FROM notificaciones WHERE idNotificacion = ?
        `, [id]);

        // Si no se encuentra la notificación en SQL, enviar error 404
        if (notificacion.length === 0) {
            res.flash('error', 'Notificación no encontrada');
            return res.apiError('Notificación no encontrada', 404);
        }

        // Buscar la notificación correspondiente en MongoDB
        const notificacionMongo = await mongo.Notificacion.findOne({ 
            id_notificacionSql: parseInt(id) 
        });

        // Combinar los datos de SQL y MongoDB
        const notificacionCompleta = {
            ...notificacion[0],
            detallesMongo: notificacionMongo
        };

        // Establecer mensaje flash de éxito y enviar respuesta API
        res.flash('success', 'Notificación obtenida exitosamente');
        return res.apiResponse(notificacionCompleta, 200, 'Notificación obtenida exitosamente');
    } catch (error) {
        // Capturar y registrar errores, establecer mensaje flash de error y enviar respuesta API de error
        console.error('Error al obtener notificación:', error);
        res.flash('error', 'Error al obtener notificación');
        return res.apiError('Error interno del servidor al obtener la notificación', 500);
    }
};

// Crear nueva notificación (se incluye aunque no esté en las rutas proporcionadas, es común en CRUD)
notificacionCtl.crearNotificacion = async (req, res) => {
    try {
        const { mensaje, fecha_envio, leido, prioridad, canal_envio, fecha_lectura } = req.body;

        // Validar campos requeridos para la creación de la notificación en SQL
        if (!mensaje) {
            res.flash('error', 'Falta el campo requerido para crear la notificación SQL (mensaje).');
            return res.apiError('Falta el campo requerido para crear la notificación SQL.', 400);
        }

        const currentTime = new Date().toLocaleString();

        // Crear la notificación en SQL
        const datosSql = {
            mensaje,
            stateNotificacion: 'pendiente', // Estado por defecto
            createNotificacion: currentTime, // Campo de fecha de creación en SQL
            updateNotificacion: currentTime // Inicialmente igual a create
        };
        
        const nuevaNotificacionSql = await orm.notificacion.create(datosSql);
        const idNotificacion = nuevaNotificacionSql.idNotificacion; // Obtener el ID generado por SQL

        // Crear la notificación en MongoDB, vinculándola con el ID de SQL
        const datosMongo = {
            id_notificacionSql: idNotificacion,
            fecha_envio: fecha_envio || currentTime, // Usar fecha_envio del body o la actual
            leido: leido || 'false', // Por defecto no leída
            prioridad: prioridad || 'normal',
            canal_envio: canal_envio || '',
            fecha_lectura: fecha_lectura || ''
        };
        
        await mongo.Notificacion.create(datosMongo);

        // Establecer mensaje flash de éxito y enviar respuesta API
        res.flash('success', 'Notificación creada exitosamente');
        return res.apiResponse(
            { idNotificacion }, 
            201, 
            'Notificación creada exitosamente'
        );
    } catch (error) {
        // Capturar y registrar errores, establecer mensaje flash de error y enviar respuesta API de error
        console.error('Error al crear notificación:', error);
        res.flash('error', 'Error al crear la notificación');
        return res.apiError('Error interno del servidor al crear la notificación', 500);
    }
};

// Actualizar notificación
notificacionCtl.actualizarNotificacion = async (req, res) => {
    try {
        const { id } = req.params;
        const { mensaje, stateNotificacion, fecha_envio, leido, prioridad, canal_envio, fecha_lectura } = req.body;

        // Verificar la existencia de la notificación en SQL
        const [notificacionExistenteSql] = await sql.promise().query(`
            SELECT * FROM notificaciones WHERE idNotificacion = ?
        `, [id]);

        if (notificacionExistenteSql.length === 0) {
            res.flash('error', 'Notificación no encontrada');
            return res.apiError('Notificación no encontrada', 404);
        }

        const currentTime = new Date().toLocaleString();

        // Actualizar en SQL
        const datosActualizacionSql = {
            mensaje: mensaje !== undefined ? mensaje : notificacionExistenteSql[0].mensaje,
            stateNotificacion: stateNotificacion !== undefined ? stateNotificacion : notificacionExistenteSql[0].stateNotificacion,
            updateNotificacion: currentTime // Campo de fecha de actualización en SQL
        };
        
        await orm.notificacion.update(datosActualizacionSql, {
            where: { idNotificacion: id }
        });

        // Actualizar en MongoDB
        const datosMongoActualizacion = {};
        if (fecha_envio !== undefined) datosMongoActualizacion.fecha_envio = fecha_envio;
        if (leido !== undefined) datosMongoActualizacion.leido = leido;
        if (prioridad !== undefined) datosMongoActualizacion.prioridad = prioridad;
        if (canal_envio !== undefined) datosMongoActualizacion.canal_envio = canal_envio;
        if (fecha_lectura !== undefined) datosMongoActualizacion.fecha_lectura = fecha_lectura;

        await mongo.Notificacion.findOneAndUpdate(
            { id_notificacionSql: parseInt(id) },
            datosMongoActualizacion,
            { new: true } // Para devolver el documento actualizado
        );

        // Establecer mensaje flash de éxito y enviar respuesta API
        res.flash('success', 'Notificación actualizada exitosamente');
        return res.apiResponse(
            { idNotificacion: id }, 
            200, 
            'Notificación actualizada exitosamente'
        );
    } catch (error) {
        // Capturar y registrar errores, establecer mensaje flash de error y enviar respuesta API de error
        console.error('Error al actualizar notificación:', error);
        res.flash('error', 'Error al actualizar la notificación');
        return res.apiError('Error interno del servidor al actualizar la notificación', 500);
    }
};

// Eliminar notificación
notificacionCtl.eliminarNotificacion = async (req, res) => {
    try {
        const { id } = req.params;

        // Verificar la existencia de la notificación en SQL
        const [notificacionExistenteSql] = await sql.promise().query(`
            SELECT * FROM notificaciones WHERE idNotificacion = ?
        `, [id]);

        if (notificacionExistenteSql.length === 0) {
            res.flash('error', 'Notificación no encontrada');
            return res.apiError('Notificación no encontrada', 404);
        }

        // Eliminar en SQL
        await orm.notificacion.destroy({
            where: { idNotificacion: id }
        });

        // Eliminar en MongoDB
        await mongo.Notificacion.findOneAndDelete({ id_notificacionSql: parseInt(id) });

        // Establecer mensaje flash de éxito y enviar respuesta API
        res.flash('success', 'Notificación eliminada exitosamente');
        return res.apiResponse(
            null, 
            200, 
            'Notificación eliminada exitosamente'
        );
    } catch (error) {
        // Capturar y registrar errores, establecer mensaje flash de error y enviar respuesta API de error
        console.error('Error al eliminar notificación:', error);
        res.flash('error', 'Error al eliminar la notificación');
        return res.apiError('Error interno del servidor al eliminar la notificación', 500);
    }
};

module.exports = notificacionCtl;
