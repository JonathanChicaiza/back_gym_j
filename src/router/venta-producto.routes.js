const express = require('express');
const router = express.Router();
const ventaProductoController = require('../controller/ventaProducto.controller');

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

// Obtener todas las ventas de productos
router.get('/', async (req, res) => {
    try {
        const result = await ventaProductoController.mostrarVentas(req, res);
        res.json({ 
            success: true, 
            data: result.ventas || [] 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: 'Error al obtener ventas de productos' 
        });
    }
});

// Obtener una venta de producto por ID
router.get('/:id', async (req, res) => {
    try {
        const result = await ventaProductoController.mostrarVentaPorId(req, res);
        
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
            error: 'Error al obtener la venta de producto' 
        });
    }
});

// Crear una nueva venta de producto
router.post('/', async (req, res) => {
    try {
        const result = await ventaProductoController.crearVenta(req, res);
        
        if (result.error) {
            return res.status(400).json({ 
                success: false, 
                error: result.error 
            });
        }
        
        res.status(201).json({ 
            success: true, 
            message: result.message,
            idVenta: result.idVenta 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: 'Error al crear la venta de producto' 
        });
    }
});

// Actualizar una venta de producto existente
router.put('/:id', async (req, res) => {
    try {
        const result = await ventaProductoController.actualizarVenta(req, res);
        
        if (result.error) {
            return res.status(404).json({ 
                success: false, 
                error: result.error 
            });
        }
        
        res.json({ 
            success: true, 
            message: result.message,
            idVenta: result.idVenta 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: 'Error al actualizar la venta de producto' 
        });
    }
});

// Eliminar una venta de producto
router.delete('/:id', async (req, res) => {
    try {
        const result = await ventaProductoController.eliminarVenta(req, res);
        
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
            error: 'Error al eliminar la venta de producto' 
        });
    }
});

module.exports = router;