const express = require('express');
const router = express.Router();
const {
  obtenerProducto,
  crearProducto,
  actualizarProducto,
  eliminarProducto
} = require('../controller/producto.controller');

// Rutas CRUD
router.get('/:id', obtenerProducto);
router.post('/crear', crearProducto);
router.put('/:id', actualizarProducto);
router.delete('/:id', eliminarProducto);

module.exports = router;