const express = require('express');
const router = express.Router();
const {
  obtenerNotificacion,
  actualizarNotificacion,
  eliminarNotificacion,
} = require('../controller/notificacion.controller');

// Rutas CRUD
router.get('/:id', obtenerNotificacion);
router.put('/:id',  actualizarNotificacion);
router.delete('/:id', eliminarNotificacion);

module.exports = router;