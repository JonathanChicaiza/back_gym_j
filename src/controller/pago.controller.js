const pagoCtl = {};
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

// Mostrar todos los pagos (MySQL + MongoDB)
pagoCtl.mostrarPagos = async (req, res) => {
    try {
        const [pagos] = await sql.promise().query('SELECT * FROM pagos');

        const pagosCompletos = [];

        for (const pagoSql of pagos) {
            const pagoMongo = await mongo.Pago.findOne({
                id_pago: pagoSql.idPago
            });

            pagosCompletos.push({
                mysql: pagoSql,
                mongo: pagoMongo || null
            });
        }

        return { pagos: pagosCompletos };
    } catch (error) {
        console.error('Error al obtener pagos:', error.message);
        return { error: 'Error al obtener pagos' };
    }
};

// Mostrar un pago por ID (MySQL + MongoDB)
pagoCtl.mostrarPagoPorId = async (req, res) => {
    const { id } = req.params;

    try {
        const [pagoSql] = await sql.promise().query(
            'SELECT * FROM pagos WHERE idPago = ?', [id]
        );

        if (pagoSql.length === 0) {
            return { error: 'Pago no encontrado en MySQL' };
        }

        const pagoMongo = await mongo.Pago.findOne({
            id_pago: parseInt(id)
        });

        return {
            mysql: pagoSql[0],
            mongo: pagoMongo || null
        };
    } catch (error) {
        console.error('Error al obtener pago:', error.message);
        return { error: 'Error al obtener pago' };
    }
};

// Crear un pago (MySQL + MongoDB)
pagoCtl.crearPago = async (req, res) => {
    const { monto, fechaPago, metodoPago, clienteId, statePago, concepto } = req.body;

    try {
        // Crear en MySQL
        const nuevoPago = {
            monto,
            fechaPago,
            metodoPago,
            clienteId,
            statePago,
            createPago: new Date().toLocaleString()
        };

        const resultado = await orm.pago.create(nuevoPago);
        const idPago = resultado.idPago;

        // Crear en MongoDB
        const nuevoPagoMongo = new mongo.Pago({
            id_pago: idPago,
            concepto
        });

        await nuevoPagoMongo.save();

        return {
            message: 'Pago creado con éxito',
            idPago
        };
    } catch (error) {
        console.error('Error al crear pago:', error.message);
        return { error: 'Error al crear pago' };
    }
};

// Actualizar un pago (MySQL + MongoDB)
pagoCtl.actualizarPago = async (req, res) => {
    const { id } = req.params;
    const { monto, fechaPago, metodoPago, clienteId, statePago, concepto } = req.body;

    try {
        // Actualizar en MySQL
        const [pagoExistente] = await sql.promise().query(
            'SELECT * FROM pagos WHERE idPago = ?', [id]
        );

        if (pagoExistente.length === 0) {
            return { error: 'Pago no encontrado en MySQL' };
        }

        const pagoActualizado = {
            monto: monto || pagoExistente[0].monto,
            fechaPago: fechaPago || pagoExistente[0].fechaPago,
            metodoPago: metodoPago || pagoExistente[0].metodoPago,
            clienteId: clienteId || pagoExistente[0].clienteId,
            statePago: statePago || pagoExistente[0].statePago,
            updatePago: new Date().toLocaleString()
        };

        await orm.pago.update(pagoActualizado, {
            where: { idPago: id }
        });

        // Actualizar en MongoDB
        const pagoMongo = await mongo.Pago.findOne({
            id_pago: parseInt(id)
        });

        if (!pagoMongo) {
            return { error: 'Pago no encontrado en MongoDB' };
        }

        pagoMongo.concepto = concepto || pagoMongo.concepto;
        await pagoMongo.save();

        return { message: 'Pago actualizado con éxito', idPago: id };
    } catch (error) {
        console.error('Error al actualizar pago:', error.message);
        return { error: 'Error al actualizar pago' };
    }
};

// Eliminar un pago (MySQL + MongoDB)
pagoCtl.eliminarPago = async (req, res) => {
    const { id } = req.params;

    try {
        // Eliminar en MySQL
        const [pagoExistente] = await sql.promise().query(
            'SELECT * FROM pagos WHERE idPago = ?', [id]
        );

        if (pagoExistente.length === 0) {
            return { error: 'Pago no encontrado en MySQL' };
        }

        await orm.pago.destroy({
            where: { idPago: id }
        });

        // Eliminar en MongoDB
        const pagoMongo = await mongo.Pago.findOne({
            id_pago: parseInt(id)
        });

        if (!pagoMongo) {
            return { error: 'Pago no encontrado en MongoDB' };
        }

        await pagoMongo.deleteOne();

        return { message: 'Pago eliminado con éxito' };
    } catch (error) {
        console.error('Error al eliminar pago:', error.message);
        return { error: 'Error al eliminar pago' };
    }
};

module.exports = pagoCtl;