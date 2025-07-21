const orm = require('../Database/dataBase.orm');
const sql = require('../Database/dataBase.sql');
const mongo = require('../Database/dataBaseMongose');

const membresiaCtl = {};

// Obtener todas las membresías
membresiaCtl.obtenerMembresias = async (req, res) => {
    try {
        // Consultar todas las membresías desde la base de datos SQL
        const [listaMembresias] = await sql.promise().query(`
            SELECT * FROM membresias
        `);

        // Para cada membresía SQL, buscar su contraparte en MongoDB
        const membresiasCompletas = await Promise.all(
            listaMembresias.map(async (membresia) => {
                // Asumiendo que idMembresia en SQL se mapea a id_membresiaSql en MongoDB
                const membresiaMongo = await mongo.Membresia.findOne({ 
                    id_membresiaSql: membresia.idMembresia 
                });
                return {
                    ...membresia,
                    detallesMongo: membresiaMongo
                };
            })
        );

        // Establecer mensaje flash de éxito y enviar respuesta API
        res.flash('success', 'Membresías obtenidas exitosamente');
        return res.apiResponse(membresiasCompletas, 200, 'Membresías obtenidas exitosamente');
    } catch (error) {
        // Capturar y registrar errores, establecer mensaje flash de error y enviar respuesta API de error
        console.error('Error al obtener membresías:', error);
        res.flash('error', 'Error al obtener membresías');
        return res.apiError('Error interno del servidor al obtener membresías', 500);
    }
};

// Obtener una membresía por ID
membresiaCtl.obtenerMembresia = async (req, res) => {
    try {
        const { id } = req.params;

        // Consultar la membresía por ID desde la base de datos SQL
        const [membresia] = await sql.promise().query(`
            SELECT * FROM membresias WHERE idMembresia = ?
        `, [id]);

        // Si no se encuentra la membresía en SQL, enviar error 404
        if (membresia.length === 0) {
            res.flash('error', 'Membresía no encontrada');
            return res.apiError('Membresía no encontrada', 404);
        }

        // Buscar la membresía correspondiente en MongoDB
        const membresiaMongo = await mongo.Membresia.findOne({ 
            id_membresiaSql: parseInt(id) 
        });

        // Combinar los datos de SQL y MongoDB
        const membresiaCompleta = {
            ...membresia[0],
            detallesMongo: membresiaMongo
        };

        // Establecer mensaje flash de éxito y enviar respuesta API
        res.flash('success', 'Membresía obtenida exitosamente');
        return res.apiResponse(membresiaCompleta, 200, 'Membresía obtenida exitosamente');
    } catch (error) {
        // Capturar y registrar errores, establecer mensaje flash de error y enviar respuesta API de error
        console.error('Error al obtener membresía:', error);
        res.flash('error', 'Error al obtener membresía');
        return res.apiError('Error interno del servidor al obtener la membresía', 500);
    }
};

// Crear nueva membresía
membresiaCtl.crearMembresia = async (req, res) => {
    try {
        const { nombre, precio, duracionDias, descripcion, beneficios, historial_uso, acceso_recursos } = req.body;

        // Validar campos requeridos para la creación de la membresía en SQL
        if (!nombre || !precio || !duracionDias) {
            res.flash('error', 'Faltan campos requeridos para crear la membresía SQL (nombre, precio, duracionDias).');
            return res.apiError('Faltan campos requeridos para crear la membresía SQL.', 400);
        }

        const currentTime = new Date().toLocaleString();

        // Crear la membresía en SQL
        const datosSql = {
            nombre,
            precio,
            duracionDias,
            stateMembresia: 'activa', // Estado por defecto
            createMembresia: currentTime, // Campo de fecha de creación en SQL
            updateMembresia: currentTime // Inicialmente igual a create
        };
        
        const nuevaMembresiaSql = await orm.membresia.create(datosSql);
        const idMembresia = nuevaMembresiaSql.idMembresia; // Obtener el ID generado por SQL

        // Crear la membresía en MongoDB, vinculándola con el ID de SQL
        const datosMongo = {
            id_membresiaSql: idMembresia,
            descripcion: descripcion || '',
            beneficios: beneficios || '',
            historial_uso: historial_uso || '',
            acceso_recursos: acceso_recursos || ''
        };
        
        await mongo.Membresia.create(datosMongo);

        // Establecer mensaje flash de éxito y enviar respuesta API
        res.flash('success', 'Membresía creada exitosamente');
        return res.apiResponse(
            { idMembresia }, 
            201, 
            'Membresía creada exitosamente'
        );
    } catch (error) {
        // Capturar y registrar errores, establecer mensaje flash de error y enviar respuesta API de error
        console.error('Error al crear membresía:', error);
        res.flash('error', 'Error al crear la membresía');
        return res.apiError('Error interno del servidor al crear la membresía', 500);
    }
};

