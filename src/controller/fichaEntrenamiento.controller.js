const fichaEntrenamientoCtl = {};
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

// Mostrar todas las fichas de entrenamiento (MySQL + MongoDB)
fichaEntrenamientoCtl.mostrarFichas = async (req, res) => {
    try {
        const [fichas] = await sql.promise().query('SELECT * FROM fichas_entrenamiento');

        const fichasCompletas = [];

        for (const fichaSql of fichas) {
            const fichaMongo = await mongo.Ficha.findOne({
                id_ficha: fichaSql.idFicha
            });

            fichasCompletas.push({
                mysql: fichaSql,
                mongo: fichaMongo || null
            });
        }

        return { fichas: fichasCompletas };
    } catch (error) {
        console.error('Error al obtener fichas:', error.message);
        return { error: 'Error al obtener fichas de entrenamiento' };
    }
};

// Mostrar una ficha por ID (MySQL + MongoDB)
fichaEntrenamientoCtl.mostrarFichaPorId = async (req, res) => {
    const { id } = req.params;

    try {
        const [fichaSql] = await sql.promise().query(
            'SELECT * FROM fichas_entrenamiento WHERE idFicha = ?', [id]
        );

        if (fichaSql.length === 0) {
            return { error: 'Ficha no encontrada en MySQL' };
        }

        const fichaMongo = await mongo.Ficha.findOne({
            id_ficha: parseInt(id)
        });

        return {
            mysql: fichaSql[0],
            mongo: fichaMongo || null
        };
    } catch (error) {
        console.error('Error al obtener ficha:', error.message);
        return { error: 'Error al obtener ficha de entrenamiento' };
    }
};

// Crear una ficha (MySQL + MongoDB)
fichaEntrenamientoCtl.crearFicha = async (req, res) => {
    const { clienteId, profesorId, stateFicha, descripcion } = req.body;

    try {
        // Crear en MySQL
        const nuevaFicha = {
            clienteId,
            profesorId,
            stateFicha,
            createFicha: new Date().toLocaleString()
        };

        const resultado = await orm.fichaEntrenamiento.create(nuevaFicha);
        const idFicha = resultado.idFicha;

        // Crear en MongoDB
        const nuevaFichaMongo = new mongo.Ficha({
            id_ficha: idFicha,
            descripcion,
            fecha_creacion: new Date().toLocaleString()
        });

        await nuevaFichaMongo.save();

        return {
            message: 'Ficha de entrenamiento creada con éxito',
            idFicha
        };
    } catch (error) {
        console.error('Error al crear ficha:', error.message);
        return { error: 'Error al crear ficha de entrenamiento' };
    }
};

// Actualizar una ficha (MySQL + MongoDB)
fichaEntrenamientoCtl.actualizarFicha = async (req, res) => {
    const { id } = req.params;
    const { clienteId, profesorId, stateFicha, descripcion } = req.body;

    try {
        // Actualizar en MySQL
        const [fichaExistente] = await sql.promise().query(
            'SELECT * FROM fichas_entrenamiento WHERE idFicha = ?', [id]
        );

        if (fichaExistente.length === 0) {
            return { error: 'Ficha no encontrada en MySQL' };
        }

        const fichaActualizada = {
            clienteId: clienteId || fichaExistente[0].clienteId,
            profesorId: profesorId || fichaExistente[0].profesorId,
            stateFicha: stateFicha || fichaExistente[0].stateFicha,
            updateFicha: new Date().toLocaleString()
        };

        await orm.fichaEntrenamiento.update(fichaActualizada, {
            where: { idFicha: id }
        });

        // Actualizar en MongoDB
        const fichaMongo = await mongo.Ficha.findOne({
            id_ficha: parseInt(id)
        });

        if (!fichaMongo) {
            return { error: 'Ficha no encontrada en MongoDB' };
        }

        fichaMongo.descripcion = descripcion || fichaMongo.descripcion;
        await fichaMongo.save();

        return { message: 'Ficha actualizada con éxito', idFicha: id };
    } catch (error) {
        console.error('Error al actualizar ficha:', error.message);
        return { error: 'Error al actualizar ficha de entrenamiento' };
    }
};

// Eliminar una ficha (MySQL + MongoDB)
fichaEntrenamientoCtl.eliminarFicha = async (req, res) => {
    const { id } = req.params;

    try {
        // Eliminar en MySQL
        const [fichaExistente] = await sql.promise().query(
            'SELECT * FROM fichas_entrenamiento WHERE idFicha = ?', [id]
        );

        if (fichaExistente.length === 0) {
            return { error: 'Ficha no encontrada en MySQL' };
        }

        await orm.fichaEntrenamiento.destroy({
            where: { idFicha: id }
        });

        // Eliminar en MongoDB
        const fichaMongo = await mongo.Ficha.findOne({
            id_ficha: parseInt(id)
        });

        if (!fichaMongo) {
            return { error: 'Ficha no encontrada en MongoDB' };
        }

        await fichaMongo.deleteOne();

        return { message: 'Ficha de entrenamiento eliminada con éxito' };
    } catch (error) {
        console.error('Error al eliminar ficha:', error.message);
        return { error: 'Error al eliminar ficha de entrenamiento' };
    }
};

module.exports = fichaEntrenamientoCtl;