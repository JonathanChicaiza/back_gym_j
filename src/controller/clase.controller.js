const orm = require('../Database/dataBase.orm');
const sql = require('../Database/dataBase.sql');
const mongo = require('../Database/dataBaseMongose');

const claseCtl = {};

// Obtener todas las clases
claseCtl.obtenerClases = async (req, res) => {
    try {
        // Consultar todas las clases desde la base de datos SQL
        const [listaClases] = await sql.promise().query(`
            SELECT * FROM clases
        `);

        // Para cada clase SQL, buscar su contraparte en MongoDB
        const clasesCompletas = await Promise.all(
            listaClases.map(async (clase) => {
                // Asumiendo que idClase en SQL se mapea a id_claseSql en MongoDB
                const claseMongo = await mongo.Clase.findOne({ 
                    id_claseSql: clase.idClase 
                });
                return {
                    ...clase,
                    detallesMongo: claseMongo
                };
            })
        );

        // Establecer mensaje flash de éxito y enviar respuesta API
        res.flash('success', 'Clases obtenidas exitosamente');
        return res.apiResponse(clasesCompletas, 200, 'Clases obtenidas exitosamente');
    } catch (error) {
        // Capturar y registrar errores, establecer mensaje flash de error y enviar respuesta API de error
        console.error('Error al obtener clases:', error);
        res.flash('error', 'Error al obtener clases');
        return res.apiError('Error interno del servidor al obtener clases', 500);
    }
};

// Obtener una clase por ID
claseCtl.obtenerClase = async (req, res) => {
    try {
        const { id } = req.params;

        // Consultar la clase por ID desde la base de datos SQL
        const [clase] = await sql.promise().query(`
            SELECT * FROM clases WHERE idClase = ?
        `, [id]);

        // Si no se encuentra la clase en SQL, enviar error 404
        if (clase.length === 0) {
            res.flash('error', 'Clase no encontrada');
            return res.apiError('Clase no encontrada', 404);
        }

        // Buscar la clase correspondiente en MongoDB
        const claseMongo = await mongo.Clase.findOne({ 
            id_claseSql: parseInt(id) 
        });

        // Combinar los datos de SQL y MongoDB
        const claseCompleta = {
            ...clase[0],
            detallesMongo: claseMongo
        };

        // Establecer mensaje flash de éxito y enviar respuesta API
        res.flash('success', 'Clase obtenida exitosamente');
        return res.apiResponse(claseCompleta, 200, 'Clase obtenida exitosamente');
    } catch (error) {
        // Capturar y registrar errores, establecer mensaje flash de error y enviar respuesta API de error
        console.error('Error al obtener clase:', error);
        res.flash('error', 'Error al obtener clase');
        return res.apiError('Error interno del servidor al obtener la clase', 500);
    }
};

// Crear nueva clase
claseCtl.crearClase = async (req, res) => {
    try {
        const { nombre, capacidadMaxima, horario, descripcion, estadistica, categoria } = req.body;

        // Validar campos requeridos para la creación de la clase en SQL
        if (!nombre || !capacidadMaxima || !horario) {
            res.flash('error', 'Faltan campos requeridos para crear la clase SQL (nombre, capacidadMaxima, horario).');
            return res.apiError('Faltan campos requeridos para crear la clase SQL.', 400);
        }

        // Crear la clase en SQL
        const datosSql = {
            nombre,
            capacidadMaxima,
            horario,
            stateClase: 'activa', // Estado por defecto
            createClase: new Date().toLocaleString() // Campo de fecha de creación en SQL
        };
        
        const nuevaClaseSql = await orm.clase.create(datosSql);
        const idClase = nuevaClaseSql.idClase; // Obtener el ID generado por SQL

        // Crear la clase en MongoDB, vinculándola con el ID de SQL
        const datosMongo = {
            id_claseSql: idClase,
            descripcion: descripcion || '',
            estadistica: estadistica || '',
            categoria: categoria || '',
            ultima_modificacion: new Date().toLocaleString()
        };
        
        await mongo.Clase.create(datosMongo);

        // Establecer mensaje flash de éxito y enviar respuesta API
        res.flash('success', 'Clase creada exitosamente');
        return res.apiResponse(
            { idClase }, 
            201, 
            'Clase creada exitosamente'
        );
    } catch (error) {
        // Capturar y registrar errores, establecer mensaje flash de error y enviar respuesta API de error
        console.error('Error al crear clase:', error);
        res.flash('error', 'Error al crear la clase');
        return res.apiError('Error interno del servidor al crear la clase', 500);
    }
};

