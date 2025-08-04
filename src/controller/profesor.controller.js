const { profesor } = require('../Database/dataBase.orm');
const sql = require('../Database/dataBase.sql');

const profesorCtl = {};

// Configuración de la zona horaria
const configTimeZone = { timeZone: 'America/Guayaquil' };

// Obtener todos los profesores
profesorCtl.obtenerProfesores = async (req, res) => {
    try {
        const profesores = await profesor.findAll({
            attributes: [
                'idProfesor',
                'nombre',
                'apellido',
                'gmail',
                'telefono',
                'especialidad',
                'horario_trabajo',
                'dia',
                'inicio',
                'fin',
                'experiencia',
                'formacion_academica',
                'stateProfesor',
                'createProfesor',
                'updateProfesor'
            ],
            order: [['idProfesor', 'ASC']]
        });

        res.status(200).json({
            success: true,
            data: profesores
        });
    } catch (error) {
        console.error('Error al obtener profesores:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener profesores',
            error: error.message
        });
    }
};

// Obtener un profesor por ID
profesorCtl.obtenerProfesor = async (req, res) => {
    try {
        const { id } = req.params;

        const profesorEncontrado = await profesor.findByPk(id, {
            attributes: [
                'idProfesor',
                'nombre',
                'apellido',
                'gmail',
                'telefono',
                'especialidad',
                'horario_trabajo',
                'dia',
                'inicio',
                'fin',
                'experiencia',
                'formacion_academica',
                'stateProfesor',
                'createProfesor',
                'updateProfesor'
            ]
        });

        if (!profesorEncontrado) {
            return res.status(404).json({
                success: false,
                message: 'Profesor no encontrado'
            });
        }

        res.status(200).json({
            success: true,
            data: profesorEncontrado
        });
    } catch (error) {
        console.error('Error al obtener profesor:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener profesor',
            error: error.message
        });
    }
};

// Crear nuevo profesor
profesorCtl.crearProfesor = async (req, res) => {
    const t = await profesor.sequelize.transaction();
    try {
        const { 
            nombre, 
            apellido, 
            gmail, 
            telefono, 
            especialidad,
            horario_trabajo,
            dia,
            inicio,
            fin,
            experiencia,
            formacion_academica,
            stateProfesor = 'active'
        } = req.body;

        // Validaciones básicas
        if (!nombre || !apellido || !gmail || !telefono || !especialidad) {
            await t.rollback();
            return res.status(400).json({
                success: false,
                message: 'Faltan campos requeridos: nombre, apellido, gmail, telefono, especialidad'
            });
        }

        // Verificar si el email ya existe
        const profesorConEmail = await profesor.findOne({ 
            where: { gmail },
            transaction: t 
        });

        if (profesorConEmail) {
            await t.rollback();
            return res.status(400).json({
                success: false,
                message: 'El correo electrónico ya está registrado'
            });
        }

        // Verificar si el teléfono ya existe
        const profesorConTelefono = await profesor.findOne({ 
            where: { telefono },
            transaction: t 
        });

        if (profesorConTelefono) {
            await t.rollback();
            return res.status(400).json({
                success: false,
                message: 'El número de teléfono ya está registrado'
            });
        }

        // Crear profesor (idProfesor será autoincremental)
        const currentTime = new Date().toLocaleString('es-EC', configTimeZone);
        const nuevoProfesor = await profesor.create({
            nombre,
            apellido,
            gmail,
            telefono,
            especialidad,
            horario_trabajo: horario_trabajo || null,
            dia: dia || null,
            inicio: inicio || null,
            fin: fin || null,
            experiencia: experiencia || null,
            formacion_academica: formacion_academica || null,
            stateProfesor,
            createProfesor: currentTime,
            updateProfesor: currentTime
        }, { transaction: t });

        await t.commit();

        res.status(201).json({
            success: true,
            message: 'Profesor creado exitosamente',
            data: {
                idProfesor: nuevoProfesor.idProfesor, // ID autoincremental
                nombre,
                apellido
            }
        });
    } catch (error) {
        await t.rollback();
        console.error('Error al crear profesor:', error);
        
        let errorMessage = 'Error al crear profesor';
        if (error.name === 'SequelizeUniqueConstraintError') {
            if (error.fields && error.fields.gmail) {
                errorMessage = 'El correo electrónico ya está registrado';
            } else if (error.fields && error.fields.telefono) {
                errorMessage = 'El número de teléfono ya está registrado';
            }
        }

        res.status(500).json({
            success: false,
            message: errorMessage,
            error: error.message
        });
    }
};

