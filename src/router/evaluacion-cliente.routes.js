const express = require('express');
const router = express.Router();
const evaluacionClienteController = require('../controller/evaluacion.cliente.controller');

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

// Obtener todas las evaluaciones
router.get('/', async (req, res) => {
    try {
        const result = await evaluacionClienteController.mostrarEvaluaciones(req, res);
        res.json({ 
            success: true, 
            data: result.evaluaciones || [] 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: 'Error al obtener evaluaciones',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Obtener una evaluación por ID
router.get('/:id', async (req, res) => {
    try {
        const result = await evaluacionClienteController.mostrarEvaluacionPorId(req, res);
        
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
            error: 'Error al obtener la evaluación',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Crear una nueva evaluación
router.post('/', async (req, res) => {
    try {
        // Validación básica del body
        if (!req.body.clienteId || !req.body.claseId || !req.body.puntuacion) {
            return res.status(400).json({
                success: false,
                error: 'clienteId, claseId y puntuacion son campos requeridos'
            });
        }

        // Validar que la puntuación esté entre 1 y 5
        if (req.body.puntuacion < 1 || req.body.puntuacion > 5) {
            return res.status(400).json({
                success: false,
                error: 'La puntuación debe estar entre 1 y 5'
            });
        }

        const result = await evaluacionClienteController.crearEvaluacion(req, res);
        
        if (result.error) {
            return res.status(400).json({ 
                success: false, 
                error: result.error 
            });
        }
        
        res.status(201).json({ 
            success: true, 
            message: result.message,
            idEvaluacion: result.idEvaluacion 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: 'Error al crear la evaluación',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Actualizar una evaluación existente
router.put('/:id', async (req, res) => {
    try {
        // Validar puntuación si está presente
        if (req.body.puntuacion && (req.body.puntuacion < 1 || req.body.puntuacion > 5)) {
            return res.status(400).json({
                success: false,
                error: 'La puntuación debe estar entre 1 y 5'
            });
        }

        const result = await evaluacionClienteController.actualizarEvaluacion(req, res);
        
        if (result.error) {
            return res.status(404).json({ 
                success: false, 
                error: result.error 
            });
        }
        
        res.json({ 
            success: true, 
            message: result.message,
            idEvaluacion: result.idEvaluacion 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: 'Error al actualizar la evaluación',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Eliminar una evaluación
router.delete('/:id', async (req, res) => {
    try {
        const result = await evaluacionClienteController.eliminarEvaluacion(req, res);
        
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
            error: 'Error al eliminar la evaluación',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

module.exports = router;