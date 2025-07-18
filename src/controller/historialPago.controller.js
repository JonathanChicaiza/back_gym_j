const historialPagoCtl = {};
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

// Mostrar todos los historiales de pago (MySQL + MongoDB)
historialPagoCtl.mostrarHistoriales = async (req, res) => {
    try {
        const [historiales] = await sql.promise().query('SELECT * FROM historial_pagos');

        const historialesCompletos = [];

        for (const historialSql of historiales) {
            const historialMongo = await mongo.HistorialPago.findOne({
                id_historial: historialSql.idHistorial
            });

            historialesCompletos.push({
                mysql: historialSql,
                mongo: historialMongo || null
            });
        }

        return { historiales: historialesCompletos };
    } catch (error) {
        console.error('Error al obtener historiales de pago:', error.message);
        return { error: 'Error al obtener historiales de pago' };
    }
};

// Mostrar un historial por ID (MySQL + MongoDB)
historialPagoCtl.mostrarHistorialPorId = async (req, res) => {
    const { id } = req.params;

    try {
        const [historialSql] = await sql.promise().query(
            'SELECT * FROM historial_pagos WHERE idHistorial = ?', [id]
        );

        if (historialSql.length === 0) {
            return { error: 'Historial no encontrado en MySQL' };
        }

        const historialMongo = await mongo.HistorialPago.findOne({
            id_historial: parseInt(id)
        });

        return {
            mysql: historialSql[0],
            mongo: historialMongo || null
        };
    } catch (error) {
        console.error('Error al obtener historial de pago:', error.message);
        return { error: 'Error al obtener historial de pago' };
    }
};

// Crear un historial de pago (MySQL + MongoDB)
historialPagoCtl.crearHistorial = async (req, res) => {
    const { pagoId, fechaRegistro, stateHistorial, observaciones } = req.body;

    try {
        // Crear en MySQL
        const nuevoHistorial = {
            pagoId,
            fechaRegistro,
            stateHistorial,
            createHistorial: new Date().toLocaleString()
        };

        const resultado = await orm.historialpago.create(nuevoHistorial);
        const idHistorial = resultado.idHistorial;

        // Crear en MongoDB
        const nuevoHistorialMongo = new mongo.HistorialPago({
            id_historial: idHistorial,
            observaciones
        });

        await nuevoHistorialMongo.save();

        return {
            message: 'Historial de pago creado con éxito',
            idHistorial
        };
    } catch (error) {
        console.error('Error al crear historial de pago:', error.message);
        return { error: 'Error al crear historial de pago' };
    }
};

// Actualizar un historial de pago (MySQL + MongoDB)
historialPagoCtl.actualizarHistorial = async (req, res) => {
    const { id } = req.params;
    const { pagoId, fechaRegistro, stateHistorial, observaciones } = req.body;

    try {
        // Actualizar en MySQL
        const [historialExistente] = await sql.promise().query(
            'SELECT * FROM historial_pagos WHERE idHistorial = ?', [id]
        );

        if (historialExistente.length === 0) {
            return { error: 'Historial no encontrado en MySQL' };
        }

        const historialActualizado = {
            pagoId: pagoId || historialExistente[0].pagoId,
            fechaRegistro: fechaRegistro || historialExistente[0].fechaRegistro,
            stateHistorial: stateHistorial || historialExistente[0].stateHistorial,
            updateHistorial: new Date().toLocaleString()
        };

        await orm.historialpago.update(historialActualizado, {
            where: { idHistorial: id }
        });

        // Actualizar en MongoDB
        const historialMongo = await mongo.HistorialPago.findOne({
            id_historial: parseInt(id)
        });

        if (!historialMongo) {
            return { error: 'Historial no encontrado en MongoDB' };
        }

        historialMongo.observaciones = observaciones || historialMongo.observaciones;
        await historialMongo.save();

        return { message: 'Historial de pago actualizado con éxito', idHistorial: id };
    } catch (error) {
        console.error('Error al actualizar historial de pago:', error.message);
        return { error: 'Error al actualizar historial de pago' };
    }
};

// Eliminar un historial de pago (MySQL + MongoDB)
historialPagoCtl.eliminarHistorial = async (req, res) => {
    const { id } = req.params;

    try {
        // Eliminar en MySQL
        const [historialExistente] = await sql.promise().query(
            'SELECT * FROM historial_pagos WHERE idHistorial = ?', [id]
        );

        if (historialExistente.length === 0) {
            return { error: 'Historial no encontrado en MySQL' };
        }

        await orm.historialpago.destroy({
            where: { idHistorial: id }
        });

        // Eliminar en MongoDB
        const historialMongo = await mongo.HistorialPago.findOne({
            id_historial: parseInt(id)
        });

        if (!historialMongo) {
            return { error: 'Historial no encontrado en MongoDB' };
        }

        await historialMongo.deleteOne();

        return { message: 'Historial de pago eliminado con éxito' };
    } catch (error) {
        console.error('Error al eliminar historial de pago:', error.message);
        return { error: 'Error al eliminar historial de pago' };
    }
};

module.exports = historialPagoCtl;