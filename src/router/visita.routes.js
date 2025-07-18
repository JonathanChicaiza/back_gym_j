const express = require('express');
const router = express.Router();
const {
  obtenerVisita,
  crearVisita,
  actualizarVisita,
  eliminarVisita
} = require('../controller/visita.controller');

// Routes
router.get('/:id', obtenerVisita);
router.post('/crear', crearVisita);
router.put('/:id', actualizarVisita);
router.delete('/:id', eliminarVisita);

module.exports = router;