const orm = require('../Database/dataBase.orm');
const sql = require('../Database/dataBase.sql');
const mongo = require('../Database/dataBaseMongose');

const inventarioCtl = {};

// Obtener todos los elementos del inventario
inventarioCtl.obtenerInventarios = async (req, res) => {
    try {
        // Consultar todos los elementos del inventario desde la base de datos SQL
        const [listaInventarios] = await sql.promise().query(`
            SELECT * FROM inventarios
        `);

        // Para cada elemento SQL, buscar su contraparte en MongoDB
        const inventariosCompletos = await Promise.all(
            listaInventarios.map(async (inventario) => {
                // Asumiendo que idInventario en SQL se mapea a id_inventarioSql en MongoDB
                const inventarioMongo = await mongo.Inventario.findOne({ 
                    id_inventarioSql: inventario.idInventario 
                });
                return {
                    ...inventario,
                    detallesMongo: inventarioMongo
                };
            })
        );

        // Establecer mensaje flash de éxito y enviar respuesta API
        res.flash('success', 'Elementos de inventario obtenidos exitosamente');
        return res.apiResponse(inventariosCompletos, 200, 'Elementos de inventario obtenidos exitosamente');
    } catch (error) {
        // Capturar y registrar errores, establecer mensaje flash de error y enviar respuesta API de error
        console.error('Error al obtener elementos de inventario:', error);
        res.flash('error', 'Error al obtener elementos de inventario');
        return res.apiError('Error interno del servidor al obtener elementos de inventario', 500);
    }
};

// Obtener un elemento del inventario por ID
inventarioCtl.obtenerInventario = async (req, res) => {
    try {
        const { id } = req.params;

        // Consultar el elemento del inventario por ID desde la base de datos SQL
        const [inventario] = await sql.promise().query(`
            SELECT * FROM inventarios WHERE idInventario = ?
        `, [id]);

        // Si no se encuentra el elemento en SQL, enviar error 404
        if (inventario.length === 0) {
            res.flash('error', 'Elemento de inventario no encontrado');
            return res.apiError('Elemento de inventario no encontrado', 404);
        }

        // Buscar el elemento correspondiente en MongoDB
        const inventarioMongo = await mongo.Inventario.findOne({ 
            id_inventarioSql: parseInt(id) 
        });

        // Combinar los datos de SQL y MongoDB
        const inventarioCompleto = {
            ...inventario[0],
            detallesMongo: inventarioMongo
        };

        // Establecer mensaje flash de éxito y enviar respuesta API
        res.flash('success', 'Elemento de inventario obtenido exitosamente');
        return res.apiResponse(inventarioCompleto, 200, 'Elemento de inventario obtenido exitosamente');
    } catch (error) {
        // Capturar y registrar errores, establecer mensaje flash de error y enviar respuesta API de error
        console.error('Error al obtener elemento de inventario:', error);
        res.flash('error', 'Error al obtener elemento de inventario');
        return res.apiError('Error interno del servidor al obtener el elemento de inventario', 500);
    }
};

// Crear nuevo elemento de inventario
inventarioCtl.crearInventario = async (req, res) => {
    try {
        const { cantidad, fecha_actualizacion, categoria, stock } = req.body;

        // Validar campos requeridos para la creación del inventario en SQL
        if (!cantidad) {
            res.flash('error', 'Falta el campo requerido para crear el inventario SQL (cantidad).');
            return res.apiError('Falta el campo requerido para crear el inventario SQL.', 400);
        }

        const currentTime = new Date().toLocaleString();

        // Crear el elemento en SQL
        const datosSql = {
            cantidad,
            stateInventario: 'activo', // Estado por defecto
            createInventario: currentTime, // Campo de fecha de creación en SQL
            updateInventario: currentTime // Inicialmente igual a create
        };
        
        const nuevoInventarioSql = await orm.inventario.create(datosSql);
        const idInventario = nuevoInventarioSql.idInventario; // Obtener el ID generado por SQL

        // Crear el elemento en MongoDB, vinculándolo con el ID de SQL
        const datosMongo = {
            id_inventarioSql: idInventario,
            fecha_actualizacion: fecha_actualizacion || currentTime, // Usar fecha_actualizacion del body o la actual
            categoria: categoria || '',
            stock: stock || ''
        };
        
        await mongo.Inventario.create(datosMongo);

        // Establecer mensaje flash de éxito y enviar respuesta API
        res.flash('success', 'Elemento de inventario creado exitosamente');
        return res.apiResponse(
            { idInventario }, 
            201, 
            'Elemento de inventario creado exitosamente'
        );
    } catch (error) {
        // Capturar y registrar errores, establecer mensaje flash de error y enviar respuesta API de error
        console.error('Error al crear elemento de inventario:', error);
        res.flash('error', 'Error al crear el elemento de inventario');
        return res.apiError('Error interno del servidor al crear el elemento de inventario', 500);
    }
};

