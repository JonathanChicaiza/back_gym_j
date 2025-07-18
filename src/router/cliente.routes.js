const express = require('express');
const router = express.Router();
const clienteController = require('../controller/cliente.controller');

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

// Obtener todos los clientes
router.get('/', async (req, res) => {
    try {
        const result = await clienteController.mostrarClientes(req, res);
        res.json({ 
            success: true, 
            data: result.clientes || [] 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: 'Error al obtener clientes',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Obtener un cliente por ID
router.get('/:id', async (req, res) => {
    try {
        const result = await clienteController.mostrarClientePorId(req, res);
        
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
            error: 'Error al obtener el cliente',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Crear un nuevo cliente
router.post('/', async (req, res) => {
    try {
        // Validación básica del body
        if (!req.body.idCliente || !req.body.telefono) {
            return res.status(400).json({
                success: false,
                error: 'idCliente y telefono son campos requeridos'
            });
        }

        const result = await clienteController.crearCliente(req, res);
        
        if (result.error) {
            return res.status(400).json({ 
                success: false, 
                error: result.error 
            });
        }
        
        res.status(201).json({ 
            success: true, 
            message: result.message,
            idCliente: result.idCliente 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: 'Error al crear el cliente',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Actualizar un cliente existente
router.put('/:id', async (req, res) => {
    try {
        const result = await clienteController.actualizarCliente(req, res);
        
        if (result.error) {
            return res.status(404).json({ 
                success: false, 
                error: result.error 
            });
        }
        
        res.json({ 
            success: true, 
            message: result.message,
            idCliente: result.idCliente 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: 'Error al actualizar el cliente',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Eliminar un cliente
router.delete('/:id', async (req, res) => {
    try {
        const result = await clienteController.eliminarCliente(req, res);
        
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
            error: 'Error al eliminar el cliente',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

module.exports = router;