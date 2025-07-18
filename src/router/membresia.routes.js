const express = require('express');
const router = express.Router();
const membresiaController = require('../controller/membresia.controller');
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

// Obtener todas las membresías
router.get('/', async (req, res) => {
    try {
        const result = await membresiaController.mostrarMembresias(req, res);
        res.json({ 
            success: true, 
            data: result.membresias || [] 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: 'Error al obtener membresías',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Obtener una membresía por ID
router.get('/:id', async (req, res) => {
    try {
        const result = await membresiaController.mostrarMembresiaPorId(req, res);
        
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
            error: 'Error al obtener la membresía',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Crear una nueva membresía
router.post('/', [
    check('nombre').notEmpty().withMessage('El nombre es requerido'),
    check('precio').isFloat({ min: 0 }).withMessage('El precio debe ser un número positivo'),
    check('duracionDias').isInt({ min: 1 }).withMessage('La duración debe ser al menos 1 día'),
    check('descripcion').optional().isString(),
    check('beneficios').optional().isArray()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const result = await membresiaController.crearMembresia(req, res);
        
        if (result.error) {
            return res.status(400).json({ 
                success: false, 
                error: result.error 
            });
        }
        
        res.status(201).json({ 
            success: true, 
            message: result.message,
            idMembresia: result.idMembresia 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: 'Error al crear la membresía',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Actualizar una membresía existente
router.put('/:id', [
    check('nombre').optional().notEmpty().withMessage('El nombre no puede estar vacío'),
    check('precio').optional().isFloat({ min: 0 }).withMessage('El precio debe ser un número positivo'),
    check('duracionDias').optional().isInt({ min: 1 }).withMessage('La duración debe ser al menos 1 día'),
    check('descripcion').optional().isString(),
    check('beneficios').optional().isArray()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const result = await membresiaController.actualizarMembresia(req, res);
        
        if (result.error) {
            return res.status(404).json({ 
                success: false, 
                error: result.error 
            });
        }
        
        res.json({ 
            success: true, 
            message: result.message,
            idMembresia: result.idMembresia 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: 'Error al actualizar la membresía',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Eliminar una membresía
router.delete('/:id', async (req, res) => {
    try {
        const result = await membresiaController.eliminarMembresia(req, res);
        
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
            error: 'Error al eliminar la membresía',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

module.exports = router;