// Actualizar membresía
membresiaCtl.actualizarMembresia = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, precio, duracionDias, stateMembresia, descripcion, beneficios, historial_uso, acceso_recursos } = req.body;

        // Verificar la existencia de la membresía en SQL
        const [membresiaExistenteSql] = await sql.promise().query(`
            SELECT * FROM membresias WHERE idMembresia = ?
        `, [id]);

        if (membresiaExistenteSql.length === 0) {
            res.flash('error', 'Membresía no encontrada');
            return res.apiError('Membresía no encontrada', 404);
        }

        const currentTime = new Date().toLocaleString();

        // Actualizar en SQL
        const datosActualizacionSql = {
            nombre: nombre !== undefined ? nombre : membresiaExistenteSql[0].nombre,
            precio: precio !== undefined ? precio : membresiaExistenteSql[0].precio,
            duracionDias: duracionDias !== undefined ? duracionDias : membresiaExistenteSql[0].duracionDias,
            stateMembresia: stateMembresia !== undefined ? stateMembresia : membresiaExistenteSql[0].stateMembresia,
            updateMembresia: currentTime // Campo de fecha de actualización en SQL
        };
        
        await orm.membresia.update(datosActualizacionSql, {
            where: { idMembresia: id }
        });

        // Actualizar en MongoDB
        const datosMongoActualizacion = {};
        if (descripcion !== undefined) datosMongoActualizacion.descripcion = descripcion;
        if (beneficios !== undefined) datosMongoActualizacion.beneficios = beneficios;
        if (historial_uso !== undefined) datosMongoActualizacion.historial_uso = historial_uso;
        if (acceso_recursos !== undefined) datosMongoActualizacion.acceso_recursos = acceso_recursos;

        await mongo.Membresia.findOneAndUpdate(
            { id_membresiaSql: parseInt(id) },
            datosMongoActualizacion,
            { new: true } // Para devolver el documento actualizado
        );

        // Establecer mensaje flash de éxito y enviar respuesta API
        res.flash('success', 'Membresía actualizada exitosamente');
        return res.apiResponse(
            { idMembresia: id }, 
            200, 
            'Membresía actualizada exitosamente'
        );
    } catch (error) {
        // Capturar y registrar errores, establecer mensaje flash de error y enviar respuesta API de error
        console.error('Error al actualizar membresía:', error);
        res.flash('error', 'Error al actualizar la membresía');
        return res.apiError('Error interno del servidor al actualizar la membresía', 500);
    }
};

// Eliminar membresía
membresiaCtl.eliminarMembresia = async (req, res) => {
    try {
        const { id } = req.params;

        // Verificar la existencia de la membresía en SQL
        const [membresiaExistenteSql] = await sql.promise().query(`
            SELECT * FROM membresias WHERE idMembresia = ?
        `, [id]);

        if (membresiaExistenteSql.length === 0) {
            res.flash('error', 'Membresía no encontrada');
            return res.apiError('Membresía no encontrada', 404);
        }

        // Eliminar en SQL
        await orm.membresia.destroy({
            where: { idMembresia: id }
        });

        // Eliminar en MongoDB
        await mongo.Membresia.findOneAndDelete({ id_membresiaSql: parseInt(id) });

        // Establecer mensaje flash de éxito y enviar respuesta API
        res.flash('success', 'Membresía eliminada exitosamente');
        return res.apiResponse(
            null, 
            200, 
            'Membresía eliminada exitosamente'
        );
    } catch (error) {
        // Capturar y registrar errores, establecer mensaje flash de error y enviar respuesta API de error
        console.error('Error al eliminar membresía:', error);
        res.flash('error', 'Error al eliminar la membresía');
        return res.apiError('Error interno del servidor al eliminar la membresía', 500);
    }
};

module.exports = membresiaCtl;
