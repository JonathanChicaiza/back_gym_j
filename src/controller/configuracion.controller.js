const orm = require('../Database/dataBase.orm');
const sql = require('../Database/dataBase.sql');
const mongo = require('../Database/dataBaseMongose');

const configuracionCtl = {};

// Obtener todas las configuraciones
configuracionCtl.obtenerConfiguraciones = async (req, res) => {
    try {
        // Consultar todas las configuraciones desde la base de datos SQL
        const [listaConfiguraciones] = await sql.promise().query(`
            SELECT * FROM configuraciones
        `);

        // Para cada configuración SQL, buscar su contraparte en MongoDB
        const configuracionesCompletas = await Promise.all(
            listaConfiguraciones.map(async (configuracion) => {
                // Asumiendo que idConfiguracion en SQL se mapea a idconfiguracionSql en MongoDB
                const configuracionMongo = await mongo.Configuracion.findOne({ 
                    idconfiguracionSql: configuracion.idConfiguracion 
                });
                return {
                    ...configuracion,
                    detallesMongo: configuracionMongo
                };
            })
        );

        // Establecer mensaje flash de éxito y enviar respuesta API
        res.flash('success', 'Configuraciones obtenidas exitosamente');
        return res.apiResponse(configuracionesCompletas, 200, 'Configuraciones obtenidas exitosamente');
    } catch (error) {
        // Capturar y registrar errores, establecer mensaje flash de error y enviar respuesta API de error
        console.error('Error al obtener configuraciones:', error);
        res.flash('error', 'Error al obtener configuraciones');
        return res.apiError('Error interno del servidor al obtener configuraciones', 500);
    }
};

// Obtener una configuración por ID
configuracionCtl.obtenerconfiguracion = async (req, res) => {
    try {
        const { id } = req.params;

        // Consultar la configuración por ID desde la base de datos SQL
        const [configuracion] = await sql.promise().query(`
            SELECT * FROM configuraciones WHERE idConfiguracion = ?
        `, [id]);

        // Si no se encuentra la configuración en SQL, enviar error 404
        if (configuracion.length === 0) {
            res.flash('error', 'Configuración no encontrada');
            return res.apiError('Configuración no encontrada', 404);
        }

        // Buscar la configuración correspondiente en MongoDB
        const configuracionMongo = await mongo.Configuracion.findOne({ 
            idconfiguracionSql: parseInt(id) 
        });

        // Combinar los datos de SQL y MongoDB
        const configuracionCompleta = {
            ...configuracion[0],
            detallesMongo: configuracionMongo
        };

        // Establecer mensaje flash de éxito y enviar respuesta API
        res.flash('success', 'Configuración obtenida exitosamente');
        return res.apiResponse(configuracionCompleta, 200, 'Configuración obtenida exitosamente');
    } catch (error) {
        // Capturar y registrar errores, establecer mensaje flash de error y enviar respuesta API de error
        console.error('Error al obtener configuración:', error);
        res.flash('error', 'Error al obtener configuración');
        return res.apiError('Error interno del servidor al obtener la configuración', 500);
    }
};

// Crear nueva configuración
configuracionCtl.crearconfiguracion = async (req, res) => {
    try {
        const { nombreConfiguracion, tipo, descripcion, estado, mision, vision, objetivos } = req.body;

        // Validar campos requeridos para la creación de la configuración en SQL
        if (!nombreConfiguracion || !tipo || !descripcion || !estado) {
            res.flash('error', 'Faltan campos requeridos para crear la configuración SQL (nombreConfiguracion, tipo, descripcion, estado).');
            return res.apiError('Faltan campos requeridos para crear la configuración SQL.', 400);
        }

        const currentTime = new Date().toLocaleString();

        // Crear la configuración en SQL
        const datosSql = {
            nombreConfiguracion,
            tipo,
            descripcion,
            estado,
            createConfiguracion: currentTime, // Campo de fecha de creación en SQL
            updateConfiguracion: currentTime // Inicialmente igual a create
        };
        
        const nuevaConfiguracionSql = await orm.configuracion.create(datosSql);
        const idConfiguracion = nuevaConfiguracionSql.idConfiguracion; // Obtener el ID generado por SQL

        // Crear la configuración en MongoDB, vinculándola con el ID de SQL
        const datosMongo = {
            idconfiguracionSql: idConfiguracion,
            mision: mision || '',
            vision: vision || '',
            objetivos: objetivos || '',
            createConfiguracion: currentTime,
            updateConfiguracion: currentTime
        };
        
        await mongo.Configuracion.create(datosMongo);

        // Establecer mensaje flash de éxito y enviar respuesta API
        res.flash('success', 'Configuración creada exitosamente');
        return res.apiResponse(
            { idConfiguracion }, 
            201, 
            'Configuración creada exitosamente'
        );
    } catch (error) {
        // Capturar y registrar errores, establecer mensaje flash de error y enviar respuesta API de error
        console.error('Error al crear configuración:', error);
        res.flash('error', 'Error al crear la configuración');
        return res.apiError('Error interno del servidor al crear la configuración', 500);
    }
};

