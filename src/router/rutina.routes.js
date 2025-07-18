const express = require('express');
const router = express.Router();
const {
  obtenerRutinas,
  obtenerRutina,
  crearRutina,
  actualizarRutina,
  eliminarRutina
} = require('../controller/rutina.controller');

// Rutas CRUD
router.get('/:id', obtenerRutina);
router.post('/crear', crearRutina);
router.get('/obtener', obtenerRutinas);
router.put('/:id', actualizarRutina);
router.delete('/:id', eliminarRutina);

module.exports = router;