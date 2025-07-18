const reservaCtl = {};
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

// Mostrar todas las reservas (MySQL + MongoDB)
reservaCtl.mostrarReservas = async (req, res) => {
    try {
        const [reservas] = await sql.promise().query('SELECT * FROM reservas');

        const reservasCompletas = [];

        for (const reservaSql of reservas) {
            const reservaMongo = await mongo.Reserva.findOne({
                id_reserva: reservaSql.idReserva
            });

            reservasCompletas.push({
                mysql: reservaSql,
                mongo: reservaMongo || null
            });
        }

        return { reservas: reservasCompletas };
    } catch (error) {
        console.error('Error al obtener reservas:', error.message);
        return { error: 'Error al obtener reservas' };
    }
};

// Mostrar una reserva por ID (MySQL + MongoDB)
reservaCtl.mostrarReservaPorId = async (req, res) => {
    const { id } = req.params;

    try {
        const [reservaSql] = await sql.promise().query(
            'SELECT * FROM reservas WHERE idReserva = ?', [id]
        );

        if (reservaSql.length === 0) {
            return { error: 'Reserva no encontrada en MySQL' };
        }

        const reservaMongo = await mongo.Reserva.findOne({
            id_reserva: parseInt(id)
        });

        return {
            mysql: reservaSql[0],
            mongo: reservaMongo || null
        };
    } catch (error) {
        console.error('Error al obtener reserva:', error.message);
        return { error: 'Error al obtener reserva' };
    }
};

// Crear una reserva (MySQL + MongoDB)
reservaCtl.crearReserva = async (req, res) => {
    const { estado, clienteId, claseId, stateReserva } = req.body;

    try {
        // Crear en MySQL
        const nuevaReserva = {
            estado,
            clienteId,
            claseId,
            stateReserva,
            createReserva: new Date().toLocaleString()
        };

        const resultado = await orm.reserva.create(nuevaReserva);
        const idReserva = resultado.idReserva;

        // Crear en MongoDB
        const nuevaReservaMongo = new mongo.Reserva({
            id_reserva: idReserva,
            fecha_reserva: new Date().toLocaleString()
        });

        await nuevaReservaMongo.save();

        return {
            message: 'Reserva creada con éxito',
            idReserva
        };
    } catch (error) {
        console.error('Error al crear reserva:', error.message);
        return { error: 'Error al crear reserva' };
    }
};

// Actualizar una reserva (MySQL + MongoDB)
reservaCtl.actualizarReserva = async (req, res) => {
    const { id } = req.params;
    const { estado, clienteId, claseId, stateReserva } = req.body;

    try {
        // Actualizar en MySQL
        const [reservaExistente] = await sql.promise().query(
            'SELECT * FROM reservas WHERE idReserva = ?', [id]
        );

        if (reservaExistente.length === 0) {
            return { error: 'Reserva no encontrada en MySQL' };
        }

        const reservaActualizada = {
            estado: estado || reservaExistente[0].estado,
            clienteId: clienteId || reservaExistente[0].clienteId,
            claseId: claseId || reservaExistente[0].claseId,
            stateReserva: stateReserva || reservaExistente[0].stateReserva,
            updateReserva: new Date().toLocaleString()
        };

        await orm.reserva.update(reservaActualizada, {
            where: { idReserva: id }
        });

        // Actualizar en MongoDB - solo fecha_reserva
        const reservaMongo = await mongo.Reserva.findOne({
            id_reserva: parseInt(id)
        });

        if (!reservaMongo) {
            return { error: 'Reserva no encontrada en MongoDB' };
        }

        reservaMongo.fecha_reserva = new Date().toLocaleString();
        await reservaMongo.save();

        return { message: 'Reserva actualizada con éxito', idReserva: id };
    } catch (error) {
        console.error('Error al actualizar reserva:', error.message);
        return { error: 'Error al actualizar reserva' };
    }
};

// Eliminar una reserva (MySQL + MongoDB)
reservaCtl.eliminarReserva = async (req, res) => {
    const { id } = req.params;

    try {
        // Eliminar en MySQL
        const [reservaExistente] = await sql.promise().query(
            'SELECT * FROM reservas WHERE idReserva = ?', [id]
        );

        if (reservaExistente.length === 0) {
            return { error: 'Reserva no encontrada en MySQL' };
        }

        await orm.reserva.destroy({
            where: { idReserva: id }
        });

        // Eliminar en MongoDB
        const reservaMongo = await mongo.Reserva.findOne({
            id_reserva: parseInt(id)
        });

        if (!reservaMongo) {
            return { error: 'Reserva no encontrada en MongoDB' };
        }

        await reservaMongo.deleteOne();

        return { message: 'Reserva eliminada con éxito' };
    } catch (error) {
        console.error('Error al eliminar reserva:', error.message);
        return { error: 'Error al eliminar reserva' };
    }
};

module.exports = reservaCtl;