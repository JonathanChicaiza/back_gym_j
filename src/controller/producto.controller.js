const orm = require('../Database/dataBase.orm');
const sql = require('../Database/dataBase.sql');
const mongo = require('../Database/dataBaseMongose');

const productoCtl = {};

// Obtener todos los productos
productoCtl.obtenerProductos = async (req, res) => {
    try {
        // Consultar todos los productos desde la base de datos SQL
        const [listaProductos] = await sql.promise().query(`
            SELECT * FROM productos
        `);

        // Para cada producto SQL, buscar su contraparte en MongoDB
        const productosCompletos = await Promise.all(
            listaProductos.map(async (producto) => {
                // Asumiendo que idProducto en SQL se mapea a id_productoSql en MongoDB
                const productoMongo = await mongo.Producto.findOne({ 
                    id_productoSql: producto.idProducto 
                });
                return {
                    ...producto,
                    detallesMongo: productoMongo
                };
            })
        );

        // Establecer mensaje flash de éxito y enviar respuesta API
        res.flash('success', 'Productos obtenidos exitosamente');
        return res.apiResponse(productosCompletos, 200, 'Productos obtenidos exitosamente');
    } catch (error) {
        // Capturar y registrar errores, establecer mensaje flash de error y enviar respuesta API de error
        console.error('Error al obtener productos:', error);
        res.flash('error', 'Error al obtener productos');
        return res.apiError('Error interno del servidor al obtener productos', 500);
    }
};

// Obtener un producto por ID
productoCtl.obtenerProducto = async (req, res) => {
    try {
        const { id } = req.params;

        // Consultar el producto por ID desde la base de datos SQL
        const [producto] = await sql.promise().query(`
            SELECT * FROM productos WHERE idProducto = ?
        `, [id]);

        // Si no se encuentra el producto en SQL, enviar error 404
        if (producto.length === 0) {
            res.flash('error', 'Producto no encontrado');
            return res.apiError('Producto no encontrado', 404);
        }

        // Buscar el producto correspondiente en MongoDB
        const productoMongo = await mongo.Producto.findOne({ 
            id_productoSql: parseInt(id) 
        });

        // Combinar los datos de SQL y MongoDB
        const productoCompleto = {
            ...producto[0],
            detallesMongo: productoMongo
        };

        // Establecer mensaje flash de éxito y enviar respuesta API
        res.flash('success', 'Producto obtenido exitosamente');
        return res.apiResponse(productoCompleto, 200, 'Producto obtenido exitosamente');
    } catch (error) {
        // Capturar y registrar errores, establecer mensaje flash de error y enviar respuesta API de error
        console.error('Error al obtener producto:', error);
        res.flash('error', 'Error al obtener producto');
        return res.apiError('Error interno del servidor al obtener el producto', 500);
    }
};

// Crear nuevo producto
productoCtl.crearProducto = async (req, res) => {
    try {
        const { nombre, precio, categoria, descripcion, stock } = req.body;

        // Validar campos requeridos para la creación del producto en SQL
        if (!nombre || !precio || !categoria) {
            res.flash('error', 'Faltan campos requeridos para crear el producto SQL (nombre, precio, categoria).');
            return res.apiError('Faltan campos requeridos para crear el producto SQL.', 400);
        }

        const currentTime = new Date().toLocaleString();

        // Crear el producto en SQL
        const datosSql = {
            nombre,
            precio,
            categoria,
            stateProducto: 'disponible', // Estado por defecto
            createProducto: currentTime, // Campo de fecha de creación en SQL
            updateProducto: currentTime // Inicialmente igual a create
        };
        
        const nuevoProductoSql = await orm.producto.create(datosSql);
        const idProducto = nuevoProductoSql.idProducto; // Obtener el ID generado por SQL

        // Crear el producto en MongoDB, vinculándolo con el ID de SQL
        const datosMongo = {
            id_productoSql: idProducto,
            descripcion: descripcion || '',
            stock: stock || '',
            createProducto: currentTime, // Usar la misma fecha de creación para consistencia
            updateProducto: currentTime // Usar la misma fecha de actualización para consistencia
        };
        
        await mongo.Producto.create(datosMongo);

        // Establecer mensaje flash de éxito y enviar respuesta API
        res.flash('success', 'Producto creado exitosamente');
        return res.apiResponse(
            { idProducto }, 
            201, 
            'Producto creado exitosamente'
        );
    } catch (error) {
        // Capturar y registrar errores, establecer mensaje flash de error y enviar respuesta API de error
        console.error('Error al crear producto:', error);
        res.flash('error', 'Error al crear el producto');
        return res.apiError('Error interno del servidor al crear el producto', 500);
    }
};

