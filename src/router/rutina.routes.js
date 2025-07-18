const express = require('express');
const router = express.Router();
const rutinaController = require('../controller/rutina.controller');

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

// Obtener todas las rutinas
router.get('/', async (req, res) => {
    try {
        const result = await rutinaController.mostrarRutinas(req, res);
        res.json({ 
            success: true, 
            data: result.rutinas || [] 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: 'Error al obtener las rutinas' 
        });
    }
});

// Obtener una rutina por ID
router.get('/:id', async (req, res) => {
    try {
        const result = await rutinaController.mostrarRutinaPorId(req, res);
        
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
            error: 'Error al obtener la rutina' 
        });
    }
});

// Crear una nueva rutina
router.post('/', async (req, res) => {
    try {
        const result = await rutinaController.crearRutina(req, res);
        
        if (result.error) {
            return res.status(400).json({ 
                success: false, 
                error: result.error 
            });
        }
        
        res.status(201).json({ 
            success: true, 
            message: result.message,
            idRutina: result.idRutina 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: 'Error al crear la rutina' 
        });
    }
});

// Actualizar una rutina existente
router.put('/:id', async (req, res) => {
    try {
        const result = await rutinaController.actualizarRutina(req, res);
        
        if (result.error) {
            return res.status(404).json({ 
                success: false, 
                error: result.error 
            });
        }
        
        res.json({ 
            success: true, 
            message: result.message,
            idRutina: result.idRutina 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: 'Error al actualizar la rutina' 
        });
    }
});

// Eliminar una rutina
router.delete('/:id', async (req, res) => {
    try {
        const result = await rutinaController.eliminarRutina(req, res);
        
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
            error: 'Error al eliminar la rutina' 
        });
    }
});

module.exports = router;