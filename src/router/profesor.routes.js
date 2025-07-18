const express = require('express');
const router = express.Router();
const {
  mostrarProfesor,
  crearProfesor
} = require('../controller/profesor.controller');

// Rutas básicas
router.get('/mostrar', mostrarProfesor);
router.post('/crear', crearProfesor);

module.exports = router;