const express = require('express');
const router = express.Router();
const {
  obtenerVenta,
  crearVenta,
  actualizarVenta,
  eliminarVenta
} = require('../controller/ventaProducto.controller');

// Routes
router.get('/:id', obtenerVenta);
router.post('/crear', crearVenta);
router.put('/:id', actualizarVenta);
router.delete('/:id', eliminarVenta);

module.exports = router;