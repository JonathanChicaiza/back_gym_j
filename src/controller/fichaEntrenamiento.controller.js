const orm = require('../Database/dataBase.orm');
const sql = require('../Database/dataBase.sql');
const mongo = require('../Database/dataBaseMongose');

const fichaEntrenamientoCtl = {};

// Obtener todas las fichas de entrenamiento
fichaEntrenamientoCtl.obtenerFichas = async (req, res) => {
    try {
        // Consultar todas las fichas desde la base de datos SQL
        const [listaFichas] = await sql.promise().query(`
            SELECT * FROM fichas_entrenamiento
        `);

        // Para cada ficha SQL, buscar su contraparte en MongoDB
        const fichasCompletas = await Promise.all(
            listaFichas.map(async (ficha) => {
                // Asumiendo que idFicha en SQL se mapea a id_fichaSql en MongoDB
                const fichaMongo = await mongo.Ficha.findOne({ 
                    id_fichaSql: ficha.idFicha 
                });
                return {
                    ...ficha,
                    detallesMongo: fichaMongo
                };
            })
        );

        // Establecer mensaje flash de éxito y enviar respuesta API
        res.flash('success', 'Fichas de entrenamiento obtenidas exitosamente');
        return res.apiResponse(fichasCompletas, 200, 'Fichas de entrenamiento obtenidas exitosamente');
    } catch (error) {
        // Capturar y registrar errores, establecer mensaje flash de error y enviar respuesta API de error
        console.error('Error al obtener fichas de entrenamiento:', error);
        res.flash('error', 'Error al obtener fichas de entrenamiento');
        return res.apiError('Error interno del servidor al obtener fichas de entrenamiento', 500);
    }
};

// Obtener una ficha de entrenamiento por ID
fichaEntrenamientoCtl.obtenerFicha = async (req, res) => {
    try {
        const { id } = req.params;

        // Consultar la ficha por ID desde la base de datos SQL
        const [ficha] = await sql.promise().query(`
            SELECT * FROM fichas_entrenamiento WHERE idFicha = ?
        `, [id]);

        // Si no se encuentra la ficha en SQL, enviar error 404
        if (ficha.length === 0) {
            res.flash('error', 'Ficha de entrenamiento no encontrada');
            return res.apiError('Ficha de entrenamiento no encontrada', 404);
        }

        // Buscar la ficha correspondiente en MongoDB
        const fichaMongo = await mongo.Ficha.findOne({ 
            id_fichaSql: parseInt(id) 
        });

        // Combinar los datos de SQL y MongoDB
        const fichaCompleta = {
            ...ficha[0],
            detallesMongo: fichaMongo
        };

        // Establecer mensaje flash de éxito y enviar respuesta API
        res.flash('success', 'Ficha de entrenamiento obtenida exitosamente');
        return res.apiResponse(fichaCompleta, 200, 'Ficha de entrenamiento obtenida exitosamente');
    } catch (error) {
        // Capturar y registrar errores, establecer mensaje flash de error y enviar respuesta API de error
        console.error('Error al obtener ficha de entrenamiento:', error);
        res.flash('error', 'Error al obtener ficha de entrenamiento');
        return res.apiError('Error interno del servidor al obtener la ficha de entrenamiento', 500);
    }
};

// Crear nueva ficha de entrenamiento
fichaEntrenamientoCtl.crearFicha = async (req, res) => {
    try {
        const { descripcion, fecha_creacion, nivel_dificulta, rutina, duracion_minutos } = req.body;

        const currentTime = new Date().toLocaleString();

        // Crear la ficha en SQL
        // El modelo SQL solo tiene stateFicha, createFicha, updateFicha además de idFicha.
        // Asumimos que stateFicha es 'activa' por defecto.
        const datosSql = {
            stateFicha: 'activa', // Estado por defecto
            createFicha: currentTime, // Campo de fecha de creación en SQL
            updateFicha: currentTime // Inicialmente igual a create
        };
        
        const nuevaFichaSql = await orm.fichaEntrenamiento.create(datosSql);
        const idFicha = nuevaFichaSql.idFicha; // Obtener el ID generado por SQL

        // Crear la ficha en MongoDB, vinculándola con el ID de SQL
        const datosMongo = {
            id_fichaSql: idFicha,
            descripcion: descripcion || '',
            fecha_creacion: fecha_creacion || currentTime, // Usar fecha_creacion del body o la actual
            nivel_dificulta: nivel_dificulta || '',
            rutina: rutina || '',
            duracion_minutos: duracion_minutos || ''
        };
        
        await mongo.Ficha.create(datosMongo);

        // Establecer mensaje flash de éxito y enviar respuesta API
        res.flash('success', 'Ficha de entrenamiento creada exitosamente');
        return res.apiResponse(
            { idFicha }, 
            201, 
            'Ficha de entrenamiento creada exitosamente'
        );
    } catch (error) {
        // Capturar y registrar errores, establecer mensaje flash de error y enviar respuesta API de error
        console.error('Error al crear ficha de entrenamiento:', error);
        res.flash('error', 'Error al crear la ficha de entrenamiento');
        return res.apiError('Error interno del servidor al crear la ficha de entrenamiento', 500);
    }
};

