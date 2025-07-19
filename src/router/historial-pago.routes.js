const express = require('express');
const router = express.Router();
const { 

  obtenerHistorial,
  crearHistorial,
  actualizarHistorial,
  eliminarHistorial
} = require('../controller/historialPago.controller');
const { verificarToken, verificarRol } = require('../lib/auth');

// Middleware para todas las rutas
router.use(verificarToken);

// Rutas CRUD con protección de roles
router.get('/:id', verificarRol(['admin', 'contador']), obtenerHistorial);
router.post('/', verificarRol(['admin', 'contador']), crearHistorial);
router.put('/:id', verificarRol(['admin', 'contador']), actualizarHistorial);
router.delete('/:id', verificarRol(['admin']), eliminarHistorial);

module.exports = router;