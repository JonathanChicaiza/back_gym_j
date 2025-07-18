const express = require('express');
const router = express.Router();
const {
  obtenerUsuarios,
  obtenerUsuario,
  crearUsuario,
  actualizarUsuario,
  eliminarUsuario,
  cambiarPassword
} = require('../controller/usuario.controller');

// Rutas públicas
router.post('/', crearUsuario);

// Rutas protegidas (autenticación manejada en controlador)
router.get('/:id', obtenerUsuario);
router.put('/:id', actualizarUsuario);
router.delete('/:id', eliminarUsuario);
router.post('/:id/cambiar-password', cambiarPassword);

module.exports = router;