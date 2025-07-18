const notificacionCtl = {};
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

// Mostrar todas las notificaciones (MySQL + MongoDB)
notificacionCtl.mostrarNotificaciones = async (req, res) => {
    try {
        const [notificaciones] = await sql.promise().query('SELECT * FROM notificaciones');

        const notificacionesCompletas = [];

        for (const notificacionSql of notificaciones) {
            const notificacionMongo = await mongo.Notificacion.findOne({
                id_notificacion: notificacionSql.idNotificacion
            });

            notificacionesCompletas.push({
                mysql: notificacionSql,
                mongo: notificacionMongo || null
            });
        }

        return { notificaciones: notificacionesCompletas };
    } catch (error) {
        console.error('Error al obtener notificaciones:', error.message);
        return { error: 'Error al obtener notificaciones' };
    }
};

// Mostrar una notificación por ID (MySQL + MongoDB)
notificacionCtl.mostrarNotificacionPorId = async (req, res) => {
    const { id } = req.params;

    try {
        const [notificacionSql] = await sql.promise().query(
            'SELECT * FROM notificaciones WHERE idNotificacion = ?', [id]
        );

        if (notificacionSql.length === 0) {
            return { error: 'Notificación no encontrada en MySQL' };
        }

        const notificacionMongo = await mongo.Notificacion.findOne({
            id_notificacion: parseInt(id)
        });

        return {
            mysql: notificacionSql[0],
            mongo: notificacionMongo || null
        };
    } catch (error) {
        console.error('Error al obtener notificación:', error.message);
        return { error: 'Error al obtener notificación' };
    }
};

// Crear una notificación (MySQL + MongoDB)
notificacionCtl.crearNotificacion = async (req, res) => {
    const { usuarioId, mensaje, stateNotificacion } = req.body;

    try {
        // Crear en MySQL
        const nuevaNotificacion = {
            usuarioId,
            mensaje,
            stateNotificacion,
            createNotificacion: new Date().toLocaleString()
        };

        const resultado = await orm.notificacion.create(nuevaNotificacion);
        const idNotificacion = resultado.idNotificacion;

        // Crear en MongoDB
        const nuevaNotificacionMongo = new mongo.Notificacion({
            id_notificacion: idNotificacion,
            fecha_envio: new Date().toLocaleString(),
            leido: false // Por defecto, la notificación no está leída
        });

        await nuevaNotificacionMongo.save();

        return {
            message: 'Notificación creada con éxito',
            idNotificacion
        };
    } catch (error) {
        console.error('Error al crear notificación:', error.message);
        return { error: 'Error al crear notificación' };
    }
};

// Actualizar una notificación (MySQL + MongoDB)
notificacionCtl.actualizarNotificacion = async (req, res) => {
    const { id } = req.params;
    const { usuarioId, mensaje, stateNotificacion } = req.body;

    try {
        // Actualizar en MySQL
        const [notificacionExistente] = await sql.promise().query(
            'SELECT * FROM notificaciones WHERE idNotificacion = ?', [id]
        );

        if (notificacionExistente.length === 0) {
            return { error: 'Notificación no encontrada en MySQL' };
        }

        const notificacionActualizada = {
            usuarioId: usuarioId || notificacionExistente[0].usuarioId,
            mensaje: mensaje || notificacionExistente[0].mensaje,
            stateNotificacion: stateNotificacion || notificacionExistente[0].stateNotificacion,
            updateNotificacion: new Date().toLocaleString()
        };

        await orm.notificacion.update(notificacionActualizada, {
            where: { idNotificacion: id }
        });

        // Actualizar en MongoDB - solo fecha_envio y leido (opcional)
        const notificacionMongo = await mongo.Notificacion.findOne({
            id_notificacion: parseInt(id)
        });

        if (!notificacionMongo) {
            return { error: 'Notificación no encontrada en MongoDB' };
        }

        notificacionMongo.fecha_envio = new Date().toLocaleString(); // Actualiza la fecha de envío
        notificacionMongo.leido = req.body.leido !== undefined ? req.body.leido : notificacionMongo.leido;

        await notificacionMongo.save();

        return { message: 'Notificación actualizada con éxito', idNotificacion: id };
    } catch (error) {
        console.error('Error al actualizar notificación:', error.message);
        return { error: 'Error al actualizar notificación' };
    }
};

// Eliminar una notificación (MySQL + MongoDB)
notificacionCtl.eliminarNotificacion = async (req, res) => {
    const { id } = req.params;

    try {
        // Eliminar en MySQL
        const [notificacionExistente] = await sql.promise().query(
            'SELECT * FROM notificaciones WHERE idNotificacion = ?', [id]
        );

        if (notificacionExistente.length === 0) {
            return { error: 'Notificación no encontrada en MySQL' };
        }

        await orm.notificacion.destroy({
            where: { idNotificacion: id }
        });

        // Eliminar en MongoDB
        const notificacionMongo = await mongo.Notificacion.findOne({
            id_notificacion: parseInt(id)
        });

        if (!notificacionMongo) {
            return { error: 'Notificación no encontrada en MongoDB' };
        }

        await notificacionMongo.deleteOne();

        return { message: 'Notificación eliminada con éxito' };
    } catch (error) {
        console.error('Error al eliminar notificación:', error.message);
        return { error: 'Error al eliminar notificación' };
    }
};

module.exports = notificacionCtl;