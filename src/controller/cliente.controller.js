const clienteCtl = {};
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

// Mostrar todos los clientes (MySQL + MongoDB)
clienteCtl.mostrarClientes = async (req, res) => {
    try {
        const [clientes] = await sql.promise().query(`
            SELECT * FROM clientes
        `);

        const clientesCompletos = [];

        for (const clienteSql of clientes) {
            const clienteMongo = await mongo.Cliente.findOne({
                id_cliente: clienteSql.idCliente
            });

            clientesCompletos.push({
                mysql: clienteSql,
                mongo: clienteMongo || null
            });
        }

        return { clientes: clientesCompletos };
    } catch (error) {
        console.error('Error al obtener clientes:', error.message);
        return { error: 'Error al obtener clientes' };
    }
};

// Mostrar un cliente por ID (MySQL + MongoDB)
clienteCtl.mostrarClientePorId = async (req, res) => {
    const { id } = req.params;

    try {
        const [clienteSql] = await sql.promise().query(
            'SELECT * FROM clientes WHERE idCliente = ?', [id]
        );

        if (clienteSql.length === 0) {
            return { error: 'Cliente no encontrado en MySQL' };
        }

        const clienteMongo = await mongo.Cliente.findOne({
            id_cliente: parseInt(id)
        });

        return {
            mysql: clienteSql[0],
            mongo: clienteMongo || null
        };
    } catch (error) {
        console.error('Error al obtener cliente:', error.message);
        return { error: 'Error al obtener cliente' };
    }
};

// Crear un cliente (MySQL + MongoDB)
clienteCtl.crearCliente = async (req, res) => {
    const { idCliente, telefono, direccion, membresiaId, fecha_nacimiento } = req.body;

    try {
        // Crear en MySQL
        const nuevoCliente = {
            idCliente,
            telefono,
            direccion,
            membresiaId,
            createCliente: new Date().toLocaleString()
        };

        await orm.cliente.create(nuevoCliente);

        // Crear en MongoDB
        const nuevoClienteMongo = new mongo.Cliente({
            id_cliente: idCliente,
            fecha_nacimiento
        });

        await nuevoClienteMongo.save();

        return { message: 'Cliente creado con éxito', idCliente };
    } catch (error) {
        console.error('Error al crear cliente:', error.message);
        return { error: 'Error al crear cliente' };
    }
};

// Actualizar un cliente (MySQL + MongoDB)
clienteCtl.actualizarCliente = async (req, res) => {
    const { id } = req.params;
    const { telefono, direccion, membresiaId, fecha_nacimiento } = req.body;

    try {
        // Actualizar en MySQL
        const [clienteExistente] = await sql.promise().query(
            'SELECT * FROM clientes WHERE idCliente = ?', [id]
        );

        if (clienteExistente.length === 0) {
            return { error: 'Cliente no encontrado en MySQL' };
        }

        const clienteActualizado = {
            telefono: telefono || clienteExistente[0].telefono,
            direccion: direccion || clienteExistente[0].direccion,
            membresiaId: membresiaId || clienteExistente[0].membresiaId
        };

        await orm.cliente.update(clienteActualizado, {
            where: { idCliente: id }
        });

        // Actualizar en MongoDB
        const clienteMongo = await mongo.Cliente.findOne({
            id_cliente: parseInt(id)
        });

        if (!clienteMongo) {
            return { error: 'Cliente no encontrado en MongoDB' };
        }

        clienteMongo.fecha_nacimiento = fecha_nacimiento || clienteMongo.fecha_nacimiento;
        await clienteMongo.save();

        return { message: 'Cliente actualizado con éxito', idCliente: id };
    } catch (error) {
        console.error('Error al actualizar cliente:', error.message);
        return { error: 'Error al actualizar cliente' };
    }
};

// Eliminar un cliente (MySQL + MongoDB)
clienteCtl.eliminarCliente = async (req, res) => {
    const { id } = req.params;

    try {
        // Eliminar en MySQL
        const [clienteExistente] = await sql.promise().query(
            'SELECT * FROM clientes WHERE idCliente = ?', [id]
        );

        if (clienteExistente.length === 0) {
            return { error: 'Cliente no encontrado en MySQL' };
        }

        await orm.cliente.destroy({
            where: { idCliente: id }
        });

        // Eliminar en MongoDB
        const clienteMongo = await mongo.Cliente.findOne({
            id_cliente: parseInt(id)
        });

        if (!clienteMongo) {
            return { error: 'Cliente no encontrado en MongoDB' };
        }

        await clienteMongo.deleteOne();

        return { message: 'Cliente eliminado con éxito' };
    } catch (error) {
        console.error('Error al eliminar cliente:', error.message);
        return { error: 'Error al eliminar cliente' };
    }
};

module.exports = clienteCtl;