const express = require('express');
const router = express.Router();
const { 
  obtenerInventario,
  crearInventario,
  actualizarInventario,
  eliminarInventario
} = require('../controller/inventario.controller');

// Rutas CRUD
router.get('/:id', obtenerInventario);
router.post('/crear', crearInventario);
router.put('/:id', actualizarInventario);
router.delete('/:id', eliminarInventario);

module.exports = router;