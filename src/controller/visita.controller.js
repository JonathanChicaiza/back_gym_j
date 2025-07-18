const visitaCtl = {};
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

// Mostrar todas las visitas (MySQL + MongoDB)
visitaCtl.mostrarVisitas = async (req, res) => {
    try {
        const [visitas] = await sql.promise().query('SELECT * FROM visitas');

        const visitasCompletas = [];

        for (const visitaSql of visitas) {
            const visitaMongo = await mongo.Visita.findOne({
                id_visita: visitaSql.idVisita
            });

            visitasCompletas.push({
                mysql: visitaSql,
                mongo: visitaMongo || null
            });
        }

        return { visitas: visitasCompletas };
    } catch (error) {
        console.error('Error al obtener visitas:', error.message);
        return { error: 'Error al obtener visitas' };
    }
};

// Mostrar una visita por ID (MySQL + MongoDB)
visitaCtl.mostrarVisitaPorId = async (req, res) => {
    const { id } = req.params;

    try {
        const [visitaSql] = await sql.promise().query(
            'SELECT * FROM visitas WHERE idVisita = ?', [id]
        );

        if (visitaSql.length === 0) {
            return { error: 'Visita no encontrada en MySQL' };
        }

        const visitaMongo = await mongo.Visita.findOne({
            id_visita: parseInt(id)
        });

        return {
            mysql: visitaSql[0],
            mongo: visitaMongo || null
        };
    } catch (error) {
        console.error('Error al obtener visita:', error.message);
        return { error: 'Error al obtener visita' };
    }
};

// Crear una visita (MySQL + MongoDB)
visitaCtl.crearVisita = async (req, res) => {
    const { clienteId, stateVisita } = req.body;

    try {
        // Crear en MySQL
        const nuevaVisita = {
            clienteId,
            stateVisita,
            createVisita: new Date().toLocaleString()
        };

        const resultado = await orm.visita.create(nuevaVisita);
        const idVisita = resultado.idVisita;

        // Crear en MongoDB
        const nuevaVisitaMongo = new mongo.Visita({
            id_visita: idVisita,
            fecha_visita: new Date().toLocaleString()
        });

        await nuevaVisitaMongo.save();

        return {
            message: 'Visita creada con éxito',
            idVisita
        };
    } catch (error) {
        console.error('Error al crear visita:', error.message);
        return { error: 'Error al crear visita' };
    }
};

// Actualizar una visita (MySQL + MongoDB)
visitaCtl.actualizarVisita = async (req, res) => {
    const { id } = req.params;
    const { clienteId, stateVisita } = req.body;

    try {
        // Actualizar en MySQL
        const [visitaExistente] = await sql.promise().query(
            'SELECT * FROM visitas WHERE idVisita = ?', [id]
        );

        if (visitaExistente.length === 0) {
            return { error: 'Visita no encontrada en MySQL' };
        }

        const visitaActualizada = {
            clienteId: clienteId || visitaExistente[0].clienteId,
            stateVisita: stateVisita || visitaExistente[0].stateVisita,
            updateVisita: new Date().toLocaleString()
        };

        await orm.visita.update(visitaActualizada, {
            where: { idVisita: id }
        });

        // Actualizar en MongoDB - solo fecha_visita
        const visitaMongo = await mongo.Visita.findOne({
            id_visita: parseInt(id)
        });

        if (!visitaMongo) {
            return { error: 'Visita no encontrada en MongoDB' };
        }

        visitaMongo.fecha_visita = new Date().toLocaleString();
        await visitaMongo.save();

        return { message: 'Visita actualizada con éxito', idVisita: id };
    } catch (error) {
        console.error('Error al actualizar visita:', error.message);
        return { error: 'Error al actualizar visita' };
    }
};

// Eliminar una visita (MySQL + MongoDB)
visitaCtl.eliminarVisita = async (req, res) => {
    const { id } = req.params;

    try {
        // Eliminar en MySQL
        const [visitaExistente] = await sql.promise().query(
            'SELECT * FROM visitas WHERE idVisita = ?', [id]
        );

        if (visitaExistente.length === 0) {
            return { error: 'Visita no encontrada en MySQL' };
        }

        await orm.visita.destroy({
            where: { idVisita: id }
        });

        // Eliminar en MongoDB
        const visitaMongo = await mongo.Visita.findOne({
            id_visita: parseInt(id)
        });

        if (!visitaMongo) {
            return { error: 'Visita no encontrada en MongoDB' };
        }

        await visitaMongo.deleteOne();

        return { message: 'Visita eliminada con éxito' };
    } catch (error) {
        console.error('Error al eliminar visita:', error.message);
        return { error: 'Error al eliminar visita' };
    }
};

module.exports = visitaCtl;