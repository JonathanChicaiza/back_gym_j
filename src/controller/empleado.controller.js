const orm = require('../Database/dataBase.orm');
const sql = require('../Database/dataBase.sql');
const mongo = require('../Database/dataBaseMongose');

const empleadoCtl = {};

// Obtener todos los empleados
empleadoCtl.obtenerEmpleados = async (req, res) => {
    try {
        // Consultar todos los empleados desde la base de datos SQL
        const [listaEmpleados] = await sql.promise().query(`
            SELECT * FROM empleados
        `);

        // Para cada empleado SQL, buscar su contraparte en MongoDB
        const empleadosCompletos = await Promise.all(
            listaEmpleados.map(async (empleado) => {
                // Asumiendo que idEmpleado en SQL se mapea a id_empleadoSql en MongoDB
                const empleadoMongo = await mongo.Empleado.findOne({ 
                    id_empleadoSql: empleado.idEmpleado 
                });
                return {
                    ...empleado,
                    detallesMongo: empleadoMongo
                };
            })
        );

        // Establecer mensaje flash de éxito y enviar respuesta API
        res.flash('success', 'Empleados obtenidos exitosamente');
        return res.apiResponse(empleadosCompletos, 200, 'Empleados obtenidos exitosamente');
    } catch (error) {
        // Capturar y registrar errores, establecer mensaje flash de error y enviar respuesta API de error
        console.error('Error al obtener empleados:', error);
        res.flash('error', 'Error al obtener empleados');
        return res.apiError('Error interno del servidor al obtener empleados', 500);
    }
};

// Obtener un empleado por ID
empleadoCtl.obtenerEmpleado = async (req, res) => {
    try {
        const { id } = req.params;

        // Consultar el empleado por ID desde la base de datos SQL
        const [empleado] = await sql.promise().query(`
            SELECT * FROM empleados WHERE idEmpleado = ?
        `, [id]);

        // Si no se encuentra el empleado en SQL, enviar error 404
        if (empleado.length === 0) {
            res.flash('error', 'Empleado no encontrado');
            return res.apiError('Empleado no encontrado', 404);
        }

        // Buscar el empleado correspondiente en MongoDB
        const empleadoMongo = await mongo.Empleado.findOne({ 
            id_empleadoSql: parseInt(id) 
        });

        // Combinar los datos de SQL y MongoDB
        const empleadoCompleto = {
            ...empleado[0],
            detallesMongo: empleadoMongo
        };

        // Establecer mensaje flash de éxito y enviar respuesta API
        res.flash('success', 'Empleado obtenido exitosamente');
        return res.apiResponse(empleadoCompleto, 200, 'Empleado obtenido exitosamente');
    } catch (error) {
        // Capturar y registrar errores, establecer mensaje flash de error y enviar respuesta API de error
        console.error('Error al obtener empleado:', error);
        res.flash('error', 'Error al obtener empleado');
        return res.apiError('Error interno del servidor al obtener el empleado', 500);
    }
};

// Crear nuevo empleado
empleadoCtl.crearEmpleado = async (req, res) => {
    try {
        const { cargo, salario, telefono, gmail, fecha_contratacion, fecha_nacimiento, pais } = req.body;

        // Validar campos requeridos para la creación del empleado en SQL
        if (!cargo || !salario || !telefono || !gmail) {
            res.flash('error', 'Faltan campos requeridos para crear el empleado SQL (cargo, salario, telefono, gmail).');
            return res.apiError('Faltan campos requeridos para crear el empleado SQL.', 400);
        }

        const currentTime = new Date().toLocaleString();

        // Crear el empleado en SQL
        const datosSql = {
            cargo,
            salario,
            telefono,
            gmail,
            stateEvaluacion: 'activo', // Estado por defecto
            createEvaluacion: currentTime, // Campo de fecha de creación en SQL
            updateEvaluacion: currentTime // Inicialmente igual a create
        };
        
        const nuevoEmpleadoSql = await orm.empleado.create(datosSql);
        const idEmpleado = nuevoEmpleadoSql.idEmpleado; // Obtener el ID generado por SQL

        // Crear el empleado en MongoDB, vinculándolo con el ID de SQL
        const datosMongo = {
            id_empleadoSql: idEmpleado,
            fecha_contratacion: fecha_contratacion || '',
            fecha_nacimiento: fecha_nacimiento || '',
            pais: pais || ''
        };
        
        await mongo.Empleado.create(datosMongo);

        // Establecer mensaje flash de éxito y enviar respuesta API
        res.flash('success', 'Empleado creado exitosamente');
        return res.apiResponse(
            { idEmpleado }, 
            201, 
            'Empleado creado exitosamente'
        );
    } catch (error) {
        // Capturar y registrar errores, establecer mensaje flash de error y enviar respuesta API de error
        console.error('Error al crear empleado:', error);
        res.flash('error', 'Error al crear el empleado');
        return res.apiError('Error interno del servidor al crear el empleado', 500);
    }
};

