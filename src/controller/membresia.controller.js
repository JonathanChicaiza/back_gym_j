const membresiaCtl = {};
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

// Mostrar todas las membresías (MySQL + MongoDB)
membresiaCtl.mostrarMembresias = async (req, res) => {
    try {
        const [membresias] = await sql.promise().query('SELECT * FROM membresias');

        const membresiasCompletas = [];

        for (const membresiaSql of membresias) {
            const membresiaMongo = await mongo.Membresia.findOne({
                id_membresia: membresiaSql.idMembresia
            });

            membresiasCompletas.push({
                mysql: membresiaSql,
                mongo: membresiaMongo || null
            });
        }

        return { membresias: membresiasCompletas };
    } catch (error) {
        console.error('Error al obtener membresías:', error.message);
        return { error: 'Error al obtener membresías' };
    }
};

// Mostrar una membresía por ID (MySQL + MongoDB)
membresiaCtl.mostrarMembresiaPorId = async (req, res) => {
    const { id } = req.params;

    try {
        const [membresiaSql] = await sql.promise().query(
            'SELECT * FROM membresias WHERE idMembresia = ?', [id]
        );

        if (membresiaSql.length === 0) {
            return { error: 'Membresía no encontrada en MySQL' };
        }

        const membresiaMongo = await mongo.Membresia.findOne({
            id_membresia: parseInt(id)
        });

        return {
            mysql: membresiaSql[0],
            mongo: membresiaMongo || null
        };
    } catch (error) {
        console.error('Error al obtener membresía:', error.message);
        return { error: 'Error al obtener membresía' };
    }
};

// Crear una membresía (MySQL + MongoDB)
membresiaCtl.crearMembresia = async (req, res) => {
    const { nombre, precio, duracionDias, stateMembresia, descripcion, beneficios } = req.body;

    try {
        // Crear en MySQL
        const nuevaMembresia = {
            nombre,
            precio,
            duracionDias,
            stateMembresia,
            createMembresia: new Date().toLocaleString()
        };

        const resultado = await orm.membresia.create(nuevaMembresia);
        const idMembresia = resultado.idMembresia;

        // Crear en MongoDB
        const nuevaMembresiaMongo = new mongo.Membresia({
            id_membresia: idMembresia,
            descripcion,
            beneficios
        });

        await nuevaMembresiaMongo.save();

        return {
            message: 'Membresía creada con éxito',
            idMembresia
        };
    } catch (error) {
        console.error('Error al crear membresía:', error.message);
        return { error: 'Error al crear membresía' };
    }
};

// Actualizar una membresía (MySQL + MongoDB)
membresiaCtl.actualizarMembresia = async (req, res) => {
    const { id } = req.params;
    const { nombre, precio, duracionDias, stateMembresia, descripcion, beneficios } = req.body;

    try {
        // Actualizar en MySQL
        const [membresiaExistente] = await sql.promise().query(
            'SELECT * FROM membresias WHERE idMembresia = ?', [id]
        );

        if (membresiaExistente.length === 0) {
            return { error: 'Membresía no encontrada en MySQL' };
        }

        const membresiaActualizada = {
            nombre: nombre || membresiaExistente[0].nombre,
            precio: precio || membresiaExistente[0].precio,
            duracionDias: duracionDias || membresiaExistente[0].duracionDias,
            stateMembresia: stateMembresia || membresiaExistente[0].stateMembresia,
            updateMembresia: new Date().toLocaleString()
        };

        await orm.membresia.update(membresiaActualizada, {
            where: { idMembresia: id }
        });

        // Actualizar en MongoDB
        const membresiaMongo = await mongo.Membresia.findOne({
            id_membresia: parseInt(id)
        });

        if (!membresiaMongo) {
            return { error: 'Membresía no encontrada en MongoDB' };
        }

        membresiaMongo.descripcion = descripcion || membresiaMongo.descripcion;
        membresiaMongo.beneficios = beneficios || membresiaMongo.beneficios;

        await membresiaMongo.save();

        return { message: 'Membresía actualizada con éxito', idMembresia: id };
    } catch (error) {
        console.error('Error al actualizar membresía:', error.message);
        return { error: 'Error al actualizar membresía' };
    }
};

// Eliminar una membresía (MySQL + MongoDB)
membresiaCtl.eliminarMembresia = async (req, res) => {
    const { id } = req.params;

    try {
        // Eliminar en MySQL
        const [membresiaExistente] = await sql.promise().query(
            'SELECT * FROM membresias WHERE idMembresia = ?', [id]
        );

        if (membresiaExistente.length === 0) {
            return { error: 'Membresía no encontrada en MySQL' };
        }

        await orm.membresia.destroy({
            where: { idMembresia: id }
        });

        // Eliminar en MongoDB
        const membresiaMongo = await mongo.Membresia.findOne({
            id_membresia: parseInt(id)
        });

        if (!membresiaMongo) {
            return { error: 'Membresía no encontrada en MongoDB' };
        }

        await membresiaMongo.deleteOne();

        return { message: 'Membresía eliminada con éxito' };
    } catch (error) {
        console.error('Error al eliminar membresía:', error.message);
        return { error: 'Error al eliminar membresía' };
    }
};

module.exports = membresiaCtl;