const express = require('express');
const router = express.Router();
const {
    obtenerUsuarios,
    obtenerUsuario,
    crearUsuario,
    actualizarUsuario,
    cambiarPassword
} = require('../controller/usuario.controller');

// Public routes (e.g., for registration)
router.post('/', crearUsuario); // This route might be better placed under an /auth prefix if it handles signup

// Routes for authenticated users (assuming these are protected by middleware elsewhere)
router.get('/', obtenerUsuarios); // Added a route to get all users
router.get('/:id', obtenerUsuario);
router.put('/:id', actualizarUsuario);
router.post('/:id/cambiar-password', cambiarPassword);

module.exports = router;