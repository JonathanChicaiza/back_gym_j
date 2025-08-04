const orm = require('../Database/dataBase.orm');
const sql = require('../Database/dataBase.sql');

const visitaCtl = {};

visitaCtl.obtenerVisitas = async (req, res) => {
    try {
        const listaVisitas = await orm.Visita.findAll({
            order: [['fecha', 'DESC']]
        });

        // Instead of res.flash, send the message in the API response
        return res.apiResponse(listaVisitas, 200, 'Visitas obtenidas exitosamente');
    } catch (error) {
        console.error('Error al obtener visitas:', error);
        // Instead of res.flash, send the error message in the API error response
        return res.apiError('Error interno del servidor al obtener visitas', 500);
    }
};

// Obtener una visita por ID
visitaCtl.obtenerVisita = async (req, res) => {
    try {
        const { id } = req.params;

        // Consultar la visita por ID usando ORM
        const visita = await orm.Visita.findByPk(id);

        // Si no se encuentra la visita, enviar error 404
        if (!visita) {
            res.flash('error', 'Visita no encontrada');
            return res.apiError('Visita no encontrada', 404);
        }

        // Establecer mensaje flash de éxito y enviar respuesta API
        res.flash('success', 'Visita obtenida exitosamente');
        return res.apiResponse(visita, 200, 'Visita obtenida exitosamente');
    } catch (error) {
        // Capturar y registrar errores, establecer mensaje flash de error y enviar respuesta API de error
        console.error('Error al obtener visita:', error);
        res.flash('error', 'Error al obtener visita');
        return res.apiError('Error interno del servidor al obtener la visita', 500);
    }
};

// Crear nueva visita
visitaCtl.crearVisita = async (req, res) => {
    try {
        const { nombre, tipodocumento, numerodocumento, tipovisita, observacion, fecha } = req.body;

        // Crear la visita con todos los campos del modelo
        const nuevaVisita = await orm.Visita.create({
            nombre,
            tipodocumento,
            numerodocumento,
            tipovisita,
            observacion,
            fecha,
            stateVisita: 'activa', // Estado por defecto
            createVisita: new Date(),
            updateVisita: new Date()
        });

        // Establecer mensaje flash de éxito y enviar respuesta API
        res.flash('success', 'Visita creada exitosamente');
        return res.apiResponse(
            nuevaVisita, 
            201, 
            'Visita creada exitosamente'
        );
    } catch (error) {
        // Capturar y registrar errores, establecer mensaje flash de error y enviar respuesta API de error
        console.error('Error al crear visita:', error);
        res.flash('error', 'Error al crear la visita');
        return res.apiError('Error interno del servidor al crear la visita', 500);
    }
};

// Actualizar visita
visitaCtl.actualizarVisita = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, tipodocumento, numerodocumento, tipovisita, observacion, fecha, stateVisita } = req.body;

        // Verificar la existencia de la visita
        const visitaExistente = await orm.Visita.findByPk(id);
        if (!visitaExistente) {
            res.flash('error', 'Visita no encontrada');
            return res.apiError('Visita no encontrada', 404);
        }

        // Preparar datos de actualización
        const datosActualizacion = {
            nombre: nombre !== undefined ? nombre : visitaExistente.nombre,
            tipodocumento: tipodocumento !== undefined ? tipodocumento : visitaExistente.tipodocumento,
            numerodocumento: numerodocumento !== undefined ? numerodocumento : visitaExistente.numerodocumento,
            tipovisita: tipovisita !== undefined ? tipovisita : visitaExistente.tipovisita,
            observacion: observacion !== undefined ? observacion : visitaExistente.observacion,
            fecha: fecha !== undefined ? fecha : visitaExistente.fecha,
            stateVisita: stateVisita !== undefined ? stateVisita : visitaExistente.stateVisita,
            updateVisita: new Date() // Actualizar fecha de modificación
        };

        // Actualizar la visita
        await visitaExistente.update(datosActualizacion);

        // Establecer mensaje flash de éxito y enviar respuesta API
        res.flash('success', 'Visita actualizada exitosamente');
        return res.apiResponse(
            visitaExistente, 
            200, 
            'Visita actualizada exitosamente'
        );
    } catch (error) {
        // Capturar y registrar errores, establecer mensaje flash de error y enviar respuesta API de error
        console.error('Error al actualizar visita:', error);
        res.flash('error', 'Error al actualizar la visita');
        return res.apiError('Error interno del servidor al actualizar la visita', 500);
    }
};

// Eliminar visita
visitaCtl.eliminarVisita = async (req, res) => {
    try {
        const { id } = req.params;

        // Verificar la existencia de la visita
        const visitaExistente = await orm.Visita.findByPk(id);
        if (!visitaExistente) {
            res.flash('error', 'Visita no encontrada');
            return res.apiError('Visita no encontrada', 404);
        }

        // Eliminar la visita
        await visitaExistente.destroy();

        // Establecer mensaje flash de éxito y enviar respuesta API
        res.flash('success', 'Visita eliminada exitosamente');
        return res.apiResponse(
            null, 
            200, 
            'Visita eliminada exitosamente'
        );
    } catch (error) {
        // Capturar y registrar errores, establecer mensaje flash de error y enviar respuesta API de error
        console.error('Error al eliminar visita:', error);
        res.flash('error', 'Error al eliminar la visita');
        return res.apiError('Error interno del servidor al eliminar la visita', 500);
    }
};

module.exports = visitaCtl;