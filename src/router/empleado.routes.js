const express = require('express');
const router = express.Router();
const empleadoController = require('../controller/empleado.controller');

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

// Obtener todos los empleados
router.get('/', async (req, res) => {
    try {
        const result = await empleadoController.mostrarEmpleados(req, res);
        res.json({ 
            success: true, 
            data: result.empleados || [] 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: 'Error al obtener empleados',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Obtener un empleado por ID
router.get('/:id', async (req, res) => {
    try {
        const result = await empleadoController.mostrarEmpleadoPorId(req, res);
        
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
            error: 'Error al obtener el empleado',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Crear un nuevo empleado
router.post('/', async (req, res) => {
    try {
        // Validación básica del body
        if (!req.body.idEmpleado || !req.body.cargo) {
            return res.status(400).json({
                success: false,
                error: 'idEmpleado y cargo son campos requeridos'
            });
        }

        const result = await empleadoController.crearEmpleado(req, res);
        
        if (result.error) {
            return res.status(400).json({ 
                success: false, 
                error: result.error 
            });
        }
        
        res.status(201).json({ 
            success: true, 
            message: result.message,
            idEmpleado: result.idEmpleado 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: 'Error al crear el empleado',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Actualizar un empleado existente
router.put('/:id', async (req, res) => {
    try {
        const result = await empleadoController.actualizarEmpleado(req, res);
        
        if (result.error) {
            return res.status(404).json({ 
                success: false, 
                error: result.error 
            });
        }
        
        res.json({ 
            success: true, 
            message: result.message,
            idEmpleado: result.idEmpleado 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: 'Error al actualizar el empleado',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Eliminar un empleado
router.delete('/:id', async (req, res) => {
    try {
        const result = await empleadoController.eliminarEmpleado(req, res);
        
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
            error: 'Error al eliminar el empleado',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

module.exports = router;