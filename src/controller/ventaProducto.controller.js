const orm = require('../Database/dataBase.orm');
const sql = require('../Database/dataBase.sql');
const mongo = require('../Database/dataBaseMongose'); // Asegúrate de que este archivo exporta 'Venta'

const ventaProductoCtl = {};

// Obtener todas las ventas de productos
ventaProductoCtl.obtenerVentas = async (req, res) => {
    try {
        // Consultar todas las ventas de productos desde la base de datos SQL
        const [listaVentas] = await sql.promise().query(`
            SELECT * FROM ventas_productos
        `);

        // Para cada venta de producto SQL, buscar su contraparte en MongoDB
        const ventasCompletas = await Promise.all(
            listaVentas.map(async (venta) => {
                // Asumiendo que idVenta en SQL se mapea a id_ventaSql en MongoDB
                const ventaMongo = await mongo.Venta.findOne({ 
                    id_ventaSql: venta.idVenta.toString() // Convertir a string para coincidir con el tipo en Mongo
                });
                return {
                    ...venta,
                    detallesMongo: ventaMongo
                };
            })
        );

        // Establecer mensaje flash de éxito y enviar respuesta API
        res.flash('success', 'Ventas de productos obtenidas exitosamente');
        return res.apiResponse(ventasCompletas, 200, 'Ventas de productos obtenidas exitosamente');
    } catch (error) {
        // Capturar y registrar errores, establecer mensaje flash de error y enviar respuesta API de error
        console.error('Error al obtener ventas de productos:', error);
        res.flash('error', 'Error al obtener ventas de productos');
        return res.apiError('Error interno del servidor al obtener ventas de productos', 500);
    }
};

// Obtener una venta de producto por ID
ventaProductoCtl.obtenerVenta = async (req, res) => {
    try {
        const { id } = req.params;

        // Consultar la venta de producto por ID desde la base de datos SQL
        const [venta] = await sql.promise().query(`
            SELECT * FROM ventas_productos WHERE idVenta = ?
        `, [id]);

        // Si no se encuentra la venta en SQL, enviar error 404
        if (venta.length === 0) {
            res.flash('error', 'Venta de producto no encontrada');
            return res.apiError('Venta de producto no encontrada', 404);
        }

        // Buscar la venta correspondiente en MongoDB
        const ventaMongo = await mongo.Venta.findOne({ 
            id_ventaSql: id.toString() // Asegurarse de que el ID sea string para la búsqueda en Mongo
        });

        // Combinar los datos de SQL y MongoDB
        const ventaCompleta = {
            ...venta[0],
            detallesMongo: ventaMongo
        };

        // Establecer mensaje flash de éxito y enviar respuesta API
        res.flash('success', 'Venta de producto obtenida exitosamente');
        return res.apiResponse(ventaCompleta, 200, 'Venta de producto obtenida exitosamente');
    } catch (error) {
        // Capturar y registrar errores, establecer mensaje flash de error y enviar respuesta API de error
        console.error('Error al obtener venta de producto:', error);
        res.flash('error', 'Error al obtener venta de producto');
        return res.apiError('Error interno del servidor al obtener la venta de producto', 500);
    }
};

// Crear nueva venta de producto
ventaProductoCtl.crearVenta = async (req, res) => {
    try {
        const { cantidad, total, fecha_venta, dispositivo_venta, ubicacion_venta } = req.body;

        // Validar campos requeridos para la creación de la venta en SQL
        if (!cantidad || !total) {
            res.flash('error', 'Faltan campos requeridos para crear la venta SQL (cantidad, total).');
            return res.apiError('Faltan campos requeridos para crear la venta SQL.', 400);
        }

        const currentTime = new Date().toLocaleString();

        // Crear la venta en SQL
        const datosSql = {
            cantidad,
            total,
            stateVenta: 'completada', // Estado por defecto para la venta
            createVenta: currentTime, // Campo de fecha de creación en SQL
            updateVenta: currentTime // Inicialmente igual a create
        };
        
        const nuevaVentaSql = await orm.ventaProducto.create(datosSql);
        const idVenta = nuevaVentaSql.idVenta; // Obtener el ID generado por SQL

        // Crear la venta en MongoDB, vinculándola con el ID de SQL
        const datosMongo = {
            id_ventaSql: idVenta.toString(), // Convertir a string para el ID de Mongo
            fecha_venta: fecha_venta || currentTime, // Usar fecha_venta del body o la actual
            dispositivo_venta: dispositivo_venta || '',
            ubicacion_venta: ubicacion_venta || ''
        };
        
        await mongo.Venta.create(datosMongo);

        // Establecer mensaje flash de éxito y enviar respuesta API
        res.flash('success', 'Venta de producto creada exitosamente');
        return res.apiResponse(
            { idVenta }, 
            201, 
            'Venta de producto creada exitosamente'
        );
    } catch (error) {
        // Capturar y registrar errores, establecer mensaje flash de error y enviar respuesta API de error
        console.error('Error al crear venta de producto:', error);
        res.flash('error', 'Error al crear la venta de producto');
        return res.apiError('Error interno del servidor al crear la venta de producto', 500);
    }
};

