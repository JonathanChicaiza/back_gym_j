const express = require('express');
const router = express.Router();
const visitaController = require('../controller/visita.controller');

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

// Obtener todas las visitas
router.get('/', async (req, res) => {
    try {
        const result = await visitaController.mostrarVisitas(req, res);
        res.json({ 
            success: true, 
            data: result.visitas || [] 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: 'Error al obtener visitas' 
        });
    }
});

// Obtener una visita por ID
router.get('/:id', async (req, res) => {
    try {
        const result = await visitaController.mostrarVisitaPorId(req, res);
        
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
            error: 'Error al obtener la visita' 
        });
    }
});

// Crear una nueva visita
router.post('/', async (req, res) => {
    try {
        const result = await visitaController.crearVisita(req, res);
        
        if (result.error) {
            return res.status(400).json({ 
                success: false, 
                error: result.error 
            });
        }
        
        res.status(201).json({ 
            success: true, 
            message: result.message,
            idVisita: result.idVisita 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: 'Error al crear la visita' 
        });
    }
});

// Actualizar una visita existente
router.put('/:id', async (req, res) => {
    try {
        const result = await visitaController.actualizarVisita(req, res);
        
        if (result.error) {
            return res.status(404).json({ 
                success: false, 
                error: result.error 
            });
        }
        
        res.json({ 
            success: true, 
            message: result.message,
            idVisita: result.idVisita 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: 'Error al actualizar la visita' 
        });
    }
});

// Eliminar una visita
router.delete('/:id', async (req, res) => {
    try {
        const result = await visitaController.eliminarVisita(req, res);
        
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
            error: 'Error al eliminar la visita' 
        });
    }
});

module.exports = router;