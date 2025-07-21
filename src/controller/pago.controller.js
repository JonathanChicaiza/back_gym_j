const orm = require('../Database/dataBase.orm');
const sql = require('../Database/dataBase.sql');
const mongo = require('../Database/dataBaseMongose');

const pagoCtl = {};

// Obtener todos los pagos
pagoCtl.obtenerPagos = async (req, res) => {
    try {
        // Consultar todos los pagos desde la base de datos SQL
        const [listaPagos] = await sql.promise().query(`
            SELECT * FROM pagos
        `);

        // Para cada pago SQL, buscar su contraparte en MongoDB
        const pagosCompletos = await Promise.all(
            listaPagos.map(async (pago) => {
                // Asumiendo que idPago en SQL se mapea a id_pagoSql en MongoDB
                const pagoMongo = await mongo.Pago.findOne({ 
                    id_pagoSql: pago.idPago 
                });
                return {
                    ...pago,
                    detallesMongo: pagoMongo
                };
            })
        );

        // Establecer mensaje flash de éxito y enviar respuesta API
        res.flash('success', 'Pagos obtenidos exitosamente');
        return res.apiResponse(pagosCompletos, 200, 'Pagos obtenidos exitosamente');
    } catch (error) {
        // Capturar y registrar errores, establecer mensaje flash de error y enviar respuesta API de error
        console.error('Error al obtener pagos:', error);
        res.flash('error', 'Error al obtener pagos');
        return res.apiError('Error interno del servidor al obtener pagos', 500);
    }
};

// Obtener un pago por ID
pagoCtl.obtenerPago = async (req, res) => {
    try {
        const { id } = req.params;

        // Consultar el pago por ID desde la base de datos SQL
        const [pago] = await sql.promise().query(`
            SELECT * FROM pagos WHERE idPago = ?
        `, [id]);

        // Si no se encuentra el pago en SQL, enviar error 404
        if (pago.length === 0) {
            res.flash('error', 'Pago no encontrado');
            return res.apiError('Pago no encontrado', 404);
        }

        // Buscar el pago correspondiente en MongoDB
        const pagoMongo = await mongo.Pago.findOne({ 
            id_pagoSql: parseInt(id) 
        });

        // Combinar los datos de SQL y MongoDB
        const pagoCompleto = {
            ...pago[0],
            detallesMongo: pagoMongo
        };

        // Establecer mensaje flash de éxito y enviar respuesta API
        res.flash('success', 'Pago obtenido exitosamente');
        return res.apiResponse(pagoCompleto, 200, 'Pago obtenido exitosamente');
    } catch (error) {
        // Capturar y registrar errores, establecer mensaje flash de error y enviar respuesta API de error
        console.error('Error al obtener pago:', error);
        res.flash('error', 'Error al obtener pago');
        return res.apiError('Error interno del servidor al obtener el pago', 500);
    }
};

// Crear nuevo pago
pagoCtl.crearPago = async (req, res) => {
    try {
        const { monto, fechaPago, metodoPago, concepto, fecha_vencimiento, intento_pago } = req.body;

        // Validar campos requeridos para la creación del pago en SQL
        if (!monto || !fechaPago || !metodoPago) {
            res.flash('error', 'Faltan campos requeridos para crear el pago SQL (monto, fechaPago, metodoPago).');
            return res.apiError('Faltan campos requeridos para crear el pago SQL.', 400);
        }

        const currentTime = new Date().toLocaleString();

        // Crear el pago en SQL
        const datosSql = {
            monto,
            fechaPago,
            metodoPago,
            statePago: 'pendiente', // Estado por defecto
            createPago: currentTime, // Campo de fecha de creación en SQL
            updatePago: currentTime // Inicialmente igual a create
        };
        
        const nuevoPagoSql = await orm.pago.create(datosSql);
        const idPago = nuevoPagoSql.idPago; // Obtener el ID generado por SQL

        // Crear el pago en MongoDB, vinculándolo con el ID de SQL
        const datosMongo = {
            id_pagoSql: idPago,
            concepto: concepto || '',
            fecha_vencimiento: fecha_vencimiento || '',
            intento_pago: intento_pago || '1' // Por defecto, primer intento
        };
        
        await mongo.Pago.create(datosMongo);

        // Establecer mensaje flash de éxito y enviar respuesta API
        res.flash('success', 'Pago creado exitosamente');
        return res.apiResponse(
            { idPago }, 
            201, 
            'Pago creado exitosamente'
        );
    } catch (error) {
        // Capturar y registrar errores, establecer mensaje flash de error y enviar respuesta API de error
        console.error('Error al crear pago:', error);
        res.flash('error', 'Error al crear el pago');
        return res.apiError('Error interno del servidor al crear el pago', 500);
    }
};

