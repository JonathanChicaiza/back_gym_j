const orm = require('../Database/dataBase.orm');
const sql = require('../Database/dataBase.sql');
const mongo = require('../Database/dataBaseMongose');

const reservaCtl = {};

// Obtener todas las reservas (añadido para completar el CRUD, aunque no esté en tus rutas explícitas)
reservaCtl.obtenerReservas = async (req, res) => {
    try {
        // Consultar todas las reservas desde la base de datos SQL
        const [listaReservas] = await sql.promise().query(`
            SELECT * FROM reservas
        `);

        // Para cada reserva SQL, buscar su contraparte en MongoDB
        const reservasCompletas = await Promise.all(
            listaReservas.map(async (reserva) => {
                // Asumiendo que idReserva en SQL se mapea a id_reservaSql en MongoDB
                const reservaMongo = await mongo.Reserva.findOne({ 
                    id_reservaSql: reserva.idReserva.toString() // Convertir a string para coincidir con el tipo en Mongo
                });
                return {
                    ...reserva,
                    detallesMongo: reservaMongo
                };
            })
        );

        // Establecer mensaje flash de éxito y enviar respuesta API
        res.flash('success', 'Reservas obtenidas exitosamente');
        return res.apiResponse(reservasCompletas, 200, 'Reservas obtenidas exitosamente');
    } catch (error) {
        // Capturar y registrar errores, establecer mensaje flash de error y enviar respuesta API de error
        console.error('Error al obtener reservas:', error);
        res.flash('error', 'Error al obtener reservas');
        return res.apiError('Error interno del servidor al obtener reservas', 500);
    }
};

// Obtener una reserva por ID
reservaCtl.mostrarReservaPorId = async (req, res) => {
    try {
        const { id } = req.params;

        // Consultar la reserva por ID desde la base de datos SQL
        const [reserva] = await sql.promise().query(`
            SELECT * FROM reservas WHERE idReserva = ?
        `, [id]);

        // Si no se encuentra la reserva en SQL, enviar error 404
        if (reserva.length === 0) {
            res.flash('error', 'Reserva no encontrada');
            return res.apiError('Reserva no encontrada', 404);
        }

        // Buscar la reserva correspondiente en MongoDB
        const reservaMongo = await mongo.Reserva.findOne({ 
            id_reservaSql: id.toString() // Asegurarse de que el ID sea string para la búsqueda en Mongo
        });

        // Combinar los datos de SQL y MongoDB
        const reservaCompleta = {
            ...reserva[0],
            detallesMongo: reservaMongo
        };

        // Establecer mensaje flash de éxito y enviar respuesta API
        res.flash('success', 'Reserva obtenida exitosamente');
        return res.apiResponse(reservaCompleta, 200, 'Reserva obtenida exitosamente');
    } catch (error) {
        // Capturar y registrar errores, establecer mensaje flash de error y enviar respuesta API de error
        console.error('Error al obtener reserva:', error);
        res.flash('error', 'Error al obtener reserva');
        return res.apiError('Error interno del servidor al obtener la reserva', 500);
    }
};

// Crear nueva reserva
reservaCtl.crearReserva = async (req, res) => {
    try {
        const { estado, fecha_reserva, tipo_reserva, descripcion, cantidad_personas } = req.body;

        // Validar campos requeridos para la creación de la reserva en SQL
        if (!estado) {
            res.flash('error', 'Falta el campo requerido para crear la reserva SQL (estado).');
            return res.apiError('Falta el campo requerido para crear la reserva SQL.', 400);
        }

        const currentTime = new Date().toLocaleString();

        // Crear la reserva en SQL
        const datosSql = {
            estado,
            stateReserva: 'activa', // Estado por defecto para la reserva
            createReserva: currentTime, // Campo de fecha de creación en SQL
            updateReserva: currentTime // Inicialmente igual a create
        };
        
        const nuevaReservaSql = await orm.reserva.create(datosSql);
        const idReserva = nuevaReservaSql.idReserva; // Obtener el ID generado por SQL

        // Crear la reserva en MongoDB, vinculándola con el ID de SQL
        const datosMongo = {
            id_reservaSql: idReserva.toString(), // Convertir a string para el ID de Mongo
            fecha_reserva: fecha_reserva || currentTime, // Usar fecha_reserva del body o la actual
            tipo_reserva: tipo_reserva || '',
            descripcion: descripcion || '',
            cantidad_personas: cantidad_personas || '1' // Por defecto 1 persona
        };
        
        await mongo.Reserva.create(datosMongo);

        // Establecer mensaje flash de éxito y enviar respuesta API
        res.flash('success', 'Reserva creada exitosamente');
        return res.apiResponse(
            { idReserva }, 
            201, 
            'Reserva creada exitosamente'
        );
    } catch (error) {
        // Capturar y registrar errores, establecer mensaje flash de error y enviar respuesta API de error
        console.error('Error al crear reserva:', error);
        res.flash('error', 'Error al crear la reserva');
        return res.apiError('Error interno del servidor al crear la reserva', 500);
    }
};

