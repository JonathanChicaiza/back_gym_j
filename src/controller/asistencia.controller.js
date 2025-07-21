const orm = require('../Database/dataBase.orm');
const sql = require('../Database/dataBase.sql');
const mongo = require('../Database/dataBaseMongose');

const asistenciaCtl = {};

// Obtener todas las asistencias
asistenciaCtl.obtenerAsistencias = async (req, res) => {
    try {
        // Consultar todas las asistencias desde la base de datos SQL
        const [listaAsistencias] = await sql.promise().query(`
            SELECT * FROM asistencias
        `);

        // Para cada asistencia SQL, buscar su contraparte en MongoDB
        const asistenciasCompletas = await Promise.all(
            listaAsistencias.map(async (asistencia) => {
                // Asumiendo que idAsistencia en SQL se mapea a id_asistenciaSql en MongoDB
                const asistenciaMongo = await mongo.Asistencia.findOne({ 
                    id_asistenciaSql: asistencia.idAsistencia 
                });
                return {
                    ...asistencia,
                    detallesMongo: asistenciaMongo
                };
            })
        );

        // Establecer mensaje flash de éxito y enviar respuesta API
        res.flash('success', 'Asistencias obtenidas exitosamente');
        return res.apiResponse(asistenciasCompletas, 200, 'Asistencias obtenidas exitosamente');
    } catch (error) {
        // Capturar y registrar errores, establecer mensaje flash de error y enviar respuesta API de error
        console.error('Error al obtener asistencias:', error);
        res.flash('error', 'Error al obtener asistencias');
        return res.apiError('Error interno del servidor al obtener asistencias', 500);
    }
};

// Obtener una asistencia por ID
asistenciaCtl.obtenerAsistencia = async (req, res) => {
    try {
        const { id } = req.params;

        // Consultar la asistencia por ID desde la base de datos SQL
        const [asistencia] = await sql.promise().query(`
            SELECT * FROM asistencias WHERE idAsistencia = ?
        `, [id]);

        // Si no se encuentra la asistencia en SQL, enviar error 404
        if (asistencia.length === 0) {
            res.flash('error', 'Asistencia no encontrada');
            return res.apiError('Asistencia no encontrada', 404);
        }

        // Buscar la asistencia correspondiente en MongoDB
        const asistenciaMongo = await mongo.Asistencia.findOne({ 
            id_asistenciaSql: parseInt(id) 
        });

        // Combinar los datos de SQL y MongoDB
        const asistenciaCompleta = {
            ...asistencia[0],
            detallesMongo: asistenciaMongo
        };

        // Establecer mensaje flash de éxito y enviar respuesta API
        res.flash('success', 'Asistencia obtenida exitosamente');
        return res.apiResponse(asistenciaCompleta, 200, 'Asistencia obtenida exitosamente');
    } catch (error) {
        // Capturar y registrar errores, establecer mensaje flash de error y enviar respuesta API de error
        console.error('Error al obtener asistencia:', error);
        res.flash('error', 'Error al obtener asistencia');
        return res.apiError('Error interno del servidor al obtener la asistencia', 500);
    }
};

// Crear nueva asistencia
asistenciaCtl.crearAsistencia = async (req, res) => {
    try {
        const { fecha_asistencia, ubicacion, dispositivo, observaciones } = req.body;

        // Validar campos requeridos para la creación de la asistencia
        if (!fecha_asistencia || !ubicacion || !dispositivo) {
            res.flash('error', 'Faltan campos requeridos para crear la asistencia.');
            return res.apiError('Faltan campos requeridos para crear la asistencia.', 400);
        }

        // Crear la asistencia en SQL. Asumiendo que el modelo ORM tiene un método 'create'
        // y que la tabla SQL de asistencias tiene un campo 'createAsistencia'.
        const datosSql = {
            createAsistencia: new Date().toLocaleString() // Campo de fecha de creación en SQL
            // Otros campos SQL si existen, por ejemplo, un id de usuario, etc.
            // Para este ejemplo, solo se crea una entrada básica en SQL para obtener un ID.
        };
        
        const nuevaAsistenciaSql = await orm.asistencia.create(datosSql);
        const idAsistencia = nuevaAsistenciaSql.idAsistencia; // Obtener el ID generado por SQL

        // Crear la asistencia en MongoDB, vinculándola con el ID de SQL
        const datosMongo = {
            id_asistenciaSql: idAsistencia,
            fecha_asistencia: fecha_asistencia,
            ubicacion: ubicacion,
            dispositivo: dispositivo,
            observaciones: observaciones || '' // Observaciones pueden ser opcionales
        };
        
        await mongo.Asistencia.create(datosMongo);

        // Establecer mensaje flash de éxito y enviar respuesta API
        res.flash('success', 'Asistencia creada exitosamente');
        return res.apiResponse(
            { idAsistencia }, 
            201, 
            'Asistencia creada exitosamente'
        );
    } catch (error) {
        // Capturar y registrar errores, establecer mensaje flash de error y enviar respuesta API de error
        console.error('Error al crear asistencia:', error);
        res.flash('error', 'Error al crear la asistencia');
        return res.apiError('Error interno del servidor al crear la asistencia', 500);
    }
};

