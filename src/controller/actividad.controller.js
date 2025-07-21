const orm = require('../Database/dataBase.orm');
const sql = require('../Database/dataBase.sql');
const mongo = require('../Database/dataBaseMongose');

const actividadCtl = {};

// Obtener todas las actividades
actividadCtl.obtenerActividades = async (req, res) => {
    try {
        const [listaActividades] = await sql.promise().query(`
            SELECT * FROM actividades
        `);

        const actividadesCompletas = await Promise.all(
            listaActividades.map(async (actividad) => {
                const actividadMongo = await mongo.Actividad.findOne({
                    id_log: actividad.idLog // Asegurarse de que el campo de unión sea correcto
                });
                return {
                    ...actividad,
                    detallesMongo: actividadMongo
                };
            })
        );

        res.flash('success', 'Actividades obtenidas exitosamente');
        return res.apiResponse(actividadesCompletas, 200, 'Actividades obtenidas exitosamente');
    } catch (error) {
        console.error('Error al obtener actividades:', error);
        res.flash('error', 'Error al obtener actividades');
        return res.apiError('Error interno del servidor', 500);
    }
};

// Obtener una actividad por ID
actividadCtl.obtenerActividad = async (req, res) => {
    try {
        const { id } = req.params;

        const [actividad] = await sql.promise().query(`
            SELECT * FROM actividades WHERE idLog = ?
        `, [id]);

        if (actividad.length === 0) {
            res.flash('error', 'Actividad no encontrada');
            return res.apiError('Actividad no encontrada', 404);
        }

        const actividadMongo = await mongo.Actividad.findOne({
            id_log: parseInt(id)
        });

        const actividadCompleta = {
            ...actividad[0],
            detallesMongo: actividadMongo
        };

        res.flash('success', 'Actividad obtenida exitosamente');
        return res.apiResponse(actividadCompleta, 200, 'Actividad obtenida exitosamente');
    } catch (error) {
        console.error('Error al obtener actividad:', error);
        res.flash('error', 'Error al obtener actividad');
        return res.apiError('Error interno del servidor', 500);
    }
};

// Crear nueva actividad
actividadCtl.crearActividad = async (req, res) => {
    try {
        const { usuarioId, accion, tablaAfectada, stateLog, ciudad, pais } = req.body;

        // Validar campos requeridos antes de la creación
        if (!usuarioId || !accion || !tablaAfectada || !stateLog) {
            res.flash('error', 'Faltan campos requeridos para crear la actividad SQL.');
            return res.apiError('Faltan campos requeridos para crear la actividad SQL.', 400);
        }

        // Crear en SQL
        const datosSql = {
            usuarioId,
            accion,
            tablaAfectada,
            stateLog,
            createLog: new Date().toLocaleString()
        };

        const nuevaActividad = await orm.actividad.create(datosSql);
        const idLog = nuevaActividad.idLog;

        // Crear en MongoDB
        const fechaActual = new Date();
        const datosMongo = {
            id_log: idLog,
            fecha: fechaActual.toLocaleDateString(),
            hora: fechaActual.toLocaleTimeString(),
            ciudad: ciudad || 'N/A', // Usar 'ciudad' del body
            pais: pais || 'N/A'     // Usar 'pais' del body
        };

        await mongo.Actividad.create(datosMongo);

        res.flash('success', 'Actividad creada exitosamente');
        return res.apiResponse(
            { idLog },
            201,
            'Actividad creada exitosamente'
        );
    } catch (error) {
        console.error('Error al crear actividad:', error);
        res.flash('error', 'Error al crear la actividad');
        return res.apiError('Error al crear la actividad', 500);
    }
};

// Actualizar actividad
actividadCtl.actualizarActividad = async (req, res) => {
    try {
        const { id } = req.params;
        const { usuarioId, accion, tablaAfectada, stateLog, ciudad, pais } = req.body;

        // Verificar existencia en SQL
        const [actividadExistente] = await sql.promise().query(`
 SELECT * FROM actividades WHERE idLog = ?
 `, [id]);

        if (actividadExistente.length === 0) {
            res.flash('error', 'Actividad no encontrada');
            return res.apiError('Actividad no encontrada', 404);
        }

        // Actualizar en SQL
        const datosActualizacion = {
            usuarioId: usuarioId !== undefined ? usuarioId : actividadExistente[0].usuarioId,
            accion: accion !== undefined ? accion : actividadExistente[0].accion,
            tablaAfectada: tablaAfectada !== undefined ? tablaAfectada : actividadExistente[0].tablaAfectada,
            stateLog: stateLog !== undefined ? stateLog : actividadExistente[0].stateLog,
            updateLog: new Date().toLocaleString()
        };

        await orm.actividad.update(datosActualizacion, {
            where: { idLog: id }
        });

        // Actualizar en MongoDB
        const fechaActual = new Date();
        const datosMongoActualizacion = {
            fecha: fechaActual.toLocaleDateString(),
            hora: fechaActual.toLocaleTimeString(),
            ciudad: ciudad !== undefined ? ciudad : actividadExistente[0].ciudad, // Usar 'ciudad' del body
            pais: pais !== undefined ? pais : actividadExistente[0].pais       // Usar 'pais' del body
        };

        await mongo.Actividad.findOneAndUpdate(
            { id_log: parseInt(id) },
            datosMongoActualizacion
        );

        res.flash('success', 'Actividad actualizada exitosamente');
        return res.apiResponse(
            { idLog: id },
            200,
            'Actividad actualizada exitosamente'
        );
    } catch (error) {
        console.error('Error al actualizar actividad:', error);
        res.flash('error', 'Error al actualizar la actividad');
        return res.apiError('Error al actualizar la actividad', 500);
    }
};

// Eliminar actividad
actividadCtl.eliminarActividad = async (req, res) => {
    try {
        const { id } = req.params;

        // Verificar existencia en SQL
        const [actividadExistente] = await sql.promise().query(`
 SELECT * FROM actividades WHERE idLog = ?
`, [id]);

        if (actividadExistente.length === 0) {
            res.flash('error', 'Actividad no encontrada');
            return res.apiError('Actividad no encontrada', 404);
        }

        // Eliminar en SQL
        await orm.actividad.destroy({
            where: { idLog: id }
        });

        // Eliminar en MongoDB
        await mongo.Actividad.findOneAndDelete({ id_log: parseInt(id) });

        res.flash('success', 'Actividad eliminada exitosamente');
        return res.apiResponse(
            null,
            200,
            'Actividad eliminada exitosamente'
        );
    } catch (error) {
        console.error('Error al eliminar actividad:', error);
        res.flash('error', 'Error al eliminar la actividad');
        return res.apiError('Error al eliminar el cliente', 500);
    }
};

module.exports = actividadCtl;