// Actualizar configuración
configuracionCtl.actualizarconfiguracion = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombreConfiguracion, tipo, descripcion, estado, mision, vision, objetivos } = req.body;

        // Verificar la existencia de la configuración en SQL
        const [configuracionExistenteSql] = await sql.promise().query(`
            SELECT * FROM configuraciones WHERE idConfiguracion = ?
        `, [id]);

        if (configuracionExistenteSql.length === 0) {
            res.flash('error', 'Configuración no encontrada');
            return res.apiError('Configuración no encontrada', 404);
        }

        const currentTime = new Date().toLocaleString();

        // Actualizar en SQL
        const datosActualizacionSql = {
            nombreConfiguracion: nombreConfiguracion !== undefined ? nombreConfiguracion : configuracionExistenteSql[0].nombreConfiguracion,
            tipo: tipo !== undefined ? tipo : configuracionExistenteSql[0].tipo,
            descripcion: descripcion !== undefined ? descripcion : configuracionExistenteSql[0].descripcion,
            estado: estado !== undefined ? estado : configuracionExistenteSql[0].estado,
            updateConfiguracion: currentTime // Campo de fecha de actualización en SQL
        };
        
        await orm.configuracion.update(datosActualizacionSql, {
            where: { idConfiguracion: id }
        });

        // Actualizar en MongoDB
        const datosMongoActualizacion = {
            updateConfiguracion: currentTime
        };
        if (mision !== undefined) datosMongoActualizacion.mision = mision;
        if (vision !== undefined) datosMongoActualizacion.vision = vision;
        if (objetivos !== undefined) datosMongoActualizacion.objetivos = objetivos;

        await mongo.Configuracion.findOneAndUpdate(
            { idconfiguracionSql: parseInt(id) },
            datosMongoActualizacion,
            { new: true } // Para devolver el documento actualizado
        );

        // Establecer mensaje flash de éxito y enviar respuesta API
        res.flash('success', 'Configuración actualizada exitosamente');
        return res.apiResponse(
            { idConfiguracion: id }, 
            200, 
            'Configuración actualizada exitosamente'
        );
    } catch (error) {
        // Capturar y registrar errores, establecer mensaje flash de error y enviar respuesta API de error
        console.error('Error al actualizar configuración:', error);
        res.flash('error', 'Error al actualizar la configuración');
        return res.apiError('Error interno del servidor al actualizar la configuración', 500);
    }
};

// Eliminar configuración
configuracionCtl.eliminarconfiguracion = async (req, res) => {
    try {
        const { id } = req.params;

        // Verificar la existencia de la configuración en SQL
        const [configuracionExistenteSql] = await sql.promise().query(`
            SELECT * FROM configuraciones WHERE idConfiguracion = ?
        `, [id]);

        if (configuracionExistenteSql.length === 0) {
            res.flash('error', 'Configuración no encontrada');
            return res.apiError('Configuración no encontrada', 404);
        }

        // Eliminar en SQL
        await orm.configuracion.destroy({
            where: { idConfiguracion: id }
        });

        // Eliminar en MongoDB
        await mongo.Configuracion.findOneAndDelete({ idconfiguracionSql: parseInt(id) });

        // Establecer mensaje flash de éxito y enviar respuesta API
        res.flash('success', 'Configuración eliminada exitosamente');
        return res.apiResponse(
            null, 
            200, 
            'Configuración eliminada exitosamente'
        );
    } catch (error) {
        // Capturar y registrar errores, establecer mensaje flash de error y enviar respuesta API de error
        console.error('Error al eliminar configuración:', error);
        res.flash('error', 'Error al eliminar la configuración');
        return res.apiError('Error interno del servidor al eliminar la configuración', 500);
    }
};

module.exports = configuracionCtl;
