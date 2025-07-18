const evaluacionClienteCtl = {};
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

// Mostrar todas las evaluaciones (MySQL + MongoDB)
evaluacionClienteCtl.mostrarEvaluaciones = async (req, res) => {
    try {
        const [evaluaciones] = await sql.promise().query('SELECT * FROM evaluaciones_clientes');

        const evaluacionesCompletas = [];

        for (const evaluacionSql of evaluaciones) {
            const evaluacionMongo = await mongo.EvaluacionCliente.findOne({
                id_evaluacion: evaluacionSql.idEvaluacion
            });

            evaluacionesCompletas.push({
                mysql: evaluacionSql,
                mongo: evaluacionMongo || null
            });
        }

        return { evaluaciones: evaluacionesCompletas };
    } catch (error) {
        console.error('Error al obtener evaluaciones:', error.message);
        return { error: 'Error al obtener evaluaciones' };
    }
};

// Mostrar una evaluación por ID (MySQL + MongoDB)
evaluacionClienteCtl.mostrarEvaluacionPorId = async (req, res) => {
    const { id } = req.params;

    try {
        const [evaluacionSql] = await sql.promise().query(
            'SELECT * FROM evaluaciones_clientes WHERE idEvaluacion = ?', [id]
        );

        if (evaluacionSql.length === 0) {
            return { error: 'Evaluación no encontrada en MySQL' };
        }

        const evaluacionMongo = await mongo.EvaluacionCliente.findOne({
            id_evaluacion: parseInt(id)
        });

        return {
            mysql: evaluacionSql[0],
            mongo: evaluacionMongo || null
        };
    } catch (error) {
        console.error('Error al obtener evaluación:', error.message);
        return { error: 'Error al obtener evaluación' };
    }
};

// Crear una evaluación (MySQL + MongoDB)
evaluacionClienteCtl.crearEvaluacion = async (req, res) => {
    const { clienteId, claseId, puntuacion, stateEvaluacion, comentario } = req.body;

    try {
        // Crear en MySQL
        const nuevaEvaluacion = {
            clienteId,
            claseId,
            puntuacion,
            stateEvaluacion,
            createEvaluacion: new Date().toLocaleString()
        };

        const resultado = await orm.evaluacionCliente.create(nuevaEvaluacion);
        const idEvaluacion = resultado.idEvaluacion;

        // Crear en MongoDB
        const nuevaEvaluacionMongo = new mongo.EvaluacionCliente({
            id_evaluacion: idEvaluacion,
            comentario,
            fecha_evaluacion: new Date().toLocaleString()
        });

        await nuevaEvaluacionMongo.save();

        return {
            message: 'Evaluación creada con éxito',
            idEvaluacion
        };
    } catch (error) {
        console.error('Error al crear evaluación:', error.message);
        return { error: 'Error al crear evaluación' };
    }
};

// Actualizar una evaluación (MySQL + MongoDB)
evaluacionClienteCtl.actualizarEvaluacion = async (req, res) => {
    const { id } = req.params;
    const { clienteId, claseId, puntuacion, stateEvaluacion, comentario } = req.body;

    try {
        // Actualizar en MySQL
        const [evaluacionExistente] = await sql.promise().query(
            'SELECT * FROM evaluaciones_clientes WHERE idEvaluacion = ?', [id]
        );

        if (evaluacionExistente.length === 0) {
            return { error: 'Evaluación no encontrada en MySQL' };
        }

        const evaluacionActualizada = {
            clienteId: clienteId || evaluacionExistente[0].clienteId,
            claseId: claseId || evaluacionExistente[0].claseId,
            puntuacion: puntuacion || evaluacionExistente[0].puntuacion,
            stateEvaluacion: stateEvaluacion || evaluacionExistente[0].stateEvaluacion,
            updateEvaluacion: new Date().toLocaleString()
        };

        await orm.evaluacionCliente.update(evaluacionActualizada, {
            where: { idEvaluacion: id }
        });

        // Actualizar en MongoDB
        const evaluacionMongo = await mongo.EvaluacionCliente.findOne({
            id_evaluacion: parseInt(id)
        });

        if (!evaluacionMongo) {
            return { error: 'Evaluación no encontrada en MongoDB' };
        }

        evaluacionMongo.comentario = comentario || evaluacionMongo.comentario;
        evaluacionMongo.fecha_evaluacion = new Date().toLocaleString();
        await evaluacionMongo.save();

        return { message: 'Evaluación actualizada con éxito', idEvaluacion: id };
    } catch (error) {
        console.error('Error al actualizar evaluación:', error.message);
        return { error: 'Error al actualizar evaluación' };
    }
};

// Eliminar una evaluación (MySQL + MongoDB)
evaluacionClienteCtl.eliminarEvaluacion = async (req, res) => {
    const { id } = req.params;

    try {
        // Eliminar en MySQL
        const [evaluacionExistente] = await sql.promise().query(
            'SELECT * FROM evaluaciones_clientes WHERE idEvaluacion = ?', [id]
        );

        if (evaluacionExistente.length === 0) {
            return { error: 'Evaluación no encontrada en MySQL' };
        }

        await orm.evaluacionCliente.destroy({
            where: { idEvaluacion: id }
        });

        // Eliminar en MongoDB
        const evaluacionMongo = await mongo.EvaluacionCliente.findOne({
            id_evaluacion: parseInt(id)
        });

        if (!evaluacionMongo) {
            return { error: 'Evaluación no encontrada en MongoDB' };
        }

        await evaluacionMongo.deleteOne();

        return { message: 'Evaluación eliminada con éxito' };
    } catch (error) {
        console.error('Error al eliminar evaluación:', error.message);
        return { error: 'Error al eliminar evaluación' };
    }
};

module.exports = evaluacionClienteCtl;