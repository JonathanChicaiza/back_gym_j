const productoCtl = {};
const orm = require('../Database/dataBase.orm'); // Sequelize para MySQL
const sql = require('../Database/dataBase.sql'); // Consultas SQL puras
const mongo = require('../Database/dataBaseMongose'); // MongoDB
const { cifrarDatos, descifrarDatos } = require('../lib/encrypDates');

function safeDecrypt(data) {
    try {
        return descifrarDatos(data);
    } catch (error) {
        console.error('Error al descifrar datos:', error.message);
        return '';
    }
}

// Mostrar todos los productos (MySQL + MongoDB)
productoCtl.mostrarProductos = async (req, res) => {
    try {
        const [productos] = await sql.promise().query('SELECT * FROM productos');

        const productosCompletos = [];

        for (const productoSql of productos) {
            const productoMongo = await mongo.Producto.findOne({
                id_producto: productoSql.idProducto
            });

            productosCompletos.push({
                mysql: productoSql,
                mongo: productoMongo || null
            });
        }

        return { productos: productosCompletos };
    } catch (error) {
        console.error('Error al obtener productos:', error.message);
        return { error: 'Error al obtener productos' };
    }
};

// Mostrar un producto por ID (MySQL + MongoDB)
productoCtl.mostrarProductoPorId = async (req, res) => {
    const { id } = req.params;

    try {
        const [productoSql] = await sql.promise().query(
            'SELECT * FROM productos WHERE idProducto = ?', [id]
        );

        if (productoSql.length === 0) {
            return { error: 'Producto no encontrado en MySQL' };
        }

        const productoMongo = await mongo.Producto.findOne({
            id_producto: parseInt(id)
        });

        return {
            mysql: productoSql[0],
            mongo: productoMongo || null
        };
    } catch (error) {
        console.error('Error al obtener producto:', error.message);
        return { error: 'Error al obtener producto' };
    }
};

// Crear un producto (MySQL + MongoDB)
productoCtl.crearProducto = async (req, res) => {
    const { nombre, precio, categoria, stateProducto, descripcion } = req.body;

    try {
        // Crear en MySQL
        const nuevoProducto = {
            nombre,
            precio,
            categoria,
            stateProducto,
            createProducto: new Date().toLocaleString()
        };

        const resultado = await orm.producto.create(nuevoProducto);
        const idProducto = resultado.idProducto;

        // Crear en MongoDB
        const nuevoProductoMongo = new mongo.Producto({
            id_producto: idProducto,
            descripcion
        });

        await nuevoProductoMongo.save();

        return {
            message: 'Producto creado con éxito',
            idProducto
        };
    } catch (error) {
        console.error('Error al crear producto:', error.message);
        return { error: 'Error al crear producto' };
    }
};

// Actualizar un producto (MySQL + MongoDB)
productoCtl.actualizarProducto = async (req, res) => {
    const { id } = req.params;
    const { nombre, precio, categoria, stateProducto, descripcion } = req.body;

    try {
        // Actualizar en MySQL
        const [productoExistente] = await sql.promise().query(
            'SELECT * FROM productos WHERE idProducto = ?', [id]
        );

        if (productoExistente.length === 0) {
            return { error: 'Producto no encontrado en MySQL' };
        }

        const productoActualizado = {
            nombre: nombre || productoExistente[0].nombre,
            precio: precio || productoExistente[0].precio,
            categoria: categoria || productoExistente[0].categoria,
            stateProducto: stateProducto || productoExistente[0].stateProducto,
            updateProducto: new Date().toLocaleString()
        };

        await orm.producto.update(productoActualizado, {
            where: { idProducto: id }
        });

        // Actualizar en MongoDB
        const productoMongo = await mongo.Producto.findOne({
            id_producto: parseInt(id)
        });

        if (!productoMongo) {
            return { error: 'Producto no encontrado en MongoDB' };
        }

        productoMongo.descripcion = descripcion || productoMongo.descripcion;
        await productoMongo.save();

        return { message: 'Producto actualizado con éxito', idProducto: id };
    } catch (error) {
        console.error('Error al actualizar producto:', error.message);
        return { error: 'Error al actualizar producto' };
    }
};

// Eliminar un producto (MySQL + MongoDB)
productoCtl.eliminarProducto = async (req, res) => {
    const { id } = req.params;

    try {
        // Eliminar en MySQL
        const [productoExistente] = await sql.promise().query(
            'SELECT * FROM productos WHERE idProducto = ?', [id]
        );

        if (productoExistente.length === 0) {
            return { error: 'Producto no encontrado en MySQL' };
        }

        await orm.producto.destroy({
            where: { idProducto: id }
        });

        // Eliminar en MongoDB
        const productoMongo = await mongo.Producto.findOne({
            id_producto: parseInt(id)
        });

        if (!productoMongo) {
            return { error: 'Producto no encontrado en MongoDB' };
        }

        await productoMongo.deleteOne();

        return { message: 'Producto eliminado con éxito' };
    } catch (error) {
        console.error('Error al eliminar producto:', error.message);
        return { error: 'Error al eliminar producto' };
    }
};

module.exports = productoCtl;