// Actualizar profesor
profesorCtl.actualizarProfesor = async (req, res) => {
    const t = await profesor.sequelize.transaction();
    try {
        const { id } = req.params;
        const { 
            nombre, 
            apellido, 
            gmail, 
            telefono, 
            especialidad,
            horario_trabajo,
            dia,
            inicio,
            fin,
            experiencia,
            formacion_academica,
            stateProfesor
        } = req.body;

        // Verificar existencia
        const profesorExistente = await profesor.findByPk(id);
        if (!profesorExistente) {
            await t.rollback();
            return res.status(404).json({
                success: false,
                message: 'Profesor no encontrado'
            });
        }

        // Verificar si el nuevo email ya existe
        if (gmail && gmail !== profesorExistente.gmail) {
            const profesorConEmail = await profesor.findOne({ 
                where: { gmail },
                transaction: t 
            });
            
            if (profesorConEmail) {
                await t.rollback();
                return res.status(400).json({
                    success: false,
                    message: 'El nuevo correo electrónico ya está registrado'
                });
            }
        }

        // Verificar si el nuevo teléfono ya existe
        if (telefono && telefono !== profesorExistente.telefono) {
            const profesorConTelefono = await profesor.findOne({ 
                where: { telefono },
                transaction: t 
            });
            
            if (profesorConTelefono) {
                await t.rollback();
                return res.status(400).json({
                    success: false,
                    message: 'El nuevo número de teléfono ya está registrado'
                });
            }
        }

        // Actualizar profesor
        const currentTime = new Date().toLocaleString('es-EC', configTimeZone);
        await profesor.update({
            nombre: nombre || profesorExistente.nombre,
            apellido: apellido || profesorExistente.apellido,
            gmail: gmail || profesorExistente.gmail,
            telefono: telefono || profesorExistente.telefono,
            especialidad: especialidad || profesorExistente.especialidad,
            horario_trabajo: horario_trabajo !== undefined ? horario_trabajo : profesorExistente.horario_trabajo,
            dia: dia !== undefined ? dia : profesorExistente.dia,
            inicio: inicio !== undefined ? inicio : profesorExistente.inicio,
            fin: fin !== undefined ? fin : profesorExistente.fin,
            experiencia: experiencia !== undefined ? experiencia : profesorExistente.experiencia,
            formacion_academica: formacion_academica !== undefined ? formacion_academica : profesorExistente.formacion_academica,
            stateProfesor: stateProfesor || profesorExistente.stateProfesor,
            updateProfesor: currentTime
        }, {
            where: { idProfesor: id },
            transaction: t
        });

        await t.commit();

        res.status(200).json({
            success: true,
            message: 'Profesor actualizado exitosamente'
        });
    } catch (error) {
        await t.rollback();
        console.error('Error al actualizar profesor:', error);
        
        let errorMessage = 'Error al actualizar profesor';
        if (error.name === 'SequelizeUniqueConstraintError') {
            if (error.fields && error.fields.gmail) {
                errorMessage = 'El correo electrónico ya está registrado';
            } else if (error.fields && error.fields.telefono) {
                errorMessage = 'El número de teléfono ya está registrado';
            }
        }

        res.status(500).json({
            success: false,
            message: errorMessage,
            error: error.message
        });
    }
};

// Cambiar estado del profesor
profesorCtl.cambiarEstado = async (req, res) => {
    const t = await profesor.sequelize.transaction();
    try {
        const { id } = req.params;
        const { stateProfesor } = req.body; // Expects 'active' or 'inactive'

        // Validar estado
        if (!['active', 'inactive'].includes(stateProfesor)) {
            await t.rollback();
            return res.status(400).json({
                success: false,
                message: 'Estado no válido (solo "active" o "inactive")'
            });
        }

        // Verificar existencia
        const profesorExistente = await profesor.findByPk(id);
        if (!profesorExistente) {
            await t.rollback();
            return res.status(404).json({
                success: false,
                message: 'Profesor no encontrado'
            });
        }

        // Actualizar estado
        const currentTime = new Date().toLocaleString('es-EC', configTimeZone);
        await profesor.update({
            stateProfesor, // Set to the new state received
            updateProfesor: currentTime
        }, {
            where: { idProfesor: id },
            transaction: t
        });

        await t.commit();

        res.status(200).json({
            success: true,
            message: 'Estado del profesor actualizado exitosamente'
        });
    } catch (error) {
        await t.rollback();
        console.error('Error al cambiar estado del profesor:', error);

        if (error.name === 'SequelizeDatabaseError' || error.message.includes('NetworkError')) {
            return res.status(503).json({
                success: false,
                message: 'Error de conexión con la base de datos. Intente nuevamente.',
                error: 'NetworkError when attempting to fetch resource'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Error al cambiar estado del profesor',
            error: error.message
        });
    }
};

// Eliminar profesor (cambiar estado a inactive)
// Eliminar profesor (eliminación física)
profesorCtl.eliminarProfesor = async (req, res) => {
    const t = await profesor.sequelize.transaction();
    try {
        const { id } = req.params;

        // Verificar existencia
        const profesorExistente = await profesor.findByPk(id, { transaction: t });
        if (!profesorExistente) {
            await t.rollback();
            return res.status(404).json({
                success: false,
                message: 'Profesor no encontrado'
            });
        }

        // Eliminar físicamente el profesor
        await profesor.destroy({
            where: { idProfesor: id },
            transaction: t
        });

        await t.commit();

        res.status(200).json({
            success: true,
            message: 'Profesor eliminado exitosamente'
        });
    } catch (error) {
        await t.rollback();
        console.error('Error al eliminar profesor:', error);

        if (error.name === 'SequelizeDatabaseError' || error.message.includes('NetworkError')) {
            return res.status(503).json({
                success: false,
                message: 'Error de conexión con la base de datos. Intente nuevamente.',
                error: 'NetworkError when attempting to fetch resource'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Error al eliminar profesor',
            error: error.message
        });
    }
};

module.exports = profesorCtl;