// Actualizar pago
pagoCtl.actualizarPago = async (req, res) => {
    try {
        const { id } = req.params;
        const { monto, fechaPago, metodoPago, statePago, concepto, fecha_vencimiento, intento_pago } = req.body;

        // Verificar la existencia del pago en SQL
        const [pagoExistenteSql] = await sql.promise().query(`
            SELECT * FROM pagos WHERE idPago = ?
        `, [id]);

        if (pagoExistenteSql.length === 0) {
            res.flash('error', 'Pago no encontrado');
            return res.apiError('Pago no encontrado', 404);
        }

        const currentTime = new Date().toLocaleString();

        // Actualizar en SQL
        const datosActualizacionSql = {
            monto: monto !== undefined ? monto : pagoExistenteSql[0].monto,
            fechaPago: fechaPago !== undefined ? fechaPago : pagoExistenteSql[0].fechaPago,
            metodoPago: metodoPago !== undefined ? metodoPago : pagoExistenteSql[0].metodoPago,
            statePago: statePago !== undefined ? statePago : pagoExistenteSql[0].statePago,
            updatePago: currentTime // Campo de fecha de actualización en SQL
        };
        
        await orm.pago.update(datosActualizacionSql, {
            where: { idPago: id }
        });

        // Actualizar en MongoDB
        const datosMongoActualizacion = {};
        if (concepto !== undefined) datosMongoActualizacion.concepto = concepto;
        if (fecha_vencimiento !== undefined) datosMongoActualizacion.fecha_vencimiento = fecha_vencimiento;
        if (intento_pago !== undefined) datosMongoActualizacion.intento_pago = intento_pago;

        await mongo.Pago.findOneAndUpdate(
            { id_pagoSql: parseInt(id) },
            datosMongoActualizacion,
            { new: true } // Para devolver el documento actualizado
        );

        // Establecer mensaje flash de éxito y enviar respuesta API
        res.flash('success', 'Pago actualizado exitosamente');
        return res.apiResponse(
            { idPago: id }, 
            200, 
            'Pago actualizado exitosamente'
        );
    } catch (error) {
        // Capturar y registrar errores, establecer mensaje flash de error y enviar respuesta API de error
        console.error('Error al actualizar pago:', error);
        res.flash('error', 'Error al actualizar el pago');
        return res.apiError('Error interno del servidor al actualizar el pago', 500);
    }
};

// Eliminar pago
pagoCtl.eliminarPago = async (req, res) => {
    try {
        const { id } = req.params;

        // Verificar la existencia del pago en SQL
        const [pagoExistenteSql] = await sql.promise().query(`
            SELECT * FROM pagos WHERE idPago = ?
        `, [id]);

        if (pagoExistenteSql.length === 0) {
            res.flash('error', 'Pago no encontrado');
            return res.apiError('Pago no encontrado', 404);
        }

        // Eliminar en SQL
        await orm.pago.destroy({
            where: { idPago: id }
        });

        // Eliminar en MongoDB
        await mongo.Pago.findOneAndDelete({ id_pagoSql: parseInt(id) });

        // Establecer mensaje flash de éxito y enviar respuesta API
        res.flash('success', 'Pago eliminado exitosamente');
        return res.apiResponse(
            null, 
            200, 
            'Pago eliminado exitosamente'
        );
    } catch (error) {
        // Capturar y registrar errores, establecer mensaje flash de error y enviar respuesta API de error
        console.error('Error al eliminar pago:', error);
        res.flash('error', 'Error al eliminar el pago');
        return res.apiError('Error interno del servidor al eliminar el pago', 500);
    }
};

module.exports = pagoCtl;
