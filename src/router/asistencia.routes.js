const express = require('express');
const router = express.Router();
const { 
    obtenerAsistencia,
    crearAsistencia,
    actualizarAsistencia,
    eliminarAsistencia
} = require('../controller/asistencia.controller');



// Obtener una asistencia por ID
router.get('/:id', obtenerAsistencia);

// Crear una nueva asistencia
router.post('/crear', crearAsistencia);

// Actualizar una asistencia existente
router.put('/:id', actualizarAsistencia);

// Eliminar una asistencia
router.delete('/:id', eliminarAsistencia);

module.exports = router;