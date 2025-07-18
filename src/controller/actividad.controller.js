const actividadCtl = {};
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

// Mostrar todas las actividades (MySQL + MongoDB)
actividadCtl.mostrarActividades = async (req, res) => {
    try {
        const [actividades] = await sql.promise().query('SELECT * FROM actividades');

        const actividadesCompletas = [];

        for (const actividadSql of actividades) {
            const actividadMongo = await mongo.Actividad.findOne({
                id_log: actividadSql.idLog
            });

            actividadesCompletas.push({
                mysql: actividadSql,
                mongo: actividadMongo || null
            });
        }

        return { actividades: actividadesCompletas };
    } catch (error) {
        console.error('Error al obtener actividades:', error.message);
        return { error: 'Error al obtener actividades' };
    }
};

// Mostrar una actividad por ID (MySQL + MongoDB)
actividadCtl.mostrarActividadPorId = async (req, res) => {
    const { id } = req.params;

    try {
        const [actividadSql] = await sql.promise().query(
            'SELECT * FROM actividades WHERE idLog = ?', [id]
        );

        if (actividadSql.length === 0) {
            return { error: 'Actividad no encontrada en MySQL' };
        }

        const actividadMongo = await mongo.Actividad.findOne({
            id_log: parseInt(id)
        });

        return {
            mysql: actividadSql[0],
            mongo: actividadMongo || null
        };
    } catch (error) {
        console.error('Error al obtener actividad:', error.message);
        return { error: 'Error al obtener actividad' };
    }
};

// Crear una actividad (MySQL + MongoDB)
actividadCtl.crearActividad = async (req, res) => {
    const { usuarioId, accion, tablaAfectada, stateLog } = req.body;

    try {
        // Crear en MySQL
        const nuevaActividad = {
            usuarioId,
            accion,
            tablaAfectada,
            stateLog,
            createLog: new Date().toLocaleString()
        };

        const resultado = await orm.actividad.create(nuevaActividad);
        const idLog = resultado.idLog;

        // Crear en MongoDB
        const nuevaActividadMongo = new mongo.Actividad({
            id_log: idLog,
            fecha_hora: new Date().toLocaleString()
        });

        await nuevaActividadMongo.save();

        return {
            message: 'Actividad creada con éxito',
            idLog
        };
    } catch (error) {
        console.error('Error al crear actividad:', error.message);
        return { error: 'Error al crear actividad' };
    }
};

// Actualizar una actividad (MySQL + MongoDB)
actividadCtl.actualizarActividad = async (req, res) => {
    const { id } = req.params;
    const { usuarioId, accion, tablaAfectada, stateLog } = req.body;

    try {
        // Actualizar en MySQL
        const [actividadExistente] = await sql.promise().query(
            'SELECT * FROM actividades WHERE idLog = ?', [id]
        );

        if (actividadExistente.length === 0) {
            return { error: 'Actividad no encontrada en MySQL' };
        }

        const actividadActualizada = {
            usuarioId: usuarioId || actividadExistente[0].usuarioId,
            accion: accion || actividadExistente[0].accion,
            tablaAfectada: tablaAfectada || actividadExistente[0].tablaAfectada,
            stateLog: stateLog || actividadExistente[0].stateLog,
            updateLog: new Date().toLocaleString()
        };

        await orm.actividad.update(actividadActualizada, {
            where: { idLog: id }
        });

        // Actualizar en MongoDB - solo fecha_hora
        const actividadMongo = await mongo.Actividad.findOne({
            id_log: parseInt(id)
        });

        if (!actividadMongo) {
            return { error: 'Actividad no encontrada en MongoDB' };
        }

        actividadMongo.fecha_hora = new Date().toLocaleString();
        await actividadMongo.save();

        return { message: 'Actividad actualizada con éxito', idLog: id };
    } catch (error) {
        console.error('Error al actualizar actividad:', error.message);
        return { error: 'Error al actualizar actividad' };
    }
};

// Eliminar una actividad (MySQL + MongoDB)
actividadCtl.eliminarActividad = async (req, res) => {
    const { id } = req.params;

    try {
        // Eliminar en MySQL
        const [actividadExistente] = await sql.promise().query(
            'SELECT * FROM actividades WHERE idLog = ?', [id]
        );

        if (actividadExistente.length === 0) {
            return { error: 'Actividad no encontrada en MySQL' };
        }

        await orm.actividad.destroy({
            where: { idLog: id }
        });

        // Eliminar en MongoDB
        const actividadMongo = await mongo.Actividad.findOne({
            id_log: parseInt(id)
        });

        if (!actividadMongo) {
            return { error: 'Actividad no encontrada en MongoDB' };
        }

        await actividadMongo.deleteOne();

        return { message: 'Actividad eliminada con éxito' };
    } catch (error) {
        console.error('Error al eliminar actividad:', error.message);
        return { error: 'Error al eliminar actividad' };
    }
};

module.exports = actividadCtl;