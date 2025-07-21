const orm = require('../Database/dataBase.orm');
const sql = require('../Database/dataBase.sql');
const mongo = require('../Database/dataBaseMongose');

const historialPagoCtl = {};

// Obtener todos los historiales de pago
historialPagoCtl.obtenerHistorialPagos = async (req, res) => {
    try {
        // Consultar todos los historiales de pago desde la base de datos SQL
        const [listaHistoriales] = await sql.promise().query(`
            SELECT * FROM historial_pagos
        `);

        // Para cada historial SQL, buscar su contraparte en MongoDB
        const historialesCompletos = await Promise.all(
            listaHistoriales.map(async (historial) => {
                // Asumiendo que idHistorial en SQL se mapea a id_historialSql en MongoDB
                const historialMongo = await mongo.HistorialPago.findOne({ 
                    id_historialSql: historial.idHistorial 
                });
                return {
                    ...historial,
                    detallesMongo: historialMongo
                };
            })
        );

        // Establecer mensaje flash de éxito y enviar respuesta API
        res.flash('success', 'Historiales de pago obtenidos exitosamente');
        return res.apiResponse(historialesCompletos, 200, 'Historiales de pago obtenidos exitosamente');
    } catch (error) {
        // Capturar y registrar errores, establecer mensaje flash de error y enviar respuesta API de error
        console.error('Error al obtener historiales de pago:', error);
        res.flash('error', 'Error al obtener historiales de pago');
        return res.apiError('Error interno del servidor al obtener historiales de pago', 500);
    }
};

// Obtener un historial de pago por ID
historialPagoCtl.obtenerHistorialPago = async (req, res) => {
    try {
        const { id } = req.params;

        // Consultar el historial de pago por ID desde la base de datos SQL
        const [historial] = await sql.promise().query(`
            SELECT * FROM historial_pagos WHERE idHistorial = ?
        `, [id]);

        // Si no se encuentra el historial en SQL, enviar error 404
        if (historial.length === 0) {
            res.flash('error', 'Historial de pago no encontrado');
            return res.apiError('Historial de pago no encontrado', 404);
        }

        // Buscar el historial correspondiente en MongoDB
        const historialMongo = await mongo.HistorialPago.findOne({ 
            id_historialSql: parseInt(id) 
        });

        // Combinar los datos de SQL y MongoDB
        const historialCompleto = {
            ...historial[0],
            detallesMongo: historialMongo
        };

        // Establecer mensaje flash de éxito y enviar respuesta API
        res.flash('success', 'Historial de pago obtenido exitosamente');
        return res.apiResponse(historialCompleto, 200, 'Historial de pago obtenido exitosamente');
    } catch (error) {
        // Capturar y registrar errores, establecer mensaje flash de error y enviar respuesta API de error
        console.error('Error al obtener historial de pago:', error);
        res.flash('error', 'Error al obtener historial de pago');
        return res.apiError('Error interno del servidor al obtener el historial de pago', 500);
    }
};

// Crear nuevo historial de pago
historialPagoCtl.crearHistorialPago = async (req, res) => {
    try {
        const { fechaRegistro, observaciones, fecha_pago, ubicacion } = req.body;

        // Validar campos requeridos para la creación del historial en SQL
        if (!fechaRegistro) {
            res.flash('error', 'Falta el campo requerido para crear el historial de pago SQL (fechaRegistro).');
            return res.apiError('Falta el campo requerido para crear el historial de pago SQL.', 400);
        }

        const currentTime = new Date().toLocaleString();

        // Crear el historial en SQL
        const datosSql = {
            fechaRegistro: fechaRegistro,
            stateHistorial: 'activo', // Estado por defecto
            createHistorial: currentTime, // Campo de fecha de creación en SQL
            updateHistorial: currentTime // Inicialmente igual a create
        };
        
        const nuevoHistorialSql = await orm.historialpago.create(datosSql);
        const idHistorial = nuevoHistorialSql.idHistorial; // Obtener el ID generado por SQL

        // Crear el historial en MongoDB, vinculándolo con el ID de SQL
        const datosMongo = {
            id_historialSql: idHistorial,
            observaciones: observaciones || '',
            fecha_pago: fecha_pago || currentTime, // Usar fecha_pago del body o la actual
            ubicacion: ubicacion || ''
        };
        
        await mongo.HistorialPago.create(datosMongo);

        // Establecer mensaje flash de éxito y enviar respuesta API
        res.flash('success', 'Historial de pago creado exitosamente');
        return res.apiResponse(
            { idHistorial }, 
            201, 
            'Historial de pago creado exitosamente'
        );
    } catch (error) {
        // Capturar y registrar errores, establecer mensaje flash de error y enviar respuesta API de error
        console.error('Error al crear historial de pago:', error);
        res.flash('error', 'Error al crear el historial de pago');
        return res.apiError('Error interno del servidor al crear el historial de pago', 500);
    }
};

