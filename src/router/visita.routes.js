const express = require('express');
const router = express.Router();
const {
  obtenerVisita,
  crearVisita,

  eliminarVisita
} = require('../controller/visita.controller');

// Routes
router.get('/:id', obtenerVisita);
router.post('/crear', crearVisita);
router.delete('/:id', eliminarVisita);

module.exports = router;