// Actualizar asistencia
asistenciaCtl.actualizarAsistencia = async (req, res) => {
    try {
        const { id } = req.params;
        const { fecha_asistencia, ubicacion, dispositivo, observaciones } = req.body;

        // Verificar la existencia de la asistencia en SQL
        const [asistenciaExistenteSql] = await sql.promise().query(`
            SELECT * FROM asistencias WHERE idAsistencia = ?
        `, [id]);

        if (asistenciaExistenteSql.length === 0) {
            res.flash('error', 'Asistencia no encontrada');
            return res.apiError('Asistencia no encontrada', 404);
        }

        // Actualizar en SQL (solo el campo de actualización, si se asume que otros datos están en Mongo)
        const datosActualizacionSql = {
            updateAsistencia: new Date().toLocaleString() // Campo de fecha de actualización en SQL
        };
        
        await orm.asistencia.update(datosActualizacionSql, {
            where: { idAsistencia: id }
        });

        // Actualizar en MongoDB
        const datosMongoActualizacion = {};
        if (fecha_asistencia !== undefined) datosMongoActualizacion.fecha_asistencia = fecha_asistencia;
        if (ubicacion !== undefined) datosMongoActualizacion.ubicacion = ubicacion;
        if (dispositivo !== undefined) datosMongoActualizacion.dispositivo = dispositivo;
        if (observaciones !== undefined) datosMongoActualizacion.observaciones = observaciones;

        await mongo.Asistencia.findOneAndUpdate(
            { id_asistenciaSql: parseInt(id) },
            datosMongoActualizacion,
            { new: true } // Para devolver el documento actualizado
        );

        // Establecer mensaje flash de éxito y enviar respuesta API
        res.flash('success', 'Asistencia actualizada exitosamente');
        return res.apiResponse(
            { idAsistencia: id }, 
            200, 
            'Asistencia actualizada exitosamente'
        );
    } catch (error) {
        // Capturar y registrar errores, establecer mensaje flash de error y enviar respuesta API de error
        console.error('Error al actualizar asistencia:', error);
        res.flash('error', 'Error al actualizar la asistencia');
        return res.apiError('Error interno del servidor al actualizar la asistencia', 500);
    }
};

// Eliminar asistencia
asistenciaCtl.eliminarAsistencia = async (req, res) => {
    try {
        const { id } = req.params;

        // Verificar la existencia de la asistencia en SQL
        const [asistenciaExistenteSql] = await sql.promise().query(`
            SELECT * FROM asistencias WHERE idAsistencia = ?
        `, [id]);

        if (asistenciaExistenteSql.length === 0) {
            res.flash('error', 'Asistencia no encontrada');
            return res.apiError('Asistencia no encontrada', 404);
        }

        // Eliminar en SQL
        await orm.asistencia.destroy({
            where: { idAsistencia: id }
        });

        // Eliminar en MongoDB
        await mongo.Asistencia.findOneAndDelete({ id_asistenciaSql: parseInt(id) });

        // Establecer mensaje flash de éxito y enviar respuesta API
        res.flash('success', 'Asistencia eliminada exitosamente');
        return res.apiResponse(
            null, 
            200, 
            'Asistencia eliminada exitosamente'
        );
    } catch (error) {
        // Capturar y registrar errores, establecer mensaje flash de error y enviar respuesta API de error
        console.error('Error al eliminar asistencia:', error);
        res.flash('error', 'Error al eliminar la asistencia');
        return res.apiError('Error interno del servidor al eliminar la asistencia', 500);
    }
};

module.exports = asistenciaCtl;