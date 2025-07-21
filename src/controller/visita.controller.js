const orm = require('../Database/dataBase.orm');
const sql = require('../Database/dataBase.sql');
const mongo = require('../Database/dataBaseMongose'); // Asegúrate de que este archivo exporta 'Visita'

const visitaCtl = {};

// Obtener todas las visitas
visitaCtl.obtenerVisitas = async (req, res) => {
    try {
        // Consultar todas las visitas desde la base de datos SQL
        const [listaVisitas] = await sql.promise().query(`
            SELECT * FROM visitas
        `);

        // Para cada visita SQL, buscar su contraparte en MongoDB
        const visitasCompletas = await Promise.all(
            listaVisitas.map(async (visita) => {
                // Asumiendo que idVisita en SQL se mapea a id_visitaSql en MongoDB
                const visitaMongo = await mongo.Visita.findOne({ 
                    id_visitaSql: visita.idVisita.toString() // Convertir a string para coincidir con el tipo en Mongo
                });
                return {
                    ...visita,
                    detallesMongo: visitaMongo
                };
            })
        );

        // Establecer mensaje flash de éxito y enviar respuesta API
        res.flash('success', 'Visitas obtenidas exitosamente');
        return res.apiResponse(visitasCompletas, 200, 'Visitas obtenidas exitosamente');
    } catch (error) {
        // Capturar y registrar errores, establecer mensaje flash de error y enviar respuesta API de error
        console.error('Error al obtener visitas:', error);
        res.flash('error', 'Error al obtener visitas');
        return res.apiError('Error interno del servidor al obtener visitas', 500);
    }
};

// Obtener una visita por ID
visitaCtl.obtenerVisita = async (req, res) => {
    try {
        const { id } = req.params;

        // Consultar la visita por ID desde la base de datos SQL
        const [visita] = await sql.promise().query(`
            SELECT * FROM visitas WHERE idVisita = ?
        `, [id]);

        // Si no se encuentra la visita en SQL, enviar error 404
        if (visita.length === 0) {
            res.flash('error', 'Visita no encontrada');
            return res.apiError('Visita no encontrada', 404);
        }

        // Buscar la visita correspondiente en MongoDB
        const visitaMongo = await mongo.Visita.findOne({ 
            id_visitaSql: id.toString() // Asegurarse de que el ID sea string para la búsqueda en Mongo
        });

        // Combinar los datos de SQL y MongoDB
        const visitaCompleta = {
            ...visita[0],
            detallesMongo: visitaMongo
        };

        // Establecer mensaje flash de éxito y enviar respuesta API
        res.flash('success', 'Visita obtenida exitosamente');
        return res.apiResponse(visitaCompleta, 200, 'Visita obtenida exitosamente');
    } catch (error) {
        // Capturar y registrar errores, establecer mensaje flash de error y enviar respuesta API de error
        console.error('Error al obtener visita:', error);
        res.flash('error', 'Error al obtener visita');
        return res.apiError('Error interno del servidor al obtener la visita', 500);
    }
};

// Crear nueva visita
visitaCtl.crearVisita = async (req, res) => {
    try {
        const { fecha_visita, responsable, ubicacion, observacion } = req.body;

        const currentTime = new Date().toLocaleString();

        // Crear la visita en SQL (solo campos SQL)
        const datosSql = {
            stateVisita: 'activa', // Estado por defecto para la visita
            createVisita: currentTime, // Campo de fecha de creación en SQL
            updateVisita: currentTime // Inicialmente igual a create
        };
        
        const nuevaVisitaSql = await orm.visita.create(datosSql);
        const idVisita = nuevaVisitaSql.idVisita; // Obtener el ID generado por SQL

        // Crear la visita en MongoDB, vinculándola con el ID de SQL
        const datosMongo = {
            id_visitaSql: idVisita.toString(), // Convertir a string para el ID de Mongo
            fecha_visita: fecha_visita || currentTime, // Usar fecha_visita del body o la actual
            responsable: responsable || '',
            ubicacion: ubicacion || '',
            observacion: observacion || ''
        };
        
        await mongo.Visita.create(datosMongo);

        // Establecer mensaje flash de éxito y enviar respuesta API
        res.flash('success', 'Visita creada exitosamente');
        return res.apiResponse(
            { idVisita }, 
            201, 
            'Visita creada exitosamente'
        );
    } catch (error) {
        // Capturar y registrar errores, establecer mensaje flash de error y enviar respuesta API de error
        console.error('Error al crear visita:', error);
        res.flash('error', 'Error al crear la visita');
        return res.apiError('Error interno del servidor al crear la visita', 500);
    }
};

