const express = require("express");
const router = express.Router();
const { 
    obtenerActividades, // Añadido para obtener todas
    obtenerActividad,
    crearActividad,
    actualizarActividad,
    eliminarActividad
} = require('../controller/actividad.controller');

router.get('/', obtenerActividades); // Nueva ruta para obtener todas
router.get('/:id', obtenerActividad);
router.post('/', crearActividad); // Simplificado
router.put('/:id', actualizarActividad);
router.delete('/:id', eliminarActividad);

module.exports = router;