const express = require('express');
const router = express.Router();
const profesorController = require('../controller/profesor.controller');

// Obtener datos del profesor (MySQL + MongoDB)
router.get('/', async (req, res) => {
    try {
        const result = await profesorController.mostrarProfesor(req, res);
        
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
            error: 'Error al obtener datos del profesor' 
        });
    }
});

// Crear un nuevo profesor (MySQL + MongoDB)
router.post('/', async (req, res) => {
    try {
        const result = await profesorController.crearProfesor(req, res);
        
        if (result.error) {
            return res.status(400).json({ 
                success: false, 
                error: result.error 
            });
        }
        
        res.status(201).json({ 
            success: true, 
            message: result.message 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: 'Error al crear el profesor' 
        });
    }
});

module.exports = router;