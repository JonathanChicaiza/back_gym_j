const ventaProductoCtl = {};
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

// Mostrar todas las ventas (MySQL + MongoDB)
ventaProductoCtl.mostrarVentas = async (req, res) => {
    try {
        const [ventas] = await sql.promise().query('SELECT * FROM ventas_productos');

        const ventasCompletas = [];

        for (const ventaSql of ventas) {
            const ventaMongo = await mongo.Venta.findOne({
                id_venta: ventaSql.idVenta
            });

            ventasCompletas.push({
                mysql: ventaSql,
                mongo: ventaMongo || null
            });
        }

        return { ventas: ventasCompletas };
    } catch (error) {
        console.error('Error al obtener ventas:', error.message);
        return { error: 'Error al obtener ventas' };
    }
};

// Mostrar una venta por ID (MySQL + MongoDB)
ventaProductoCtl.mostrarVentaPorId = async (req, res) => {
    const { id } = req.params;

    try {
        const [ventaSql] = await sql.promise().query(
            'SELECT * FROM ventas_productos WHERE idVenta = ?', [id]
        );

        if (ventaSql.length === 0) {
            return { error: 'Venta no encontrada en MySQL' };
        }

        const ventaMongo = await mongo.Venta.findOne({
            id_venta: parseInt(id)
        });

        return {
            mysql: ventaSql[0],
            mongo: ventaMongo || null
        };
    } catch (error) {
        console.error('Error al obtener venta:', error.message);
        return { error: 'Error al obtener venta' };
    }
};

// Crear una venta (MySQL + MongoDB)
ventaProductoCtl.crearVenta = async (req, res) => {
    const { clienteId, productoId, cantidad, total, stateVenta } = req.body;

    try {
        // Crear en MySQL
        const nuevaVenta = {
            clienteId,
            productoId,
            cantidad,
            total,
            stateVenta,
            createVenta: new Date().toLocaleString()
        };

        const resultado = await orm.ventaProducto.create(nuevaVenta);
        const idVenta = resultado.idVenta;

        // Crear en MongoDB
        const nuevaVentaMongo = new mongo.Venta({
            id_venta: idVenta,
            fecha_venta: new Date().toLocaleString()
        });

        await nuevaVentaMongo.save();

        return {
            message: 'Venta creada con éxito',
            idVenta
        };
    } catch (error) {
        console.error('Error al crear venta:', error.message);
        return { error: 'Error al crear venta' };
    }
};

// Actualizar una venta (MySQL + MongoDB)
ventaProductoCtl.actualizarVenta = async (req, res) => {
    const { id } = req.params;
    const { clienteId, productoId, cantidad, total, stateVenta } = req.body;

    try {
        // Actualizar en MySQL
        const [ventaExistente] = await sql.promise().query(
            'SELECT * FROM ventas_productos WHERE idVenta = ?', [id]
        );

        if (ventaExistente.length === 0) {
            return { error: 'Venta no encontrada en MySQL' };
        }

        const ventaActualizada = {
            clienteId: clienteId || ventaExistente[0].clienteId,
            productoId: productoId || ventaExistente[0].productoId,
            cantidad: cantidad || ventaExistente[0].cantidad,
            total: total || ventaExistente[0].total,
            stateVenta: stateVenta || ventaExistente[0].stateVenta,
            updateVenta: new Date().toLocaleString()
        };

        await orm.ventaProducto.update(ventaActualizada, {
            where: { idVenta: id }
        });

        // Actualizar en MongoDB - solo fecha_venta
        const ventaMongo = await mongo.Venta.findOne({
            id_venta: parseInt(id)
        });

        if (!ventaMongo) {
            return { error: 'Venta no encontrada en MongoDB' };
        }

        ventaMongo.fecha_venta = new Date().toLocaleString();
        await ventaMongo.save();

        return { message: 'Venta actualizada con éxito', idVenta: id };
    } catch (error) {
        console.error('Error al actualizar venta:', error.message);
        return { error: 'Error al actualizar venta' };
    }
};

// Eliminar una venta (MySQL + MongoDB)
ventaProductoCtl.eliminarVenta = async (req, res) => {
    const { id } = req.params;

    try {
        // Eliminar en MySQL
        const [ventaExistente] = await sql.promise().query(
            'SELECT * FROM ventas_productos WHERE idVenta = ?', [id]
        );

        if (ventaExistente.length === 0) {
            return { error: 'Venta no encontrada en MySQL' };
        }

        await orm.ventaProducto.destroy({
            where: { idVenta: id }
        });

        // Eliminar en MongoDB
        const ventaMongo = await mongo.Venta.findOne({
            id_venta: parseInt(id)
        });

        if (!ventaMongo) {
            return { error: 'Venta no encontrada en MongoDB' };
        }

        await ventaMongo.deleteOne();

        return { message: 'Venta eliminada con éxito' };
    } catch (error) {
        console.error('Error al eliminar venta:', error.message);
        return { error: 'Error al eliminar venta' };
    }
};

module.exports = ventaProductoCtl;