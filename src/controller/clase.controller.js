const claseCtl = {};
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

// Mostrar todas las clases (MySQL + MongoDB)
claseCtl.mostrarClases = async (req, res) => {
    try {
        const [clases] = await sql.promise().query('SELECT * FROM clases');

        const clasesCompletas = [];

        for (const claseSql of clases) {
            const claseMongo = await mongo.Clase.findOne({
                id_clase: claseSql.idClase
            });

            clasesCompletas.push({
                mysql: claseSql,
                mongo: claseMongo || null
            });
        }

        return { clases: clasesCompletas };
    } catch (error) {
        console.error('Error al obtener clases:', error.message);
        return { error: 'Error al obtener clases' };
    }
};

// Mostrar una clase por ID (MySQL + MongoDB)
claseCtl.mostrarClasePorId = async (req, res) => {
    const { id } = req.params;

    try {
        const [claseSql] = await sql.promise().query(
            'SELECT * FROM clases WHERE idClase = ?', [id]
        );

        if (claseSql.length === 0) {
            return { error: 'Clase no encontrada en MySQL' };
        }

        const claseMongo = await mongo.Clase.findOne({
            id_clase: parseInt(id)
        });

        return {
            mysql: claseSql[0],
            mongo: claseMongo || null
        };
    } catch (error) {
        console.error('Error al obtener clase:', error.message);
        return { error: 'Error al obtener clase' };
    }
};

// Crear una clase (MySQL + MongoDB)
claseCtl.crearClase = async (req, res) => {
    const { nombre, capacidadMaxima, horario, profesorId, stateClase, descripcion } = req.body;

    try {
        // Crear en MySQL
        const nuevaClase = {
            nombre,
            capacidadMaxima,
            horario,
            profesorId,
            stateClase,
            createClase: new Date().toLocaleString()
        };

        const resultado = await orm.clase.create(nuevaClase);
        const idClase = resultado.idClase;

        // Crear en MongoDB
        const nuevaClaseMongo = new mongo.Clase({
            id_clase: idClase,
            descripcion
        });

        await nuevaClaseMongo.save();

        return {
            message: 'Clase creada con éxito',
            idClase
        };
    } catch (error) {
        console.error('Error al crear clase:', error.message);
        return { error: 'Error al crear clase' };
    }
};

// Actualizar una clase (MySQL + MongoDB)
claseCtl.actualizarClase = async (req, res) => {
    const { id } = req.params;
    const { nombre, capacidadMaxima, horario, profesorId, stateClase, descripcion } = req.body;

    try {
        // Actualizar en MySQL
        const [claseExistente] = await sql.promise().query(
            'SELECT * FROM clases WHERE idClase = ?', [id]
        );

        if (claseExistente.length === 0) {
            return { error: 'Clase no encontrada en MySQL' };
        }

        const claseActualizada = {
            nombre: nombre || claseExistente[0].nombre,
            capacidadMaxima: capacidadMaxima || claseExistente[0].capacidadMaxima,
            horario: horario || claseExistente[0].horario,
            profesorId: profesorId || claseExistente[0].profesorId,
            stateClase: stateClase || claseExistente[0].stateClase,
            updateClase: new Date().toLocaleString()
        };

        await orm.clase.update(claseActualizada, {
            where: { idClase: id }
        });

        // Actualizar en MongoDB
        const claseMongo = await mongo.Clase.findOne({
            id_clase: parseInt(id)
        });

        if (!claseMongo) {
            return { error: 'Clase no encontrada en MongoDB' };
        }

        claseMongo.descripcion = descripcion || claseMongo.descripcion;
        await claseMongo.save();

        return { message: 'Clase actualizada con éxito', idClase: id };
    } catch (error) {
        console.error('Error al actualizar clase:', error.message);
        return { error: 'Error al actualizar clase' };
    }
};

// Eliminar una clase (MySQL + MongoDB)
claseCtl.eliminarClase = async (req, res) => {
    const { id } = req.params;

    try {
        // Eliminar en MySQL
        const [claseExistente] = await sql.promise().query(
            'SELECT * FROM clases WHERE idClase = ?', [id]
        );

        if (claseExistente.length === 0) {
            return { error: 'Clase no encontrada en MySQL' };
        }

        await orm.clase.destroy({
            where: { idClase: id }
        });

        // Eliminar en MongoDB
        const claseMongo = await mongo.Clase.findOne({
            id_clase: parseInt(id)
        });

        if (!claseMongo) {
            return { error: 'Clase no encontrada en MongoDB' };
        }

        await claseMongo.deleteOne();

        return { message: 'Clase eliminada con éxito' };
    } catch (error) {
        console.error('Error al eliminar clase:', error.message);
        return { error: 'Error al eliminar clase' };
    }
};

module.exports = claseCtl;