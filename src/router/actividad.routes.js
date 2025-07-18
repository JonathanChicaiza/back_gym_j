const express = require('express');
const router = express.Router();
const actividadController = require('../controller/actividad.controller');

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

// Obtener todas las actividades
router.get('/', async (req, res) => {
    try {
        const result = await actividadController.mostrarActividades(req, res);
        res.json({ 
            success: true, 
            data: result.actividades || [] 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: 'Error al obtener actividades' 
        });
    }
});

// Obtener una actividad por ID
router.get('/:id', async (req, res) => {
    try {
        const result = await actividadController.mostrarActividadPorId(req, res);
        
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
            error: 'Error al obtener la actividad' 
        });
    }
});

// Crear una nueva actividad
router.post('/', async (req, res) => {
    try {
        const result = await actividadController.crearActividad(req, res);
        
        if (result.error) {
            return res.status(400).json({ 
                success: false, 
                error: result.error 
            });
        }
        
        res.status(201).json({ 
            success: true, 
            message: result.message,
            idLog: result.idLog 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: 'Error al crear la actividad' 
        });
    }
});

// Actualizar una actividad existente
router.put('/:id', async (req, res) => {
    try {
        const result = await actividadController.actualizarActividad(req, res);
        
        if (result.error) {
            return res.status(404).json({ 
                success: false, 
                error: result.error 
            });
        }
        
        res.json({ 
            success: true, 
            message: result.message,
            idLog: result.idLog 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: 'Error al actualizar la actividad' 
        });
    }
});

// Eliminar una actividad
router.delete('/:id', async (req, res) => {
    try {
        const result = await actividadController.eliminarActividad(req, res);
        
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
            error: 'Error al eliminar la actividad' 
        });
    }
});

module.exports = router;