const express = require('express');
const router = express.Router();
const {
  obtenerEvaluacion,
  crearEvaluacion,
  actualizarEvaluacion,
  eliminarEvaluacion
} = require('../controller/evaluacion.cliente.controller');

// Rutas CRUD
router.get('/:id', obtenerEvaluacion);
router.post('/crear', crearEvaluacion);
router.put('/:id', actualizarEvaluacion);
router.delete('/:id', eliminarEvaluacion);

module.exports = router;