// Actualizar reserva
reservaCtl.actualizarReserva = async (req, res) => {
    try {
        const { id } = req.params;
        const { estado, stateReserva, fecha_reserva, tipo_reserva, descripcion, cantidad_personas } = req.body;

        // Verificar la existencia de la reserva en SQL
        const [reservaExistenteSql] = await sql.promise().query(`
            SELECT * FROM reservas WHERE idReserva = ?
        `, [id]);

        if (reservaExistenteSql.length === 0) {
            res.flash('error', 'Reserva no encontrada');
            return res.apiError('Reserva no encontrada', 404);
        }

        const currentTime = new Date().toLocaleString();

        // Actualizar en SQL
        const datosActualizacionSql = {
            estado: estado !== undefined ? estado : reservaExistenteSql[0].estado,
            stateReserva: stateReserva !== undefined ? stateReserva : reservaExistenteSql[0].stateReserva,
            updateReserva: currentTime // Campo de fecha de actualización en SQL
        };
        
        await orm.reserva.update(datosActualizacionSql, {
            where: { idReserva: id }
        });

        // Actualizar en MongoDB
        const datosMongoActualizacion = {};
        if (fecha_reserva !== undefined) datosMongoActualizacion.fecha_reserva = fecha_reserva;
        if (tipo_reserva !== undefined) datosMongoActualizacion.tipo_reserva = tipo_reserva;
        if (descripcion !== undefined) datosMongoActualizacion.descripcion = descripcion;
        if (cantidad_personas !== undefined) datosMongoActualizacion.cantidad_personas = cantidad_personas;

        await mongo.Reserva.findOneAndUpdate(
            { id_reservaSql: id.toString() }, // Asegurarse de que el ID sea string para la búsqueda en Mongo
            datosMongoActualizacion,
            { new: true } // Para devolver el documento actualizado
        );

        // Establecer mensaje flash de éxito y enviar respuesta API
        res.flash('success', 'Reserva actualizada exitosamente');
        return res.apiResponse(
            { idReserva: id }, 
            200, 
            'Reserva actualizada exitosamente'
        );
    } catch (error) {
        // Capturar y registrar errores, establecer mensaje flash de error y enviar respuesta API de error
        console.error('Error al actualizar reserva:', error);
        res.flash('error', 'Error al actualizar la reserva');
        return res.apiError('Error interno del servidor al actualizar la reserva', 500);
    }
};

// Eliminar reserva
reservaCtl.eliminarReserva = async (req, res) => {
    try {
        const { id } = req.params;

        // Verificar la existencia de la reserva en SQL
        const [reservaExistenteSql] = await sql.promise().query(`
            SELECT * FROM reservas WHERE idReserva = ?
        `, [id]);

        if (reservaExistenteSql.length === 0) {
            res.flash('error', 'Reserva no encontrada');
            return res.apiError('Reserva no encontrada', 404);
        }

        // Eliminar en SQL
        await orm.reserva.destroy({
            where: { idReserva: id }
        });

        // Eliminar en MongoDB
        await mongo.Reserva.findOneAndDelete({ id_reservaSql: id.toString() }); // Asegurarse de que el ID sea string para la búsqueda en Mongo

        // Establecer mensaje flash de éxito y enviar respuesta API
        res.flash('success', 'Reserva eliminada exitosamente');
        return res.apiResponse(
            null, 
            200, 
            'Reserva eliminada exitosamente'
        );
    } catch (error) {
        // Capturar y registrar errores, establecer mensaje flash de error y enviar respuesta API de error
        console.error('Error al eliminar reserva:', error);
        res.flash('error', 'Error al eliminar la reserva');
        return res.apiError('Error interno del servidor al eliminar la reserva', 500);
    }
};

module.exports = reservaCtl;
