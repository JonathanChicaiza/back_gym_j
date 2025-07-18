const empleadoCtl = {};
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

// Mostrar todos los empleados (MySQL + MongoDB)
empleadoCtl.mostrarEmpleados = async (req, res) => {
    try {
        const [empleados] = await sql.promise().query('SELECT * FROM empleados');

        const empleadosCompletos = [];

        for (const empleadoSql of empleados) {
            const empleadoMongo = await mongo.Empleado.findOne({
                id_empleado: empleadoSql.idEmpleado
            });

            empleadosCompletos.push({
                mysql: empleadoSql,
                mongo: empleadoMongo || null
            });
        }

        return { empleados: empleadosCompletos };
    } catch (error) {
        console.error('Error al obtener empleados:', error.message);
        return { error: 'Error al obtener empleados' };
    }
};

// Mostrar un empleado por ID (MySQL + MongoDB)
empleadoCtl.mostrarEmpleadoPorId = async (req, res) => {
    const { id } = req.params;

    try {
        const [empleadoSql] = await sql.promise().query(
            'SELECT * FROM empleados WHERE idEmpleado = ?', [id]
        );

        if (empleadoSql.length === 0) {
            return { error: 'Empleado no encontrado en MySQL' };
        }

        const empleadoMongo = await mongo.Empleado.findOne({
            id_empleado: parseInt(id)
        });

        return {
            mysql: empleadoSql[0],
            mongo: empleadoMongo || null
        };
    } catch (error) {
        console.error('Error al obtener empleado:', error.message);
        return { error: 'Error al obtener empleado' };
    }
};

// Crear un empleado (MySQL + MongoDB)
empleadoCtl.crearEmpleado = async (req, res) => {
    const { idEmpleado, cargo, salario, fecha_contratacion } = req.body;

    try {
        // Crear en MySQL
        const nuevoEmpleado = {
            idEmpleado,
            cargo
        };

        await orm.empleado.create(nuevoEmpleado);

        // Crear en MongoDB
        const nuevoEmpleadoMongo = new mongo.Empleado({
            id_empleado: idEmpleado,
            salario,
            fecha_contratacion
        });

        await nuevoEmpleadoMongo.save();

        return { message: 'Empleado creado con éxito', idEmpleado };
    } catch (error) {
        console.error('Error al crear empleado:', error.message);
        return { error: 'Error al crear empleado' };
    }
};

// Actualizar un empleado (MySQL + MongoDB)
empleadoCtl.actualizarEmpleado = async (req, res) => {
    const { id } = req.params;
    const { cargo, salario, fecha_contratacion } = req.body;

    try {
        // Actualizar en MySQL
        const [empleadoExistente] = await sql.promise().query(
            'SELECT * FROM empleados WHERE idEmpleado = ?', [id]
        );

        if (empleadoExistente.length === 0) {
            return { error: 'Empleado no encontrado en MySQL' };
        }

        const empleadoActualizado = {
            cargo: cargo || empleadoExistente[0].cargo
        };

        await orm.empleado.update(empleadoActualizado, {
            where: { idEmpleado: id }
        });

        // Actualizar en MongoDB
        const empleadoMongo = await mongo.Empleado.findOne({
            id_empleado: parseInt(id)
        });

        if (!empleadoMongo) {
            return { error: 'Empleado no encontrado en MongoDB' };
        }

        empleadoMongo.salario = salario || empleadoMongo.salario;
        empleadoMongo.fecha_contratacion = fecha_contratacion || empleadoMongo.fecha_contratacion;

        await empleadoMongo.save();

        return { message: 'Empleado actualizado con éxito', idEmpleado: id };
    } catch (error) {
        console.error('Error al actualizar empleado:', error.message);
        return { error: 'Error al actualizar empleado' };
    }
};

// Eliminar un empleado (MySQL + MongoDB)
empleadoCtl.eliminarEmpleado = async (req, res) => {
    const { id } = req.params;

    try {
        // Eliminar en MySQL
        const [empleadoExistente] = await sql.promise().query(
            'SELECT * FROM empleados WHERE idEmpleado = ?', [id]
        );

        if (empleadoExistente.length === 0) {
            return { error: 'Empleado no encontrado en MySQL' };
        }

        await orm.empleado.destroy({
            where: { idEmpleado: id }
        });

        // Eliminar en MongoDB
        const empleadoMongo = await mongo.Empleado.findOne({
            id_empleado: parseInt(id)
        });

        if (!empleadoMongo) {
            return { error: 'Empleado no encontrado en MongoDB' };
        }

        await empleadoMongo.deleteOne();

        return { message: 'Empleado eliminado con éxito' };
    } catch (error) {
        console.error('Error al eliminar empleado:', error.message);
        return { error: 'Error al eliminar empleado' };
    }
};

module.exports = empleadoCtl;