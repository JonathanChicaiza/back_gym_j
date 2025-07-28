const express = require('express');
const router = express.Router();

const {
    obtenerProfesores,
    obtenerProfesor,
    crearProfesor,
    actualizarProfesor,
    eliminarProfesor,
    cambiarEstado
} = require('../controller/profesor.controller');

// Rutas para profesores
router.get('/', obtenerProfesores);
router.get('/:id', obtenerProfesor);
router.post('/', crearProfesor);
router.put('/:id', actualizarProfesor);
router.delete('/:id', eliminarProfesor);
router.patch('/:id/estado', cambiarEstado); // Cambiado a PATCH que es más semántico para cambios de estado

module.exports = router;