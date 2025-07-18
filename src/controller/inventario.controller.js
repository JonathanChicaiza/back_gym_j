const inventarioCtl = {};
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

// Mostrar todos los inventarios (MySQL + MongoDB)
inventarioCtl.mostrarInventarios = async (req, res) => {
    try {
        const [inventarios] = await sql.promise().query('SELECT * FROM inventarios');

        const inventariosCompletos = [];

        for (const inventarioSql of inventarios) {
            const inventarioMongo = await mongo.Inventario.findOne({
                id_inventario: inventarioSql.idInventario
            });

            inventariosCompletos.push({
                mysql: inventarioSql,
                mongo: inventarioMongo || null
            });
        }

        return { inventarios: inventariosCompletos };
    } catch (error) {
        console.error('Error al obtener inventarios:', error.message);
        return { error: 'Error al obtener inventarios' };
    }
};

// Mostrar un inventario por ID (MySQL + MongoDB)
inventarioCtl.mostrarInventarioPorId = async (req, res) => {
    const { id } = req.params;

    try {
        const [inventarioSql] = await sql.promise().query(
            'SELECT * FROM inventarios WHERE idInventario = ?', [id]
        );

        if (inventarioSql.length === 0) {
            return { error: 'Inventario no encontrado en MySQL' };
        }

        const inventarioMongo = await mongo.Inventario.findOne({
            id_inventario: parseInt(id)
        });

        return {
            mysql: inventarioSql[0],
            mongo: inventarioMongo || null
        };
    } catch (error) {
        console.error('Error al obtener inventario:', error.message);
        return { error: 'Error al obtener inventario' };
    }
};

// Crear un inventario (MySQL + MongoDB)
inventarioCtl.crearInventario = async (req, res) => {
    const { productoId, cantidad, stateInventario } = req.body;

    try {
        // Crear en MySQL
        const nuevoInventario = {
            productoId,
            cantidad,
            stateInventario,
            createInventario: new Date().toLocaleString()
        };

        const resultado = await orm.inventario.create(nuevoInventario);
        const idInventario = resultado.idInventario;

        // Crear en MongoDB
        const nuevoInventarioMongo = new mongo.Inventario({
            id_inventario: idInventario,
            fecha_actualizacion: new Date().toLocaleString()
        });

        await nuevoInventarioMongo.save();

        return {
            message: 'Inventario creado con éxito',
            idInventario
        };
    } catch (error) {
        console.error('Error al crear inventario:', error.message);
        return { error: 'Error al crear inventario' };
    }
};

// Actualizar un inventario (MySQL + MongoDB)
inventarioCtl.actualizarInventario = async (req, res) => {
    const { id } = req.params;
    const { productoId, cantidad, stateInventario } = req.body;

    try {
        // Actualizar en MySQL
        const [inventarioExistente] = await sql.promise().query(
            'SELECT * FROM inventarios WHERE idInventario = ?', [id]
        );

        if (inventarioExistente.length === 0) {
            return { error: 'Inventario no encontrado en MySQL' };
        }

        const inventarioActualizado = {
            productoId: productoId || inventarioExistente[0].productoId,
            cantidad: cantidad || inventarioExistente[0].cantidad,
            stateInventario: stateInventario || inventarioExistente[0].stateInventario,
            updateInventario: new Date().toLocaleString()
        };

        await orm.inventario.update(inventarioActualizado, {
            where: { idInventario: id }
        });

        // Actualizar en MongoDB - solo fecha_actualizacion
        const inventarioMongo = await mongo.Inventario.findOne({
            id_inventario: parseInt(id)
        });

        if (!inventarioMongo) {
            return { error: 'Inventario no encontrado en MongoDB' };
        }

        inventarioMongo.fecha_actualizacion = new Date().toLocaleString();
        await inventarioMongo.save();

        return { message: 'Inventario actualizado con éxito', idInventario: id };
    } catch (error) {
        console.error('Error al actualizar inventario:', error.message);
        return { error: 'Error al actualizar inventario' };
    }
};

// Eliminar un inventario (MySQL + MongoDB)
inventarioCtl.eliminarInventario = async (req, res) => {
    const { id } = req.params;

    try {
        // Eliminar en MySQL
        const [inventarioExistente] = await sql.promise().query(
            'SELECT * FROM inventarios WHERE idInventario = ?', [id]
        );

        if (inventarioExistente.length === 0) {
            return { error: 'Inventario no encontrado en MySQL' };
        }

        await orm.inventario.destroy({
            where: { idInventario: id }
        });

        // Eliminar en MongoDB
        const inventarioMongo = await mongo.Inventario.findOne({
            id_inventario: parseInt(id)
        });

        if (!inventarioMongo) {
            return { error: 'Inventario no encontrado en MongoDB' };
        }

        await inventarioMongo.deleteOne();

        return { message: 'Inventario eliminado con éxito' };
    } catch (error) {
        console.error('Error al eliminar inventario:', error.message);
        return { error: 'Error al eliminar inventario' };
    }
};

module.exports = inventarioCtl;