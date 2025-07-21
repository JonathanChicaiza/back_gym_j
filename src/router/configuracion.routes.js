const express = require('express');
const router = express.Router();
const {
  obtenerconfiguracion,
  crearconfiguracion,
  actualizarconfiguracion,
  eliminarconfiguracion
} = require('../controller/configuracion.controller');


// Rutas CRUD
router.get('/:id', obtenerconfiguracion);
router.post('/crear', crearconfiguracion);
router.put('/:id', actualizarconfiguracion);
router.delete('/:id', eliminarconfiguracion);

module.exports = router;