const express = require('express');
const router = express.Router();
const {
  obtenerEmpleado,
  crearEmpleado,
  actualizarEmpleado,
  eliminarEmpleado
} = require('../controller/empleado.controller');


// Rutas CRUD
router.get('/:id', obtenerEmpleado);
router.post('/crear', crearEmpleado);
router.put('/:id', actualizarEmpleado);
router.delete('/:id', eliminarEmpleado);

module.exports = router;