// Actualizar venta de producto
ventaProductoCtl.actualizarVenta = async (req, res) => {
    try {
        const { id } = req.params;
        const { cantidad, total, stateVenta, fecha_venta, dispositivo_venta, ubicacion_venta } = req.body;

        // Verificar la existencia de la venta en SQL
        const [ventaExistenteSql] = await sql.promise().query(`
            SELECT * FROM ventas_productos WHERE idVenta = ?
        `, [id]);

        if (ventaExistenteSql.length === 0) {
            res.flash('error', 'Venta de producto no encontrada');
            return res.apiError('Venta de producto no encontrada', 404);
        }

        const currentTime = new Date().toLocaleString();

        // Actualizar en SQL
        const datosActualizacionSql = {
            cantidad: cantidad !== undefined ? cantidad : ventaExistenteSql[0].cantidad,
            total: total !== undefined ? total : ventaExistenteSql[0].total,
            stateVenta: stateVenta !== undefined ? stateVenta : ventaExistenteSql[0].stateVenta,
            updateVenta: currentTime // Campo de fecha de actualización en SQL
        };
        
        await orm.ventaProducto.update(datosActualizacionSql, {
            where: { idVenta: id }
        });

        // Actualizar en MongoDB
        const datosMongoActualizacion = {};
        if (fecha_venta !== undefined) datosMongoActualizacion.fecha_venta = fecha_venta;
        if (dispositivo_venta !== undefined) datosMongoActualizacion.dispositivo_venta = dispositivo_venta;
        if (ubicacion_venta !== undefined) datosMongoActualizacion.ubicacion_venta = ubicacion_venta;

        await mongo.Venta.findOneAndUpdate(
            { id_ventaSql: id.toString() }, // Asegurarse de que el ID sea string para la búsqueda en Mongo
            datosMongoActualizacion,
            { new: true } // Para devolver el documento actualizado
        );

        // Establecer mensaje flash de éxito y enviar respuesta API
        res.flash('success', 'Venta de producto actualizada exitosamente');
        return res.apiResponse(
            { idVenta: id }, 
            200, 
            'Venta de producto actualizada exitosamente'
        );
    } catch (error) {
        // Capturar y registrar errores, establecer mensaje flash de error y enviar respuesta API de error
        console.error('Error al actualizar venta de producto:', error);
        res.flash('error', 'Error al actualizar la venta de producto');
        return res.apiError('Error interno del servidor al actualizar la venta de producto', 500);
    }
};

// Eliminar venta de producto
ventaProductoCtl.eliminarVenta = async (req, res) => {
    try {
        const { id } = req.params;

        // Verificar la existencia de la venta en SQL
        const [ventaExistenteSql] = await sql.promise().query(`
            SELECT * FROM ventas_productos WHERE idVenta = ?
        `, [id]);

        if (ventaExistenteSql.length === 0) {
            res.flash('error', 'Venta de producto no encontrada');
            return res.apiError('Venta de producto no encontrada', 404);
        }

        // Eliminar en SQL
        await orm.ventaProducto.destroy({
            where: { idVenta: id }
        });

        // Eliminar en MongoDB
        await mongo.Venta.findOneAndDelete({ id_ventaSql: id.toString() }); // Asegurarse de que el ID sea string para la búsqueda en Mongo

        // Establecer mensaje flash de éxito y enviar respuesta API
        res.flash('success', 'Venta de producto eliminada exitosamente');
        return res.apiResponse(
            null, 
            200, 
            'Venta de producto eliminada exitosamente'
        );
    } catch (error) {
        // Capturar y registrar errores, establecer mensaje flash de error y enviar respuesta API de error
        console.error('Error al eliminar venta de producto:', error);
        res.flash('error', 'Error al eliminar la venta de producto');
        return res.apiError('Error interno del servidor al eliminar la venta de producto', 500);
    }
};

module.exports = ventaProductoCtl;