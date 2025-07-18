const express = require('express');
const router = express.Router();
const {
  obtenerClase,
  crearClase,
  actualizarClase,
  eliminarClase
} = require('../controller/clase.controller');

// Rutas CRUD
router.get('/:id', obtenerClase);
router.post('/crear', crearClase);
router.put('/:id', actualizarClase);
router.delete('/:id', eliminarClase);

module.exports = router;