// Actualizar clase
claseCtl.actualizarClase = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, capacidadMaxima, horario, descripcion, estadistica, categoria } = req.body;

        // Verificar la existencia de la clase en SQL
        const [claseExistenteSql] = await sql.promise().query(`
            SELECT * FROM clases WHERE idClase = ?
        `, [id]);

        if (claseExistenteSql.length === 0) {
            res.flash('error', 'Clase no encontrada');
            return res.apiError('Clase no encontrada', 404);
        }

        // Actualizar en SQL
        const datosActualizacionSql = {
            nombre: nombre !== undefined ? nombre : claseExistenteSql[0].nombre,
            capacidadMaxima: capacidadMaxima !== undefined ? capacidadMaxima : claseExistenteSql[0].capacidadMaxima,
            horario: horario !== undefined ? horario : claseExistenteSql[0].horario,
            updateClase: new Date().toLocaleString() // Campo de fecha de actualización en SQL
        };
        
        await orm.clase.update(datosActualizacionSql, {
            where: { idClase: id }
        });

        // Actualizar en MongoDB
        const datosMongoActualizacion = {
            ultima_modificacion: new Date().toLocaleString()
        };
        if (descripcion !== undefined) datosMongoActualizacion.descripcion = descripcion;
        if (estadistica !== undefined) datosMongoActualizacion.estadistica = estadistica;
        if (categoria !== undefined) datosMongoActualizacion.categoria = categoria;

        await mongo.Clase.findOneAndUpdate(
            { id_claseSql: parseInt(id) },
            datosMongoActualizacion,
            { new: true } // Para devolver el documento actualizado
        );

        // Establecer mensaje flash de éxito y enviar respuesta API
        res.flash('success', 'Clase actualizada exitosamente');
        return res.apiResponse(
            { idClase: id }, 
            200, 
            'Clase actualizada exitosamente'
        );
    } catch (error) {
        // Capturar y registrar errores, establecer mensaje flash de error y enviar respuesta API de error
        console.error('Error al actualizar clase:', error);
        res.flash('error', 'Error al actualizar la clase');
        return res.apiError('Error interno del servidor al actualizar la clase', 500);
    }
};

// Eliminar clase
claseCtl.eliminarClase = async (req, res) => {
    try {
        const { id } = req.params;

        // Verificar la existencia de la clase en SQL
        const [claseExistenteSql] = await sql.promise().query(`
            SELECT * FROM clases WHERE idClase = ?
        `, [id]);

        if (claseExistenteSql.length === 0) {
            res.flash('error', 'Clase no encontrada');
            return res.apiError('Clase no encontrada', 404);
        }

        // Eliminar en SQL
        await orm.clase.destroy({
            where: { idClase: id }
        });

        // Eliminar en MongoDB
        await mongo.Clase.findOneAndDelete({ id_claseSql: parseInt(id) });

        // Establecer mensaje flash de éxito y enviar respuesta API
        res.flash('success', 'Clase eliminada exitosamente');
        return res.apiResponse(
            null, 
            200, 
            'Clase eliminada exitosamente'
        );
    } catch (error) {
        // Capturar y registrar errores, establecer mensaje flash de error y enviar respuesta API de error
        console.error('Error al eliminar clase:', error);
        res.flash('error', 'Error al eliminar la clase');
        return res.apiError('Error interno del servidor al eliminar la clase', 500);
    }
};

module.exports = claseCtl;
