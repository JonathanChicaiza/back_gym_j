const express = require('express');
const router = express.Router();
const asistenciaController = require('../controller/asistencia.controller');

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

// Obtener todas las asistencias
router.get('/', async (req, res) => {
    try {
        const result = await asistenciaController.mostrarAsistencias(req, res);
        res.json({ 
            success: true, 
            data: result.asistencias || [] 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: 'Error al obtener asistencias',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Obtener una asistencia por ID
router.get('/:id', async (req, res) => {
    try {
        const result = await asistenciaController.mostrarAsistenciaPorId(req, res);
        
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
            error: 'Error al obtener la asistencia',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Crear una nueva asistencia
router.post('/', async (req, res) => {
    try {
        // Validación básica del body
        if (!req.body.clienteId || !req.body.claseId) {
            return res.status(400).json({
                success: false,
                error: 'clienteId y claseId son requeridos'
            });
        }

        const result = await asistenciaController.crearAsistencia(req, res);
        
        if (result.error) {
            return res.status(400).json({ 
                success: false, 
                error: result.error 
            });
        }
        
        res.status(201).json({ 
            success: true, 
            message: result.message,
            idAsistencia: result.idAsistencia 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: 'Error al crear la asistencia',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Actualizar una asistencia existente
router.put('/:id', async (req, res) => {
    try {
        const result = await asistenciaController.actualizarAsistencia(req, res);
        
        if (result.error) {
            return res.status(404).json({ 
                success: false, 
                error: result.error 
            });
        }
        
        res.json({ 
            success: true, 
            message: result.message,
            idAsistencia: result.idAsistencia 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: 'Error al actualizar la asistencia',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Eliminar una asistencia
router.delete('/:id', async (req, res) => {
    try {
        const result = await asistenciaController.eliminarAsistencia(req, res);
        
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
            error: 'Error al eliminar la asistencia',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

module.exports = router;