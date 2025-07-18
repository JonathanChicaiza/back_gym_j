const express = require('express');
const router = express.Router();
const pagoController = require('../controller/pago.controller');

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

// Obtener todos los pagos
router.get('/', async (req, res) => {
    try {
        const result = await pagoController.mostrarPagos(req, res);
        res.json({ 
            success: true, 
            data: result.pagos || [] 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: 'Error al obtener los pagos' 
        });
    }
});

// Obtener un pago por ID
router.get('/:id', async (req, res) => {
    try {
        const result = await pagoController.mostrarPagoPorId(req, res);
        
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
            error: 'Error al obtener el pago' 
        });
    }
});

// Crear un nuevo pago
router.post('/', async (req, res) => {
    try {
        const result = await pagoController.crearPago(req, res);
        
        if (result.error) {
            return res.status(400).json({ 
                success: false, 
                error: result.error 
            });
        }
        
        res.status(201).json({ 
            success: true, 
            message: result.message,
            idPago: result.idPago 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: 'Error al crear el pago' 
        });
    }
});

// Actualizar un pago existente
router.put('/:id', async (req, res) => {
    try {
        const result = await pagoController.actualizarPago(req, res);
        
        if (result.error) {
            return res.status(404).json({ 
                success: false, 
                error: result.error 
            });
        }
        
        res.json({ 
            success: true, 
            message: result.message,
            idPago: result.idPago 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: 'Error al actualizar el pago' 
        });
    }
});

// Eliminar un pago
router.delete('/:id', async (req, res) => {
    try {
        const result = await pagoController.eliminarPago(req, res);
        
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
            error: 'Error al eliminar el pago' 
        });
    }
});

module.exports = router;