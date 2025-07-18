const express = require('express');
const router = express.Router();
const fichaEntrenamientoController = require('../controller/fichaEntrenamiento.controller');

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

// Obtener todas las fichas de entrenamiento
router.get('/', async (req, res) => {
    try {
        const result = await fichaEntrenamientoController.mostrarFichas(req, res);
        res.json({ 
            success: true, 
            data: result.fichas || [] 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: 'Error al obtener fichas de entrenamiento',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Obtener una ficha por ID
router.get('/:id', async (req, res) => {
    try {
        const result = await fichaEntrenamientoController.mostrarFichaPorId(req, res);
        
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
            error: 'Error al obtener la ficha de entrenamiento',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Crear una nueva ficha de entrenamiento
router.post('/', async (req, res) => {
    try {
        // Validación básica del body
        if (!req.body.clienteId || !req.body.profesorId) {
            return res.status(400).json({
                success: false,
                error: 'clienteId y profesorId son campos requeridos'
            });
        }

        const result = await fichaEntrenamientoController.crearFicha(req, res);
        
        if (result.error) {
            return res.status(400).json({ 
                success: false, 
                error: result.error 
            });
        }
        
        res.status(201).json({ 
            success: true, 
            message: result.message,
            idFicha: result.idFicha 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: 'Error al crear la ficha de entrenamiento',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Actualizar una ficha existente
router.put('/:id', async (req, res) => {
    try {
        const result = await fichaEntrenamientoController.actualizarFicha(req, res);
        
        if (result.error) {
            return res.status(404).json({ 
                success: false, 
                error: result.error 
            });
        }
        
        res.json({ 
            success: true, 
            message: result.message,
            idFicha: result.idFicha 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: 'Error al actualizar la ficha de entrenamiento',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Eliminar una ficha
router.delete('/:id', async (req, res) => {
    try {
        const result = await fichaEntrenamientoController.eliminarFicha(req, res);
        
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
            error: 'Error al eliminar la ficha de entrenamiento',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

module.exports = router;