// Actualizar historial de pago
historialPagoCtl.actualizarHistorialPago = async (req, res) => {
    try {
        const { id } = req.params;
        const { fechaRegistro, stateHistorial, observaciones, fecha_pago, ubicacion } = req.body;

        // Verificar la existencia del historial en SQL
        const [historialExistenteSql] = await sql.promise().query(`
            SELECT * FROM historial_pagos WHERE idHistorial = ?
        `, [id]);

        if (historialExistenteSql.length === 0) {
            res.flash('error', 'Historial de pago no encontrado');
            return res.apiError('Historial de pago no encontrado', 404);
        }

        const currentTime = new Date().toLocaleString();

        // Actualizar en SQL
        const datosActualizacionSql = {
            fechaRegistro: fechaRegistro !== undefined ? fechaRegistro : historialExistenteSql[0].fechaRegistro,
            stateHistorial: stateHistorial !== undefined ? stateHistorial : historialExistenteSql[0].stateHistorial,
            updateHistorial: currentTime // Campo de fecha de actualización en SQL
        };
        
        await orm.historialpago.update(datosActualizacionSql, {
            where: { idHistorial: id }
        });

        // Actualizar en MongoDB
        const datosMongoActualizacion = {};
        if (observaciones !== undefined) datosMongoActualizacion.observaciones = observaciones;
        if (fecha_pago !== undefined) datosMongoActualizacion.fecha_pago = fecha_pago;
        if (ubicacion !== undefined) datosMongoActualizacion.ubicacion = ubicacion;

        await mongo.HistorialPago.findOneAndUpdate(
            { id_historialSql: parseInt(id) },
            datosMongoActualizacion,
            { new: true } // Para devolver el documento actualizado
        );

        // Establecer mensaje flash de éxito y enviar respuesta API
        res.flash('success', 'Historial de pago actualizado exitosamente');
        return res.apiResponse(
            { idHistorial: id }, 
            200, 
            'Historial de pago actualizado exitosamente'
        );
    } catch (error) {
        // Capturar y registrar errores, establecer mensaje flash de error y enviar respuesta API de error
        console.error('Error al actualizar historial de pago:', error);
        res.flash('error', 'Error al actualizar el historial de pago');
        return res.apiError('Error interno del servidor al actualizar el historial de pago', 500);
    }
};

// Eliminar historial de pago
historialPagoCtl.eliminarHistorialPago = async (req, res) => {
    try {
        const { id } = req.params;

        // Verificar la existencia del historial en SQL
        const [historialExistenteSql] = await sql.promise().query(`
            SELECT * FROM historial_pagos WHERE idHistorial = ?
        `, [id]);

        if (historialExistenteSql.length === 0) {
            res.flash('error', 'Historial de pago no encontrado');
            return res.apiError('Historial de pago no encontrado', 404);
        }

        // Eliminar en SQL
        await orm.historialpago.destroy({
            where: { idHistorial: id }
        });

        // Eliminar en MongoDB
        await mongo.HistorialPago.findOneAndDelete({ id_historialSql: parseInt(id) });

        // Establecer mensaje flash de éxito y enviar respuesta API
        res.flash('success', 'Historial de pago eliminado exitosamente');
        return res.apiResponse(
            null, 
            200, 
            'Historial de pago eliminado exitosamente'
        );
    } catch (error) {
        // Capturar y registrar errores, establecer mensaje flash de error y enviar respuesta API de error
        console.error('Error al eliminar historial de pago:', error);
        res.flash('error', 'Error al eliminar el historial de pago');
        return res.apiError('Error interno del servidor al eliminar el historial de pago', 500);
    }
};

module.exports = historialPagoCtl;
