const express = require('express');
const router = express.Router();
const {
  obtenerPago,
  crearPago,
  actualizarPago,
  eliminarPago
} = require('../controller/pago.controller');

// Rutas CRUD básicas
router.get('/:id', obtenerPago);
router.post('/crear', crearPago);
router.put('/:id', actualizarPago);
router.delete('/:id', eliminarPago);

module.exports = router;