// Actualizar ficha de entrenamiento
fichaEntrenamientoCtl.actualizarFicha = async (req, res) => {
    try {
        const { id } = req.params;
        const { stateFicha, descripcion, fecha_creacion, nivel_dificulta, rutina, duracion_minutos } = req.body;

        // Verificar la existencia de la ficha en SQL
        const [fichaExistenteSql] = await sql.promise().query(`
            SELECT * FROM fichas_entrenamiento WHERE idFicha = ?
        `, [id]);

        if (fichaExistenteSql.length === 0) {
            res.flash('error', 'Ficha de entrenamiento no encontrada');
            return res.apiError('Ficha de entrenamiento no encontrada', 404);
        }

        const currentTime = new Date().toLocaleString();

        // Actualizar en SQL
        const datosActualizacionSql = {
            stateFicha: stateFicha !== undefined ? stateFicha : fichaExistenteSql[0].stateFicha,
            updateFicha: currentTime // Campo de fecha de actualización en SQL
        };
        
        await orm.fichaEntrenamiento.update(datosActualizacionSql, {
            where: { idFicha: id }
        });

        // Actualizar en MongoDB
        const datosMongoActualizacion = {};
        if (descripcion !== undefined) datosMongoActualizacion.descripcion = descripcion;
        if (fecha_creacion !== undefined) datosMongoActualizacion.fecha_creacion = fecha_creacion;
        if (nivel_dificulta !== undefined) datosMongoActualizacion.nivel_dificulta = nivel_dificulta;
        if (rutina !== undefined) datosMongoActualizacion.rutina = rutina;
        if (duracion_minutos !== undefined) datosMongoActualizacion.duracion_minutos = duracion_minutos;

        await mongo.Ficha.findOneAndUpdate(
            { id_fichaSql: parseInt(id) },
            datosMongoActualizacion,
            { new: true } // Para devolver el documento actualizado
        );

        // Establecer mensaje flash de éxito y enviar respuesta API
        res.flash('success', 'Ficha de entrenamiento actualizada exitosamente');
        return res.apiResponse(
            { idFicha: id }, 
            200, 
            'Ficha de entrenamiento actualizada exitosamente'
        );
    } catch (error) {
        // Capturar y registrar errores, establecer mensaje flash de error y enviar respuesta API de error
        console.error('Error al actualizar ficha de entrenamiento:', error);
        res.flash('error', 'Error al actualizar la ficha de entrenamiento');
        return res.apiError('Error interno del servidor al actualizar la ficha de entrenamiento', 500);
    }
};

// Eliminar ficha de entrenamiento
fichaEntrenamientoCtl.eliminarFicha = async (req, res) => {
    try {
        const { id } = req.params;

        // Verificar la existencia de la ficha en SQL
        const [fichaExistenteSql] = await sql.promise().query(`
            SELECT * FROM fichas_entrenamiento WHERE idFicha = ?
        `, [id]);

        if (fichaExistenteSql.length === 0) {
            res.flash('error', 'Ficha de entrenamiento no encontrada');
            return res.apiError('Ficha de entrenamiento no encontrada', 404);
        }

        // Eliminar en SQL
        await orm.fichaEntrenamiento.destroy({
            where: { idFicha: id }
        });

        // Eliminar en MongoDB
        await mongo.Ficha.findOneAndDelete({ id_fichaSql: parseInt(id) });

        // Establecer mensaje flash de éxito y enviar respuesta API
        res.flash('success', 'Ficha de entrenamiento eliminada exitosamente');
        return res.apiResponse(
            null, 
            200, 
            'Ficha de entrenamiento eliminada exitosamente'
        );
    } catch (error) {
        // Capturar y registrar errores, establecer mensaje flash de error y enviar respuesta API de error
        console.error('Error al eliminar ficha de entrenamiento:', error);
        res.flash('error', 'Error al eliminar la ficha de entrenamiento');
        return res.apiError('Error interno del servidor al eliminar la ficha de entrenamiento', 500);
    }
};

module.exports = fichaEntrenamientoCtl;
