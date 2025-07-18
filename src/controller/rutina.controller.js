const rutinaCtl = {};
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

// Mostrar todas las rutinas (MySQL + MongoDB)
rutinaCtl.mostrarRutinas = async (req, res) => {
    try {
        const [rutinas] = await sql.promise().query('SELECT * FROM rutinas');

        const rutinasCompletas = [];

        for (const rutinaSql of rutinas) {
            const rutinaMongo = await mongo.Rutina.findOne({
                id_rutina: rutinaSql.idRutina
            });

            rutinasCompletas.push({
                mysql: rutinaSql,
                mongo: rutinaMongo || null
            });
        }

        return { rutinas: rutinasCompletas };
    } catch (error) {
        console.error('Error al obtener rutinas:', error.message);
        return { error: 'Error al obtener rutinas' };
    }
};

// Mostrar una rutina por ID (MySQL + MongoDB)
rutinaCtl.mostrarRutinaPorId = async (req, res) => {
    const { id } = req.params;

    try {
        const [rutinaSql] = await sql.promise().query(
            'SELECT * FROM rutinas WHERE idRutina = ?', [id]
        );

        if (rutinaSql.length === 0) {
            return { error: 'Rutina no encontrada en MySQL' };
        }

        const rutinaMongo = await mongo.Rutina.findOne({
            id_rutina: parseInt(id)
        });

        return {
            mysql: rutinaSql[0],
            mongo: rutinaMongo || null
        };
    } catch (error) {
        console.error('Error al obtener rutina:', error.message);
        return { error: 'Error al obtener rutina' };
    }
};

// Crear una rutina (MySQL + MongoDB)
rutinaCtl.crearRutina = async (req, res) => {
    const { clienteId, profesorId, nombre, duracionSemanas, estado, stateRutina, descripcion } = req.body;

    try {
        // Crear en MySQL
        const nuevaRutina = {
            clienteId,
            profesorId,
            nombre,
            duracionSemanas,
            estado,
            stateRutina,
            createRutina: new Date().toLocaleString()
        };

        const resultado = await orm.rutina.create(nuevaRutina);
        const idRutina = resultado.idRutina;

        // Crear en MongoDB
        const nuevaRutinaMongo = new mongo.Rutina({
            id_rutina: idRutina,
            descripcion,
            fecha_asignacion: new Date().toLocaleString()
        });

        await nuevaRutinaMongo.save();

        return {
            message: 'Rutina creada con éxito',
            idRutina
        };
    } catch (error) {
        console.error('Error al crear rutina:', error.message);
        return { error: 'Error al crear rutina' };
    }
};

// Actualizar una rutina (MySQL + MongoDB)
rutinaCtl.actualizarRutina = async (req, res) => {
    const { id } = req.params;
    const { clienteId, profesorId, nombre, duracionSemanas, estado, stateRutina, descripcion } = req.body;

    try {
        // Actualizar en MySQL
        const [rutinaExistente] = await sql.promise().query(
            'SELECT * FROM rutinas WHERE idRutina = ?', [id]
        );

        if (rutinaExistente.length === 0) {
            return { error: 'Rutina no encontrada en MySQL' };
        }

        const rutinaActualizada = {
            clienteId: clienteId || rutinaExistente[0].clienteId,
            profesorId: profesorId || rutinaExistente[0].profesorId,
            nombre: nombre || rutinaExistente[0].nombre,
            duracionSemanas: duracionSemanas || rutinaExistente[0].duracionSemanas,
            estado: estado || rutinaExistente[0].estado,
            stateRutina: stateRutina || rutinaExistente[0].stateRutina,
            updateRutina: new Date().toLocaleString()
        };

        await orm.rutina.update(rutinaActualizada, {
            where: { idRutina: id }
        });

        // Actualizar en MongoDB
        const rutinaMongo = await mongo.Rutina.findOne({
            id_rutina: parseInt(id)
        });

        if (!rutinaMongo) {
            return { error: 'Rutina no encontrada en MongoDB' };
        }

        rutinaMongo.descripcion = descripcion || rutinaMongo.descripcion;
        await rutinaMongo.save();

        return { message: 'Rutina actualizada con éxito', idRutina: id };
    } catch (error) {
        console.error('Error al actualizar rutina:', error.message);
        return { error: 'Error al actualizar rutina' };
    }
};

// Eliminar una rutina (MySQL + MongoDB)
rutinaCtl.eliminarRutina = async (req, res) => {
    const { id } = req.params;

    try {
        // Eliminar en MySQL
        const [rutinaExistente] = await sql.promise().query(
            'SELECT * FROM rutinas WHERE idRutina = ?', [id]
        );

        if (rutinaExistente.length === 0) {
            return { error: 'Rutina no encontrada en MySQL' };
        }

        await orm.rutina.destroy({
            where: { idRutina: id }
        });

        // Eliminar en MongoDB
        const rutinaMongo = await mongo.Rutina.findOne({
            id_rutina: parseInt(id)
        });

        if (!rutinaMongo) {
            return { error: 'Rutina no encontrada en MongoDB' };
        }

        await rutinaMongo.deleteOne();

        return { message: 'Rutina eliminada con éxito' };
    } catch (error) {
        console.error('Error al eliminar rutina:', error.message);
        return { error: 'Error al eliminar rutina' };
    }
};

module.exports = rutinaCtl;