// Actualizar producto
productoCtl.actualizarProducto = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, precio, categoria, stateProducto, descripcion, stock } = req.body;

        // Verificar la existencia del producto en SQL
        const [productoExistenteSql] = await sql.promise().query(`
            SELECT * FROM productos WHERE idProducto = ?
        `, [id]);

        if (productoExistenteSql.length === 0) {
            res.flash('error', 'Producto no encontrado');
            return res.apiError('Producto no encontrado', 404);
        }

        const currentTime = new Date().toLocaleString();

        // Actualizar en SQL
        const datosActualizacionSql = {
            nombre: nombre !== undefined ? nombre : productoExistenteSql[0].nombre,
            precio: precio !== undefined ? precio : productoExistenteSql[0].precio,
            categoria: categoria !== undefined ? categoria : productoExistenteSql[0].categoria,
            stateProducto: stateProducto !== undefined ? stateProducto : productoExistenteSql[0].stateProducto,
            updateProducto: currentTime // Campo de fecha de actualización en SQL
        };
        
        await orm.producto.update(datosActualizacionSql, {
            where: { idProducto: id }
        });

        // Actualizar en MongoDB
        const datosMongoActualizacion = {
            updateProducto: currentTime // Actualizar la fecha de modificación en Mongo
        };
        if (descripcion !== undefined) datosMongoActualizacion.descripcion = descripcion;
        if (stock !== undefined) datosMongoActualizacion.stock = stock;

        await mongo.Producto.findOneAndUpdate(
            { id_productoSql: parseInt(id) },
            datosMongoActualizacion,
            { new: true } // Para devolver el documento actualizado
        );

        // Establecer mensaje flash de éxito y enviar respuesta API
        res.flash('success', 'Producto actualizado exitosamente');
        return res.apiResponse(
            { idProducto: id }, 
            200, 
            'Producto actualizado exitosamente'
        );
    } catch (error) {
        // Capturar y registrar errores, establecer mensaje flash de error y enviar respuesta API de error
        console.error('Error al actualizar producto:', error);
        res.flash('error', 'Error al actualizar el producto');
        return res.apiError('Error interno del servidor al actualizar el producto', 500);
    }
};

// Eliminar producto
productoCtl.eliminarProducto = async (req, res) => {
    try {
        const { id } = req.params;

        // Verificar la existencia del producto en SQL
        const [productoExistenteSql] = await sql.promise().query(`
            SELECT * FROM productos WHERE idProducto = ?
        `, [id]);

        if (productoExistenteSql.length === 0) {
            res.flash('error', 'Producto no encontrado');
            return res.apiError('Producto no encontrado', 404);
        }

        // Eliminar en SQL
        await orm.producto.destroy({
            where: { idProducto: id }
        });

        // Eliminar en MongoDB
        await mongo.Producto.findOneAndDelete({ id_productoSql: parseInt(id) });

        // Establecer mensaje flash de éxito y enviar respuesta API
        res.flash('success', 'Producto eliminado exitosamente');
        return res.apiResponse(
            null, 
            200, 
            'Producto eliminado exitosamente'
        );
    } catch (error) {
        // Capturar y registrar errores, establecer mensaje flash de error y enviar respuesta API de error
        console.error('Error al eliminar producto:', error);
        res.flash('error', 'Error al eliminar el producto');
        return res.apiError('Error interno del servidor al eliminar el producto', 500);
    }
};

module.exports = productoCtl;
