const express = require('express');
const router = express.Router();
const productoController = require('../controller/producto.controller');

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

// Obtener todos los productos
router.get('/', async (req, res) => {
    try {
        const result = await productoController.mostrarProductos(req, res);
        res.json({ 
            success: true, 
            data: result.productos || [] 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: 'Error al obtener los productos' 
        });
    }
});

// Obtener un producto por ID
router.get('/:id', async (req, res) => {
    try {
        const result = await productoController.mostrarProductoPorId(req, res);
        
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
            error: 'Error al obtener el producto' 
        });
    }
});

// Crear un nuevo producto
router.post('/', async (req, res) => {
    try {
        const result = await productoController.crearProducto(req, res);
        
        if (result.error) {
            return res.status(400).json({ 
                success: false, 
                error: result.error 
            });
        }
        
        res.status(201).json({ 
            success: true, 
            message: result.message,
            idProducto: result.idProducto 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: 'Error al crear el producto' 
        });
    }
});

// Actualizar un producto existente
router.put('/:id', async (req, res) => {
    try {
        const result = await productoController.actualizarProducto(req, res);
        
        if (result.error) {
            return res.status(404).json({ 
                success: false, 
                error: result.error 
            });
        }
        
        res.json({ 
            success: true, 
            message: result.message,
            idProducto: result.idProducto 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: 'Error al actualizar el producto' 
        });
    }
});

// Eliminar un producto
router.delete('/:id', async (req, res) => {
    try {
        const result = await productoController.eliminarProducto(req, res);
        
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
            error: 'Error al eliminar el producto' 
        });
    }
});

module.exports = router;