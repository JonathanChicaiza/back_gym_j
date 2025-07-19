// src/controller/actividad.controller.js

// Importar módulos necesarios
const orm = require('../Database/dataBase.orm'); // Sequelize para MySQL
const sql = require('../Database/dataBase.sql'); // Consultas SQL puras
const mongo = require('../Database/dataBaseMongose'); // MongoDB
const { cifrarDatos, descifrarDatos } = require('../lib/encrypDates');

// Función auxiliar para descifrar datos de forma segura
function safeDecrypt(data) {
    try {
        return descifrarDatos(data);
    } catch (error) {
        console.error('Error al descifrar datos:', error.message);
        return '';
    }
}

// =======================================================
// FUNCIONES DEL CONTROLADOR (AHORA EXPORTADAS DIRECTAMENTE)
// =======================================================

// Mostrar todas las actividades (MySQL + MongoDB)
const mostrarActividades = async (req, res) => { // Renombrada para exportación directa si se usa
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
        return res.apiResponse(actividadesCompletas, 200, 'Actividades obtenidas con éxito');
    } catch (error) {
        console.error('Error al obtener actividades:', error.message);
        return res.apiError('Error al obtener actividades', 500, error.message);
    }
};

// Obtener una actividad por ID (MySQL + MongoDB)
// RENOMBRADA: 'mostrarActividadPorId' a 'obtenerActividad' para coincidir con actividad.routes.js
const obtenerActividad = async (req, res) => {
    const { id } = req.params;

    try {
        const [actividadSql] = await sql.promise().query(
            'SELECT * FROM actividades WHERE idLog = ?', [id]
        );

        if (actividadSql.length === 0) {
            return res.apiError('Actividad no encontrada en MySQL', 404);
        }

        const actividadMongo = await mongo.Actividad.findOne({
            id_log: parseInt(id)
        });

        const actividadCompleta = {
            mysql: actividadSql[0],
            mongo: actividadMongo || null
        };
        return res.apiResponse(actividadCompleta, 200, 'Actividad obtenida con éxito');
    } catch (error) {
        console.error('Error al obtener actividad:', error.message);
        return res.apiError('Error al obtener actividad', 500, error.message);
    }
};

// Crear una actividad (MySQL + MongoDB)
const crearActividad = async (req, res) => {
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

        return res.apiResponse({ idLog }, 201, 'Actividad creada con éxito');
    } catch (error) {
        console.error('Error al crear actividad:', error.message);
        return res.apiError('Error al crear actividad', 500, error.message);
    }
};

// Actualizar una actividad (MySQL + MongoDB)
const actualizarActividad = async (req, res) => {
    const { id } = req.params;
    const { usuarioId, accion, tablaAfectada, stateLog } = req.body;

    try {
        // Actualizar en MySQL
        const [actividadExistente] = await sql.promise().query(
            'SELECT * FROM actividades WHERE idLog = ?', [id]
        );

        if (actividadExistente.length === 0) {
            return res.apiError('Actividad no encontrada en MySQL', 404);
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
            return res.apiError('Actividad no encontrada en MongoDB', 404);
        }

        actividadMongo.fecha_hora = new Date().toLocaleString();
        await actividadMongo.save();

        return res.apiResponse({ idLog: id }, 200, 'Actividad actualizada con éxito');
    } catch (error) {
        console.error('Error al actualizar actividad:', error.message);
        return res.apiError('Error al actualizar actividad', 500, error.message);
    }
};

// Eliminar una actividad (MySQL + MongoDB)
const eliminarActividad = async (req, res) => {
    const { id } = req.params;

    try {
        // Eliminar en MySQL
        const [actividadExistente] = await sql.promise().query(
            'SELECT * FROM actividades WHERE idLog = ?', [id]
        );

        if (actividadExistente.length === 0) {
            return res.apiError('Actividad no encontrada en MySQL', 404);
        }

        await orm.actividad.destroy({
            where: { idLog: id }
        });

        // Eliminar en MongoDB
        const actividadMongo = await mongo.Actividad.findOne({
            id_log: parseInt(id)
        });

        if (!actividadMongo) {
            return res.apiError('Actividad no encontrada en MongoDB', 404);
        }

        await actividadMongo.deleteOne();

        return res.apiResponse(null, 200, 'Actividad eliminada con éxito');
    } catch (error) {
        console.error('Error al eliminar actividad:', error.message);
        return res.apiError('Error al eliminar actividad', 500, error.message);
    }
};

// Exportar las funciones directamente para que puedan ser desestructuradas en las rutas
module.exports = {
    mostrarActividades, // Si se usa en alguna otra ruta
    obtenerActividad,
    crearActividad,
    actualizarActividad,
    eliminarActividad
};
