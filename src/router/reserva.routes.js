const express = require('express');
const router = express.Router();
const reservaController = require('../controller/reserva.controller');

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

// Obtener todas las reservas
router.get('/', async (req, res) => {
    try {
        const result = await reservaController.mostrarReservas(req, res);
        res.json({ 
            success: true, 
            data: result.reservas || [] 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: 'Error al obtener las reservas' 
        });
    }
});

// Obtener una reserva por ID
router.get('/:id', async (req, res) => {
    try {
        const result = await reservaController.mostrarReservaPorId(req, res);
        
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
            error: 'Error al obtener la reserva' 
        });
    }
});

// Crear una nueva reserva
router.post('/', async (req, res) => {
    try {
        const result = await reservaController.crearReserva(req, res);
        
        if (result.error) {
            return res.status(400).json({ 
                success: false, 
                error: result.error 
            });
        }
        
        res.status(201).json({ 
            success: true, 
            message: result.message,
            idReserva: result.idReserva 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: 'Error al crear la reserva' 
        });
    }
});

// Actualizar una reserva existente
router.put('/:id', async (req, res) => {
    try {
        const result = await reservaController.actualizarReserva(req, res);
        
        if (result.error) {
            return res.status(404).json({ 
                success: false, 
                error: result.error 
            });
        }
        
        res.json({ 
            success: true, 
            message: result.message,
            idReserva: result.idReserva 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: 'Error al actualizar la reserva' 
        });
    }
});

// Eliminar una reserva
router.delete('/:id', async (req, res) => {
    try {
        const result = await reservaController.eliminarReserva(req, res);
        
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
            error: 'Error al eliminar la reserva' 
        });
    }
});

module.exports = router;