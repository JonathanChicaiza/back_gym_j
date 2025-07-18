const express = require('express');
const router = express.Router();
const {
  obtenerMembresias,
  obtenerMembresia,
  crearMembresia,
  actualizarMembresia,
  eliminarMembresia
} = require('../controller/membresia.controller');

// Rutas CRUD básicas
router.get('/:id', obtenerMembresia);
router.post('/crear', crearMembresia);
router.put('/:id', actualizarMembresia);
router.delete('/:id', eliminarMembresia);

module.exports = router;