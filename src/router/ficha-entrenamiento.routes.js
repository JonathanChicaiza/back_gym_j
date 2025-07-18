const express = require('express');
const router = express.Router();
const {
  obtenerFicha,
  crearFicha,
  actualizarFicha,
  eliminarFicha
} = require('../controller/fichaEntrenamiento.controller');

// Rutas CRUD
router.get('/:id', obtenerFicha);
router.post('/crear', crearFicha);
router.put('/:id', actualizarFicha);
router.delete('/:id', eliminarFicha);

module.exports = router;