// Actualizar elemento de inventario
inventarioCtl.actualizarInventario = async (req, res) => {
    try {
        const { id } = req.params;
        const { cantidad, stateInventario, fecha_actualizacion, categoria, stock } = req.body;

        // Verificar la existencia del elemento en SQL
        const [inventarioExistenteSql] = await sql.promise().query(`
            SELECT * FROM inventarios WHERE idInventario = ?
        `, [id]);

        if (inventarioExistenteSql.length === 0) {
            res.flash('error', 'Elemento de inventario no encontrado');
            return res.apiError('Elemento de inventario no encontrado', 404);
        }

        const currentTime = new Date().toLocaleString();

        // Actualizar en SQL
        const datosActualizacionSql = {
            cantidad: cantidad !== undefined ? cantidad : inventarioExistenteSql[0].cantidad,
            stateInventario: stateInventario !== undefined ? stateInventario : inventarioExistenteSql[0].stateInventario,
            updateInventario: currentTime // Campo de fecha de actualización en SQL
        };
        
        await orm.inventario.update(datosActualizacionSql, {
            where: { idInventario: id }
        });

        // Actualizar en MongoDB
        const datosMongoActualizacion = {};
        if (fecha_actualizacion !== undefined) datosMongoActualizacion.fecha_actualizacion = fecha_actualizacion;
        if (categoria !== undefined) datosMongoActualizacion.categoria = categoria;
        if (stock !== undefined) datosMongoActualizacion.stock = stock;

        await mongo.Inventario.findOneAndUpdate(
            { id_inventarioSql: parseInt(id) },
            datosMongoActualizacion,
            { new: true } // Para devolver el documento actualizado
        );

        // Establecer mensaje flash de éxito y enviar respuesta API
        res.flash('success', 'Elemento de inventario actualizado exitosamente');
        return res.apiResponse(
            { idInventario: id }, 
            200, 
            'Elemento de inventario actualizado exitosamente'
        );
    } catch (error) {
        // Capturar y registrar errores, establecer mensaje flash de error y enviar respuesta API de error
        console.error('Error al actualizar elemento de inventario:', error);
        res.flash('error', 'Error al actualizar el elemento de inventario');
        return res.apiError('Error interno del servidor al actualizar el elemento de inventario', 500);
    }
};

// Eliminar elemento de inventario
inventarioCtl.eliminarInventario = async (req, res) => {
    try {
        const { id } = req.params;

        // Verificar la existencia del elemento en SQL
        const [inventarioExistenteSql] = await sql.promise().query(`
            SELECT * FROM inventarios WHERE idInventario = ?
        `, [id]);

        if (inventarioExistenteSql.length === 0) {
            res.flash('error', 'Elemento de inventario no encontrado');
            return res.apiError('Elemento de inventario no encontrado', 404);
        }

        // Eliminar en SQL
        await orm.inventario.destroy({
            where: { idInventario: id }
        });

        // Eliminar en MongoDB
        await mongo.Inventario.findOneAndDelete({ id_inventarioSql: parseInt(id) });

        // Establecer mensaje flash de éxito y enviar respuesta API
        res.flash('success', 'Elemento de inventario eliminado exitosamente');
        return res.apiResponse(
            null, 
            200, 
            'Elemento de inventario eliminado exitosamente'
        );
    } catch (error) {
        // Capturar y registrar errores, establecer mensaje flash de error y enviar respuesta API de error
        console.error('Error al eliminar elemento de inventario:', error);
        res.flash('error', 'Error al eliminar el elemento de inventario');
        return res.apiError('Error interno del servidor al eliminar el elemento de inventario', 500);
    }
};

module.exports = inventarioCtl;
