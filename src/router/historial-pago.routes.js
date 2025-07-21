const express = require('express');
const router = express.Router();

const {
    obtenerHistorialPago,
    crearHistorialPago,
    actualizarHistorialPago,
    eliminarHistorialPago
} = require('../controller/historialPago.controller');

router.get('/:id', obtenerHistorialPago);
router.post('/crear', crearHistorialPago);
router.put('/:id', actualizarHistorialPago);
router.delete('/:id', eliminarHistorialPago);

module.exports = router;
