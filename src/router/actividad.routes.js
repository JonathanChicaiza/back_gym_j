const express = require("express");
const router = express.Router();
const { 
    obtenerActividad,
    crearActividad,
    actualizarActividad,
    eliminarActividad
} = require('../controller/actividad.controller');

router.get('/:id', obtenerActividad);
router.post('/crear', crearActividad);
router.put('/:id', actualizarActividad);
router.delete('/:id', eliminarActividad);

module.exports = router;