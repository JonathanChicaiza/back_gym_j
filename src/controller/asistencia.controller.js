const asistenciaCtl = {};
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

// Mostrar todas las asistencias (MySQL + MongoDB)
asistenciaCtl.mostrarAsistencias = async (req, res) => {
    try {
        const [asistencias] = await sql.promise().query('SELECT * FROM asistencias');

        const asistenciasCompletas = [];

        for (const asistenciaSql of asistencias) {
            const asistenciaMongo = await mongo.Asistencia.findOne({
                id_asistencia: asistenciaSql.idAsistencia
            });

            asistenciasCompletas.push({
                mysql: asistenciaSql,
                mongo: asistenciaMongo || null
            });
        }

        return { asistencias: asistenciasCompletas };
    } catch (error) {
        console.error('Error al obtener asistencias:', error.message);
        return { error: 'Error al obtener asistencias' };
    }
};

// Mostrar una asistencia por ID (MySQL + MongoDB)
asistenciaCtl.mostrarAsistenciaPorId = async (req, res) => {
    const { id } = req.params;

    try {
        const [asistenciaSql] = await sql.promise().query(
            'SELECT * FROM asistencias WHERE idAsistencia = ?', [id]
        );

        if (asistenciaSql.length === 0) {
            return { error: 'Asistencia no encontrada en MySQL' };
        }

        const asistenciaMongo = await mongo.Asistencia.findOne({
            id_asistencia: parseInt(id)
        });

        return {
            mysql: asistenciaSql[0],
            mongo: asistenciaMongo || null
        };
    } catch (error) {
        console.error('Error al obtener asistencia:', error.message);
        return { error: 'Error al obtener asistencia' };
    }
};

// Crear una asistencia (MySQL + MongoDB)
asistenciaCtl.crearAsistencia = async (req, res) => {
    const { clienteId, claseId, estado, stateAsistencia } = req.body;

    try {
        // Crear en MySQL
        const nuevaAsistencia = {
            clienteId,
            claseId,
            estado,
            stateAsistencia,
            createAsistencia: new Date().toLocaleString()
        };

        const resultado = await orm.asistencia.create(nuevaAsistencia);
        const idAsistencia = resultado.idAsistencia;

        // Crear en MongoDB
        const nuevaAsistenciaMongo = new mongo.Asistencia({
            id_asistencia: idAsistencia,
            fecha_asistencia: new Date().toLocaleString()
        });

        await nuevaAsistenciaMongo.save();

        return {
            message: 'Asistencia creada con éxito',
            idAsistencia
        };
    } catch (error) {
        console.error('Error al crear asistencia:', error.message);
        return { error: 'Error al crear asistencia' };
    }
};

// Actualizar una asistencia (MySQL + MongoDB)
asistenciaCtl.actualizarAsistencia = async (req, res) => {
    const { id } = req.params;
    const { clienteId, claseId, estado, stateAsistencia } = req.body;

    try {
        // Actualizar en MySQL
        const [asistenciaExistente] = await sql.promise().query(
            'SELECT * FROM asistencias WHERE idAsistencia = ?', [id]
        );

        if (asistenciaExistente.length === 0) {
            return { error: 'Asistencia no encontrada en MySQL' };
        }

        const asistenciaActualizada = {
            clienteId: clienteId || asistenciaExistente[0].clienteId,
            claseId: claseId || asistenciaExistente[0].claseId,
            estado: estado || asistenciaExistente[0].estado,
            stateAsistencia: stateAsistencia || asistenciaExistente[0].stateAsistencia,
            updateAsistencia: new Date().toLocaleString()
        };

        await orm.asistencia.update(asistenciaActualizada, {
            where: { idAsistencia: id }
        });

        // Actualizar en MongoDB - solo fecha_asistencia
        const asistenciaMongo = await mongo.Asistencia.findOne({
            id_asistencia: parseInt(id)
        });

        if (!asistenciaMongo) {
            return { error: 'Asistencia no encontrada en MongoDB' };
        }

        asistenciaMongo.fecha_asistencia = new Date().toLocaleString();
        await asistenciaMongo.save();

        return { message: 'Asistencia actualizada con éxito', idAsistencia: id };
    } catch (error) {
        console.error('Error al actualizar asistencia:', error.message);
        return { error: 'Error al actualizar asistencia' };
    }
};

// Eliminar una asistencia (MySQL + MongoDB)
asistenciaCtl.eliminarAsistencia = async (req, res) => {
    const { id } = req.params;

    try {
        // Eliminar en MySQL
        const [asistenciaExistente] = await sql.promise().query(
            'SELECT * FROM asistencias WHERE idAsistencia = ?', [id]
        );

        if (asistenciaExistente.length === 0) {
            return { error: 'Asistencia no encontrada en MySQL' };
        }

        await orm.asistencia.destroy({
            where: { idAsistencia: id }
        });

        // Eliminar en MongoDB
        const asistenciaMongo = await mongo.Asistencia.findOne({
            id_asistencia: parseInt(id)
        });

        if (!asistenciaMongo) {
            return { error: 'Asistencia no encontrada en MongoDB' };
        }

        await asistenciaMongo.deleteOne();

        return { message: 'Asistencia eliminada con éxito' };
    } catch (error) {
        console.error('Error al eliminar asistencia:', error.message);
        return { error: 'Error al eliminar asistencia' };
    }
};

module.exports = asistenciaCtl;