// Actualizar visita
visitaCtl.actualizarVisita = async (req, res) => {
    try {
        const { id } = req.params;
        const { stateVisita, fecha_visita, responsable, ubicacion, observacion } = req.body;

        // Verificar la existencia de la visita en SQL
        const [visitaExistenteSql] = await sql.promise().query(`
            SELECT * FROM visitas WHERE idVisita = ?
        `, [id]);

        if (visitaExistenteSql.length === 0) {
            res.flash('error', 'Visita no encontrada');
            return res.apiError('Visita no encontrada', 404);
        }

        const currentTime = new Date().toLocaleString();

        // Actualizar en SQL
        const datosActualizacionSql = {
            stateVisita: stateVisita !== undefined ? stateVisita : visitaExistenteSql[0].stateVisita,
            updateVisita: currentTime // Campo de fecha de actualización en SQL
        };
        
        await orm.visita.update(datosActualizacionSql, {
            where: { idVisita: id }
        });

        // Actualizar en MongoDB
        const datosMongoActualizacion = {};
        if (fecha_visita !== undefined) datosMongoActualizacion.fecha_visita = fecha_visita;
        if (responsable !== undefined) datosMongoActualizacion.responsable = responsable;
        if (ubicacion !== undefined) datosMongoActualizacion.ubicacion = ubicacion;
        if (observacion !== undefined) datosMongoActualizacion.observacion = observacion;

        await mongo.Visita.findOneAndUpdate(
            { id_visitaSql: id.toString() }, // Asegurarse de que el ID sea string para la búsqueda en Mongo
            datosMongoActualizacion,
            { new: true } // Para devolver el documento actualizado
        );

        // Establecer mensaje flash de éxito y enviar respuesta API
        res.flash('success', 'Visita actualizada exitosamente');
        return res.apiResponse(
            { idVisita: id }, 
            200, 
            'Visita actualizada exitosamente'
        );
    } catch (error) {
        // Capturar y registrar errores, establecer mensaje flash de error y enviar respuesta API de error
        console.error('Error al actualizar visita:', error);
        res.flash('error', 'Error al actualizar la visita');
        return res.apiError('Error interno del servidor al actualizar la visita', 500);
    }
};

// Eliminar visita
visitaCtl.eliminarVisita = async (req, res) => {
    try {
        const { id } = req.params;

        // Verificar la existencia de la visita en SQL
        const [visitaExistenteSql] = await sql.promise().query(`
            SELECT * FROM visitas WHERE idVisita = ?
        `, [id]);

        if (visitaExistenteSql.length === 0) {
            res.flash('error', 'Visita no encontrada');
            return res.apiError('Visita no encontrada', 404);
        }

        // Eliminar en SQL
        await orm.visita.destroy({
            where: { idVisita: id }
        });

        // Eliminar en MongoDB
        await mongo.Visita.findOneAndDelete({ id_visitaSql: id.toString() }); // Asegurarse de que el ID sea string para la búsqueda en Mongo

        // Establecer mensaje flash de éxito y enviar respuesta API
        res.flash('success', 'Visita eliminada exitosamente');
        return res.apiResponse(
            null, 
            200, 
            'Visita eliminada exitosamente'
        );
    } catch (error) {
        // Capturar y registrar errores, establecer mensaje flash de error y enviar respuesta API de error
        console.error('Error al eliminar visita:', error);
        res.flash('error', 'Error al eliminar la visita');
        return res.apiError('Error interno del servidor al eliminar la visita', 500);
    }
};

module.exports = visitaCtl;
