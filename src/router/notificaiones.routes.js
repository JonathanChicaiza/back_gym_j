const express = require('express');
const router = express.Router();
const notificacionController = require('../controller/notificacion.controller');
const { check } = require('express-validator');

// Middleware para validar ID
router.param('id', (req, res, next, id) => {
    if (!Number.isInteger(parseInt(id))) {
        return res.status(400).json({ 
            success: false,
            error: 'ID inválido, debe ser un número entero' 
        });
    }
    next();
});

// Obtener todas las notificaciones
router.get('/', async (req, res) => {
    try {
        const result = await notificacionController.mostrarNotificaciones(req, res);
        res.json({ 
            success: true, 
            data: result.notificaciones || [] 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: 'Error al obtener notificaciones',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Obtener una notificación por ID
router.get('/:id', async (req, res) => {
    try {
        const result = await notificacionController.mostrarNotificacionPorId(req, res);
        
        if (result.error) {
            return res.status(404).json({ 
                success: false, 
                error: result.error 
            });
        }
        
        res.json({ 
            success: true, 
            data: result 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: 'Error al obtener la notificación',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Crear una nueva notificación
router.post('/', [
    check('usuarioId').notEmpty().withMessage('El ID de usuario es requerido'),
    check('mensaje').notEmpty().withMessage('El mensaje es requerido'),
    check('mensaje').isLength({ max: 500 }).withMessage('El mensaje no puede exceder los 500 caracteres'),
    check('stateNotificacion').isBoolean().withMessage('El estado debe ser booleano')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const result = await notificacionController.crearNotificacion(req, res);
        
        if (result.error) {
            return res.status(400).json({ 
                success: false, 
                error: result.error 
            });
        }
        
        res.status(201).json({ 
            success: true, 
            message: result.message,
            idNotificacion: result.idNotificacion 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: 'Error al crear la notificación',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Actualizar una notificación existente
router.put('/:id', [
    check('mensaje').optional().isLength({ max: 500 }).withMessage('El mensaje no puede exceder los 500 caracteres'),
    check('stateNotificacion').optional().isBoolean().withMessage('El estado debe ser booleano'),
    check('leido').optional().isBoolean().withMessage('El campo leído debe ser booleano')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const result = await notificacionController.actualizarNotificacion(req, res);
        
        if (result.error) {
            return res.status(404).json({ 
                success: false, 
                error: result.error 
            });
        }
        
        res.json({ 
            success: true, 
            message: result.message,
            idNotificacion: result.idNotificacion 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: 'Error al actualizar la notificación',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Eliminar una notificación
router.delete('/:id', async (req, res) => {
    try {
        const result = await notificacionController.eliminarNotificacion(req, res);
        
        if (result.error) {
            return res.status(404).json({ 
                success: false, 
                error: result.error 
            });
        }
        
        res.json({ 
            success: true, 
            message: result.message 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: 'Error al eliminar la notificación',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Ruta adicional para marcar como leída
router.patch('/:id/marcar-leida', async (req, res) => {
    try {
        const result = await notificacionController.actualizarNotificacion({
            ...req,
            body: { ...req.body, leido: true }
        }, res);
        
        if (result.error) {
            return res.status(404).json({ 
                success: false, 
                error: result.error 
            });
        }
        
        res.json({ 
            success: true, 
            message: 'Notificación marcada como leída',
            idNotificacion: result.idNotificacion 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: 'Error al marcar la notificación como leída',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

module.exports = router;