const express = require('express');
const router = express.Router();
const inventarioController = require('../controller/inventario.controller');
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

// Obtener todos los inventarios
router.get('/', async (req, res) => {
    try {
        const result = await inventarioController.mostrarInventarios(req, res);
        res.json({ 
            success: true, 
            data: result.inventarios || [] 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: 'Error al obtener los inventarios',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Obtener un inventario por ID
router.get('/:id', async (req, res) => {
    try {
        const result = await inventarioController.mostrarInventarioPorId(req, res);
        
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
            error: 'Error al obtener el inventario',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Crear un nuevo registro de inventario
router.post('/', [
    check('productoId').notEmpty().withMessage('El ID del producto es requerido'),
    check('cantidad').isInt({ min: 0 }).withMessage('La cantidad debe ser un número entero positivo')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const result = await inventarioController.crearInventario(req, res);
        
        if (result.error) {
            return res.status(400).json({ 
                success: false, 
                error: result.error 
            });
        }
        
        res.status(201).json({ 
            success: true, 
            message: result.message,
            idInventario: result.idInventario 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: 'Error al crear el inventario',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Actualizar un registro de inventario
router.put('/:id', [
    check('cantidad').optional().isInt({ min: 0 }).withMessage('La cantidad debe ser un número entero positivo')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const result = await inventarioController.actualizarInventario(req, res);
        
        if (result.error) {
            return res.status(404).json({ 
                success: false, 
                error: result.error 
            });
        }
        
        res.json({ 
            success: true, 
            message: result.message,
            idInventario: result.idInventario 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: 'Error al actualizar el inventario',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Eliminar un registro de inventario
router.delete('/:id', async (req, res) => {
    try {
        const result = await inventarioController.eliminarInventario(req, res);
        
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
            error: 'Error al eliminar el inventario',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

module.exports = router;