// Actualizar empleado
empleadoCtl.actualizarEmpleado = async (req, res) => {
    try {
        const { id } = req.params;
        const { cargo, salario, telefono, gmail, fecha_contratacion, fecha_nacimiento, pais } = req.body;

        // Verificar la existencia del empleado en SQL
        const [empleadoExistenteSql] = await sql.promise().query(`
            SELECT * FROM empleados WHERE idEmpleado = ?
        `, [id]);

        if (empleadoExistenteSql.length === 0) {
            res.flash('error', 'Empleado no encontrado');
            return res.apiError('Empleado no encontrado', 404);
        }

        const currentTime = new Date().toLocaleString();

        // Actualizar en SQL
        const datosActualizacionSql = {
            cargo: cargo !== undefined ? cargo : empleadoExistenteSql[0].cargo,
            salario: salario !== undefined ? salario : empleadoExistenteSql[0].salario,
            telefono: telefono !== undefined ? telefono : empleadoExistenteSql[0].telefono,
            gmail: gmail !== undefined ? gmail : empleadoExistenteSql[0].gmail,
            updateEvaluacion: currentTime // Campo de fecha de actualización en SQL
        };
        
        await orm.empleado.update(datosActualizacionSql, {
            where: { idEmpleado: id }
        });

        // Actualizar en MongoDB
        const datosMongoActualizacion = {};
        if (fecha_contratacion !== undefined) datosMongoActualizacion.fecha_contratacion = fecha_contratacion;
        if (fecha_nacimiento !== undefined) datosMongoActualizacion.fecha_nacimiento = fecha_nacimiento;
        if (pais !== undefined) datosMongoActualizacion.pais = pais;

        await mongo.Empleado.findOneAndUpdate(
            { id_empleadoSql: parseInt(id) },
            datosMongoActualizacion,
            { new: true } // Para devolver el documento actualizado
        );

        // Establecer mensaje flash de éxito y enviar respuesta API
        res.flash('success', 'Empleado actualizado exitosamente');
        return res.apiResponse(
            { idEmpleado: id }, 
            200, 
            'Empleado actualizado exitosamente'
        );
    } catch (error) {
        // Capturar y registrar errores, establecer mensaje flash de error y enviar respuesta API de error
        console.error('Error al actualizar empleado:', error);
        res.flash('error', 'Error al actualizar el empleado');
        return res.apiError('Error interno del servidor al actualizar el empleado', 500);
    }
};

// Eliminar empleado
empleadoCtl.eliminarEmpleado = async (req, res) => {
    try {
        const { id } = req.params;

        // Verificar la existencia del empleado en SQL
        const [empleadoExistenteSql] = await sql.promise().query(`
            SELECT * FROM empleados WHERE idEmpleado = ?
        `, [id]);

        if (empleadoExistenteSql.length === 0) {
            res.flash('error', 'Empleado no encontrado');
            return res.apiError('Empleado no encontrado', 404);
        }

        // Eliminar en SQL
        await orm.empleado.destroy({
            where: { idEmpleado: id }
        });

        // Eliminar en MongoDB
        await mongo.Empleado.findOneAndDelete({ id_empleadoSql: parseInt(id) });

        // Establecer mensaje flash de éxito y enviar respuesta API
        res.flash('success', 'Empleado eliminado exitosamente');
        return res.apiResponse(
            null, 
            200, 
            'Empleado eliminado exitosamente'
        );
    } catch (error) {
        // Capturar y registrar errores, establecer mensaje flash de error y enviar respuesta API de error
        console.error('Error al eliminar empleado:', error);
        res.flash('error', 'Error al eliminar el empleado');
        return res.apiError('Error interno del servidor al eliminar el empleado', 500);
    }
};

module.exports = empleadoCtl;
